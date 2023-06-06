import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { TimeLine, Timesheet } from '../model/productivityModel';
import { ReportsService } from '../../_services/reports.service';
import { ProjectService } from 'src/app/_services/project.service';
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
  userLog: any;
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


  isLogInHour(log: any, hour: number): boolean {
    const logStartTime = new Date(log.startTime);
    return logStartTime.getHours() === hour;
  }


  getLogWidth(log: any): number {
    const logStartTime = new Date(log.startTime);
    const logEndTime = new Date(log.endTime);
    return (logEndTime.getTime() - logStartTime.getTime()) / (1000 * 60);
  }

  getLogColor(log: any): string {
    let activity = log.clicks + log.keysPressed + log.scrolls
    if (log.isManualTime == true) {
      return '#f87a3b';
    }
    else if (activity <= 30) {
      return 'red';
    }
    else if (activity <= 100) {
      return '#FFC107'
    }
    else
      return '#2ECD6F'
  }

  getLogMarginLeft(log: any): number {
    const logStartTime = new Date(log.startTime);
    return logStartTime.getMinutes();
    const startTimeHour = this.startTime.getHours();
    const marginMinutes = (logStartTime.getHours() - startTimeHour) * 60 + logStartTime.getMinutes();
    return marginMinutes * 1;
  }
 
  
  







  getLogTitle(log: any): string {
    return `Clicks: ${log.clicks}, Scrolls: ${log.scrolls}, \n  Keys Pressed: ${log.keysPressed}`
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

}