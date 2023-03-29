import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../common/common.service';
import { ManageTeamService } from '../_services/manage-team.service';
import { TimeLogService } from '../_services/timeLogService';
import { Timesheet } from '../reports/model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../reports/reports.service';
import { ProjectService } from '../Project/project.service';
import { ExportService } from '../_services/export.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.css']
})

export class TimesheetsComponent implements OnInit {
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
  timeSheett: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  selectedTask: any = [];
  roleName = localStorage.getItem('roleName');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'
  daysOfWeek: any = [];
  showProjectsColumn = true;
  showMembersColumn = true;
  activeButton: string = 'Contract';
  firstLetter: string;


  constructor(
    private projectService: ProjectService
    , public datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    , private reportService: ReportsService, public commonservice: CommonService
  ) {
    this.fromDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)), 'yyyy-MM-dd');
    this.getTimeSheet();

    // Get the start and end dates for the current week
    const startOfWeek = moment().startOf('isoWeek');
    const endOfWeek = moment().endOf('isoWeek');

    // Create an array of date strings for the current week
    this.daysOfWeek = [];
    for (let day = startOfWeek; day <= endOfWeek; day = day.clone().add(1, 'day')) {
      this.daysOfWeek.push(day.format('YYYY-MM-DD'));
    }

  }

  ngOnInit(): void {
    this.getProjectList();
    this.populateUsers();
    this.getTimeSheet();
    this.firstLetter = this.commonservice.firstletter;
  }
  toggleProjectsColumn() {
    this.showProjectsColumn = true;
    this.showMembersColumn = false;
    this.activeButton = 'Project';
  }

  toggleMembersColumn() {
    this.showProjectsColumn = false;
    this.showMembersColumn = true;
    this.activeButton = 'Members';
  }

  toggleAllColumns() {
    this.showProjectsColumn = true;
    this.showMembersColumn = true;
    this.activeButton = 'Contract';
  }
  getProjectList() {
    //Admin and Manager can see the list of all projects
    if (this.roleName.toLocaleLowerCase() == "admin" || this.roleName.toLocaleLowerCase() == "manager") {
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
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.id });
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
    // Get the start and end dates from the form inputs
    const startDate = new Date(this.fromDate);
    const endDate = new Date(this.toDate);

    // Create a new array of dates for the selected range
    const startOfWeek = moment(startDate).startOf('isoWeek');
    const endOfWeek = moment(endDate).endOf('isoWeek');
    const newDaysOfWeek = [];
    for (let day = startOfWeek; day <= endOfWeek; day = day.clone().add(1, 'day')) {
      newDaysOfWeek.push(day.format('YYYY-MM-DD'));
    }

    // Update the daysOfWeek array with the new dates
    this.daysOfWeek = newDaysOfWeek;

    // Call the getTimeSheet function to update the time sheet data
    this.getTimeSheet();
  }

  getTimeSheet() {
    let searchTimesheet = new Timesheet();
    searchTimesheet.fromdate = new Date(this.fromDate);
    searchTimesheet.todate = new Date(this.toDate);
    searchTimesheet.projects = this.selectedProject;
    searchTimesheet.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];
    this.reportService.getTimesheet(searchTimesheet).subscribe(result => {
      this.timeSheett = result.data;
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
    this.timeSheett.forEach(user => {
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
    this.timeSheett.forEach(user => {
      user.logs.forEach(log => {
        totalTime += log.time;
      });
    });
    return totalTime;
  }
  exportToExcel() {
    this.exportService.exportToExcel('TimeSheets', 'timeSheet', this.timeSheett);
  }
  exportToCsv() {
    this.exportService.exportToCSV('TimeSheets', 'timeSheet', this.timeSheett);
  }

  @ViewChild('timeSheet') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('TimeSheets', this.content.nativeElement)
  }

}
