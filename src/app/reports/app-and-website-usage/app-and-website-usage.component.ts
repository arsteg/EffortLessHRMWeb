import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../_services/project.service';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ExportService } from 'src/app/_services/export.service';
import { SearchAppUsagesRequest } from '../model/productivityModel';
import { ReportsService } from '../../_services/reports.service';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-app-and-website-usage',
  templateUrl: './app-and-website-usage.component.html',
  styleUrls: ['./app-and-website-usage.component.css']
})
export class AppAndWebsiteUsageComponent implements OnInit {

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
  appUsagesList: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  roleName = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  role: any;
  constructor(
    private projectService: ProjectService,
    private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    , private reportService: ReportsService,
    private commonservice: CommonService
  ) {
    this.fromDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)), 'yyyy-MM-dd');
  }

  ngOnInit(): void {
  
    this.populateUsers();

    this.commonservice.getCurrentUserRole().subscribe((role: any) => {
      this.role = role;
      this.getApplicationData();
      this.getProjectList();
    })
  }

  getProjectList() {
    //Admin and Manage can see the list of all projects
    if (this.role.toLowerCase() === "admin" || null) {
      this.projectService.getprojects('', '').subscribe((response: any) => {
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
      next: response => {
        this.timeLogService.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.id != this.currentUser.id) {
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
    this.getApplicationData();
  }

  getApplicationData() {
    let searchAppUsagesRequest = new SearchAppUsagesRequest();
    searchAppUsagesRequest.fromdate = new Date(this.fromDate);
    searchAppUsagesRequest.todate = new Date(this.toDate);
    searchAppUsagesRequest.projects = this.selectedProject;
    searchAppUsagesRequest.users = (this.role.toLowerCase() === "admin" || null) ? this.selectedUser : [this.currentUser.id];
    this.reportService.getAppUsagesReport(searchAppUsagesRequest).subscribe(result => {
      this.appUsagesList = result.data;
      this.totalHours = result.data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.timeSpent), 0);
    }
    )
  }
  InactivitTime(idletime, totalTime) {
    return Math.floor((idletime * 100) / totalTime);
  }

  millisecondsToTime(milliseconds) {
    let hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    return hours + ' hr ' + minutes + ' m';
  }

  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
  }

  exportToExcel() {
    this.exportService.exportToExcel('ApplicationUsages', 'applicationUsages', this.appUsagesList);
  }
  exportToCsv() {
    this.exportService.exportToCSV('ApplicationUsages', 'applicationUsages', this.appUsagesList);
  }

  @ViewChild('applicationUsages') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('ApplicationUsages', this.content.nativeElement)
  }

}
