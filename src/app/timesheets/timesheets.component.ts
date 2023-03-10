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
  totalHours:number=0;
  searchText ='';
  currentDate: Date = new Date();
  diff: any = this.currentDate.getDate() - this.currentDate.getDay() + (this.currentDate.getDay() === 0 ? -6 : 1);
  lastday: any = this.currentDate.getDate() - (this.currentDate.getDay() - 1) + 6;
  timeSheett: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  selectedTask: any = [];
  roleId = localStorage.getItem('roleId');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
 public sortOrder: string = ''; // 'asc' or 'desc'
 daysOfWeek:any= [];



  constructor(
    private projectService: ProjectService
    , private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    , private reportService: ReportsService
    )
  {
    this.fromDate= this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)),'yyyy-MM-dd');  
    this.toDate=this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)),'yyyy-MM-dd');
    this.getTimeSheet();

    // Get the start and end dates for the current week
const startOfWeek = moment().startOf('week');
const endOfWeek = moment().endOf('week');

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
    if(this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96"){
        this.projectService.getprojectlist().subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
      });
    }
    else{
      this.projectService.getProjectByUserId(this.currentUser.id).subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
      });
    }
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

  filterData(){
    this.getTimeSheet();
  }

  getTimeSheet() {
    let searchTimesheet = new Timesheet();
    searchTimesheet.fromdate = new Date(this.fromDate);
    searchTimesheet.todate = new Date(this.toDate);
    searchTimesheet.projects = this.selectedProject;
   
    searchTimesheet.users = (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") ? this.selectedUser : [this.currentUser.email];
    this.reportService.getTimesheet(searchTimesheet).subscribe(result => {
      this.timeSheett = result.data;
      this.totalHours = result.data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.logs[0].time), 0);
    }
    )
  }

  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
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
  // getTimeSheet(timeSheet){
  //   this.reportService.getTimesheet(timeSheet).subscribe( result=> {
  //     this.timeSheets = result.data;
  //     this.ngOnInit();
  //     console.log(this.timeSheets);
  //   })
  // }

}
