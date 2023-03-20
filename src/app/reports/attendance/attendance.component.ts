import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Attendance, Timesheet } from 'src/app/reports/model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from 'src/app/reports/reports.service';
import { ProjectService } from 'src/app/Project/project.service';
import { ExportService } from 'src/app/_services/export.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})

export class AttendanceComponent implements OnInit {
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
  attendance: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  selectedTask: any = [];
  roleId = localStorage.getItem('roleId');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'
  daysOfWeek: any = [];
  showProjectsColumn = true;
  showMembersColumn = true;
  selectedDate: any = this.datepipe.transform(new Date(), "yyyy-MM-dd");
  selectedFilter = 'All';
  firstLetter: string;

filterOption: string = 'All'
  constructor(
    public commonservice: CommonService,
     public datepipe: DatePipe
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    , private reportService: ReportsService
  ) {
    this.fromDate = this.datepipe.transform(new Date(this.currentDate), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate), 'yyyy-MM-dd');
    this.getAttendance();
  }

  ngOnInit(): void {
    this.populateUsers();
    this.getAttendance();
    this.firstLetter = this.commonservice.firstletter;
  }

  populateUsers() {
    this.members = [];
    this.members.push({ id: this.currentUser.email, name: "Me", email: this.currentUser.email });
    this.member = this.currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any; }) => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email != this.currentUser.email) {
                this.members.push({ id: user.email, name: `${user.firstName} ${user.lastName}`, email: user.email });
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

    this.getAttendance();
    
  }

  getAttendance() {
    let attendance = new Attendance();
    attendance.fromdate = new Date(this.selectedDate);
    attendance.todate = new Date(this.selectedDate);
    attendance.users = (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") ? this.selectedUser : [this.currentUser.email];
    this.reportService.getAttendance(attendance).subscribe(result => {
      this.attendance = result.data;
      // this.totalHours = result.data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.logs[0].time), 0);
    }
    )
  }
  minutesToTime(minutes: number): string {
    const hours: string = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins: string = (minutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  getTotalTime(logs: any[]): number {
    let totalTime = 0;
    for (const log of logs) {
      totalTime += log.time;
    }
    return totalTime;
  }
  getTotalTimeByDay(day: Date): number {
    let totalTime = 0;
    this.attendance.forEach(user => {
      user.logs.forEach(log => {
        if (this.datepipe.transform(log.date, 'yyyy-MM-dd') === this.datepipe.transform(day, 'yyyy-MM-dd')) {
          totalTime += log.time;
        }
      });
    });
    return totalTime;
  }

  // Calculate total time for all days
  getTotalTimeAllDays(): number {
    let totalTime = 0;
    this.attendance.forEach(user => {
      user.logs.forEach(log => {
        totalTime += log.time;
      });
    });
    return totalTime;
  }
  exportToExcel() {
    this.exportService.exportToExcel('Attendance', 'attendances', this.attendance);
  }
  exportToCsv() {
    this.exportService.exportToCSV('Attendance', 'attendances', this.attendance);
  }

  @ViewChild('attendances') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('Attendance', this.content.nativeElement)
  }

  addDays(date: Date, days: number): Date {
    let m = moment(this.selectedDate);
    date = m.add(days, 'days').toDate();
    return date;
  }


  SetPreviousDay() {
    this.selectedDate = this.datepipe.transform(this.addDays(this.selectedDate, -1), "yyyy-MM-dd");
    this.getAttendance();
  }
  
  SetNextDay() {
    this.selectedDate = this.datepipe.transform(this.addDays(this.selectedDate, 1), "yyyy-MM-dd");
    this.getAttendance();
  }
  
  filterAttendance() {
    if (this.selectedFilter === 'All') {
      this.attendance = this.getAttendance(); // reset to original data
    } else {
      this.attendance = this.attendance.filter(data => data.status === this.selectedFilter);
    }
  }
  
}