import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { TimeLine, Timesheet } from '../model/productivityModel';
import { ReportsService } from '../reports.service';
import { ProjectService } from 'src/app/Project/project.service';
import { ExportService } from 'src/app/_services/export.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { CommonService } from 'src/app/common/common.service';
@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],

})

export class TimelineComponent implements OnInit {
  projectList: any;
  userId: string;
  projectId: string;
  members: any;
  member: any;
  fromDate: any;
  toDate: any;
  totalHours: number = 0;
  searchText = '';
  currentDate: Date = new Date();
  diff: any = this.currentDate.getDate() - this.currentDate.getDay() + (this.currentDate.getDay() === 0 ? -6 : 1);
  lastday: any = this.currentDate.getDate() - (this.currentDate.getDay() - 1) + 6;
  timeline: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  selectedTask: any = [];
  roleId = localStorage.getItem('roleId');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'
  daysOfWeek: any = [];
  allComplete: boolean = false;
  selectedDate: any = this.datepipe.transform(new Date(), "yyyy-MM-dd");
  hours: number[] = [];
  startTime: Date;
  count: number = 0;

  constructor(
    private projectService: ProjectService,
    private timeLogService: TimeLogService,
    private exportService: ExportService,
    private reportService: ReportsService,
    public datepipe: DatePipe,
    public commonservice: CommonService
  ) { 
    this.fromDate = this.datepipe.transform(new Date(this.currentDate), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate), 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.getProjectList();
    this.populateUsers();
    this.getTimeLine();
  }
  getCurrentWeekDates() {
    let currentDate = new Date();
    let currentDay = currentDate.getDay() - 1;
    let currentMonday = new Date(currentDate.setDate(currentDate.getDate() - currentDay));
    let weekDates = [];

    for (let i = 0; i < 7; i++) {
      let nextDay = new Date(currentMonday);
      nextDay.setDate(currentMonday.getDate() + i);
      weekDates.push(nextDay);
    }

    return weekDates;
  }



  getProjectList() {
    //Admin and Manager can see the list of all projects
    if (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") {
      this.projectService.getprojectlist().subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
      });
    }
    else {
      this.projectService.getProjectByUserId(this.currentUser.id).subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
      });
    }
  }

  populateUsers() {
    this.members = [];
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.email });
    this.member = this.currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any; }) => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email != this.currentUser.email) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
          },
          error: error => {
            console.log('There was an error!', error);
          }
        });
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }

  filterData() {
    this.getTimeLine();
  }

  getTimeLine() {
    let timeline = new TimeLine();
    timeline.fromdate = new Date(this.selectedDate);
    timeline.todate = new Date(this.selectedDate);
    timeline.projects = this.selectedProject;
    timeline.users = (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") ? this.selectedUser : [this.currentUser.id];
    this.reportService.getTimeline(timeline).subscribe(result => {
      this.timeline = result.data;
      this.timeline.forEach((data) => {
        const logs = data.logs;
        const hoursDiff = this.getEarliestAndLatestLogTime(logs);
        for (let i = 0; i < hoursDiff; i++) {
          if (!this.hours.includes(i)) {
            this.hours.push(i);
          }
        }
        // Retrieve the start time of the first user
        if (logs.length > 0 && (!this.startTime || new Date(logs[0].startTime) < this.startTime)) {
          this.startTime = new Date(logs[0].startTime);
        }
      });
      
      
      console.log("Time Line :",this.timeline)
    }
    )
  }
  getEarliestAndLatestLogTime(logs: any[]) {
    const earliestLog = logs.reduce((earliest, current) => {
      return (new Date(current.startTime) < new Date(earliest.startTime)) ? current : earliest;
    });
    const latestLog = logs.reduce((latest, current) => {
      return (new Date(current.endTime) > new Date(latest.endTime)) ? current : latest;
    });
    const timeDiff = Math.abs(new Date(latestLog.endTime).getTime() - new Date(earliestLog.startTime).getTime());
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
    return hoursDiff;
  }
  isUserActiveInHour(logs: any[], hour: number): number {
    const start = new Date(logs[0].startTime);
    const end = new Date(logs[logs.length - 1].endTime);
  
    // Check if the specified hour is within the start and end times
    if (hour < start.getHours() || hour > end.getHours()) {
      return 0;
    }
  
    // Calculate the total time in minutes that the user is active
    let totalTime = 0;
    for (let i = 0; i < logs.length; i++) {
      const logStart = new Date(logs[i].startTime);
      const logEnd = new Date(logs[i].endTime);
  
      // Calculate the start and end times for the current log entry
      const logStartHour = logStart.getHours();
      const logStartMinute = logStart.getMinutes();
      const logEndHour = logEnd.getHours();
      const logEndMinute = logEnd.getMinutes();
  
      // Calculate the minutes that the user is active in the current hour
      let activeMinutes = 0;
      if (hour === logStartHour && hour === logEndHour) {
        activeMinutes = logEndMinute - logStartMinute;
      } else if (hour === logStartHour) {
        activeMinutes = 60 - logStartMinute;
      } else if (hour === logEndHour) {
        activeMinutes = logEndMinute;
      } else if (hour > logStartHour && hour < logEndHour) {
        activeMinutes = 60;
      }
  
      totalTime += activeMinutes;
    }
  
    // Calculate the percentage of the hour that the user is active
    const totalMinutes = 60;
    const percentage = Math.round((totalTime / totalMinutes) * 100);
  
    return percentage;
  }
  
  // isUserWorking(logs: any[], hour: number, minute: number): boolean {
  //   const start = new Date(logs[0].startTime);
  //   const end = new Date(logs[logs.length - 1].endTime);
  
  //   // Check if the specified hour and minute is within the start and end times
  //   if (hour < start.getHours() || hour > end.getHours()) {
  //     return false;
  //   } else if (hour === start.getHours() && minute < start.getMinutes()) {
  //     return false;
  //   } else if (hour === end.getHours() && minute > end.getMinutes()) {
  //     return false;
  //   }
  
  //   // Check if there is a log entry for the specified hour and minute
  //   const log = logs.find(l => {
  //     const logStart = new Date(l.startTime);
  //     return logStart.getHours() === hour && logStart.getMinutes() === minute;
  //   });
  
  //   if (log) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
  
  
  
  
  getTitle(logs: any[]) {
    if (!logs || logs.length === 0) {
      return "";
    }
    const startTime = this.formatTime(logs[0].startTime);
    const endTime = this.formatTime(logs[logs.length - 1].endTime);
    return `${startTime} - ${endTime}`;
  }
  

  
  
  formatTime(time: string) {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  }
  
  addDays(date: Date, days: number): Date {
    let m = moment(this.selectedDate);
    date = m.add(days, 'days').toDate();
    return date;
  }
  SetPreviousDay() {
    this.selectedDate = this.datepipe.transform(this.addDays(this.selectedDate, -1), "yyyy-MM-dd");
    this.getTimeLine();
  }

  SetNextDay() {
    this.selectedDate = this.datepipe.transform(this.addDays(this.selectedDate, 1), "yyyy-MM-dd");
    this.getTimeLine();
  }
  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
  }
  exportToExcel() {
    this.exportService.exportToExcel('TimeSheets', 'timeSheet', this.timeline);
  }
  exportToCsv() {
    this.exportService.exportToCSV('TimeSheets', 'timeSheet', this.timeline);
  }

  @ViewChild('timeSheet') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('TimeSheets', this.content.nativeElement)
  }


  getLogDetails(logs: any[], hour: number, minute: number): string {
    const log = logs.find(l => {
      const logStart = new Date(l.startTime);
      const logEnd = new Date(l.endTime);
      return logStart.getHours() <= hour && logEnd.getHours() >= hour && logStart.getMinutes() <= minute && logEnd.getMinutes() >= minute;
    });
    
    if (log) {
      const logStart = new Date(log.startTime);
      const logEnd = new Date(log.endTime);
      return `Project: ${log.project.projectName}\nStart Time: ${this.formatTime(log.startTime)}\nEnd Time: ${this.formatTime(log.endTime)}`;
    } else {
      return 'No logs available for this hour.';
    }
  }
  

  isUserWorking(logs: any[], hour: number, minute: number): boolean {
    const currentTime = new Date();
    const startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hour, minute);
    const endTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hour + 1, minute);
    
    for (let i = 0; i < logs.length; i++) {
      const logStart = new Date(logs[i].startTime);
      const logEnd = new Date(logs[i].endTime);
  
      if (startTime >= logStart && endTime <= logEnd) {
        return true;
      }
    }
  
    return false;
  }
  
  
  
  
  
}
