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
  roleName = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'
  daysOfWeek: any = [];
  allComplete: boolean = false;
  selectedDate: any = this.datepipe.transform(new Date(), "yyyy-MM-dd");
  hours: number[] = [];
  startTime: Date;
  endTime: Date;
  count: number = 0;
  userLog: any;
  trackedChecked = true;
  manualChecked = true;
  mediumChecked = true;
  lowChecked = true;
  timeDiffMinutes: number;
  logs: any = [];
  logStartTime: Date | null = null;
  logEndTime: Date | null = null;


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
    if (this.roleName.toLocaleLowerCase() === "admin") {
      this.projectService.getprojects('', '').subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
        this.projectList = this.projectList.filter(project => project !== null);
      });
    }
    else {
      this.projectService.getProjectByUserId(this.currentUser.id).subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
        this.projectList = this.projectList.filter(project => project !== null);
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
  // getTimeLine() {
  //   let timeline = new TimeLine();
  //   timeline.fromdate = new Date(this.selectedDate);
  //   timeline.todate = new Date(this.selectedDate);
  //   timeline.projects = this.selectedProject;
  //   timeline.users = (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") ? this.selectedUser : [this.currentUser.id];
  //   this.reportService.getTimeline(timeline).subscribe(result => {
  //     this.timeline = result.data;
  //     const newHours = [];
  //     this.timeline.forEach((data) => {
  //       this.logs = data.logs;
  //       const hoursDiff = this.getEarliestAndLatestLogTime(this.logs);
  //       for (let i = 0; i < hoursDiff; i++) {
  //         if (!newHours.includes(i)) {
  //           newHours.push(i);
  //         }
  //       }
  //       if (this.logs.length > 0 && (!this.startTime || new Date(this.logs[0].startTime) < this.startTime)) {
  //         this.startTime = new Date(this.logs[0].startTime);
  //       }
  //     });

  //     this.hours = newHours;

  //     this.timeline.forEach((data) => {
  //       data.logs.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  //     });
  //     this.timeline.forEach((data) => {
  //       const logs = data.logs;
  //       for (let i = 0; i < logs.length - 1; i++) {
  //         const currentLog = logs[i];
  //         const nextLog = logs[i + 1];
  //         const currentLogEndTime = new Date(currentLog.endTime);
  //         const nextLogStartTime = new Date(nextLog.startTime);
  //         this.timeDiffMinutes = Math.abs(nextLogStartTime.getTime() - currentLogEndTime.getTime()) / (1000 * 60);

  //         if (this.timeDiffMinutes <= 10) {
  //           currentLog.endTime = nextLog.startTime;
  //         }
  //       }
  //     });
  //   });
  // }
  getTimeLine() {
    let timeline = new TimeLine();
    timeline.fromdate = new Date(this.selectedDate);
    timeline.todate = new Date(this.selectedDate);
    timeline.projects = this.selectedProject;
    timeline.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];

    this.reportService.getTimeline(timeline).subscribe(result => {
      this.timeline = result.data;
      const newHours = [];
      this.timeline.forEach((data) => {
        this.logs = data.logs;
        const hoursDiff = this.getEarliestAndLatestLogTime(this.logs);
        for (let i = 0; i < hoursDiff; i++) {
          if (!newHours.includes(i)) {
            newHours.push(i);
          }
        }
        if (this.logs.length > 0 && (!this.startTime || new Date(this.logs[0].startTime) < this.startTime)) {
          this.startTime = new Date(this.logs[0].startTime);
        }
        if (this.logs.length > 0 && (!this.endTime || new Date(this.logs[this.logs.length - 1].endTime) > this.endTime)) {
          this.endTime = new Date(this.logs[this.logs.length - 1].endTime);
        }
        this.logStartTime = new Date(this.logs[0].startTime);
        this.logEndTime = new Date(this.logs[this.logs.length - 1].endTime);
      });

      this.hours = newHours;

      this.timeline.forEach((data) => {
        data.logs.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      });
      this.timeline.forEach((data) => {
        const logs = data.logs;
        for (let i = 0; i < logs.length - 1; i++) {
          const currentLog = logs[i];
          const nextLog = logs[i + 1];
          const currentLogEndTime = new Date(currentLog.endTime);
          const nextLogStartTime = new Date(nextLog.startTime);
          this.timeDiffMinutes = Math.abs(nextLogStartTime.getTime() - currentLogEndTime.getTime()) / (1000 * 60);

          if (this.timeDiffMinutes <= 10) {
            currentLog.endTime = nextLog.startTime;
          }
        }
      });
    });
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
      return '#ff0000';
    }
    else if (activity <= 100) {
      return '#FFC107'
    }
    else if (log) { 
      return '#2ECD6F'
     }
    else (this.getTimeLine())
     {return '#cccccc'}
  }

  getLogTitle(log: any): string {
    return `Clicks: ${log.clicks}, Scrolls: ${log.scrolls}, Keys Pressed: ${log.keysPressed}`
  }

  getLogMarginLeft(log: any): number {
    const logStartTime = new Date(log.startTime);
    return logStartTime.getMinutes();
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
  hasLogsInHour(hour: number): boolean {
    return this.timeline.some(log => this.isLogInHour(log, this.startTime.getHours() + hour));
  }

  calculateGapWidth(logs: any[], currentIndex: number): number {
    if (currentIndex === 0) {
      return 0; // No gap before the first log
    }

    const previousLog = logs[currentIndex - 1];
    const currentLog = logs[currentIndex];

    const previousEndTime = new Date(previousLog.endTime);
    const currentStartTime = new Date(currentLog.startTime);

    const gapDuration = currentStartTime.getTime() - previousEndTime.getTime();
    const gapWidth = gapDuration / (1000 * 60); // Convert gap duration to minutes

    if (gapWidth < 10) {
      return 0; // No gap if the duration is less than 10 minutes
    }

    return gapWidth;
  }






  toggleLogsVisibility(checkboxValue: string) {

    switch (checkboxValue) {

      case 'tracked':
        this.trackedChecked = !this.trackedChecked;
        break;
      case 'manual':
        this.manualChecked = !this.manualChecked;
        break;
      case 'medium':
        this.mediumChecked = !this.mediumChecked;
        break;
      case 'low':
        this.lowChecked = !this.lowChecked;
        break;
      default:
        break;
    }
  }




}