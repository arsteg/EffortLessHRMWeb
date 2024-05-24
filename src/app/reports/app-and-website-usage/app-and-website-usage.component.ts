import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../_services/project.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ExportService } from 'src/app/_services/export.service';
import { SearchAppUsagesRequest } from '../model/productivityModel';
import { ReportsService } from '../../_services/reports.service';
import { CommonService } from 'src/app/common/common.service';
import { UtilsService } from 'src/app/_services/utils.service';

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
  appUsagesList: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  role: any;
  constructor(
    private projectService: ProjectService
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    , private reportService: ReportsService
    , private commonservice: CommonService
    , private utilsService:UtilsService
  ) {
    this.fromDate = new Date().toISOString().slice(0, 10);
    this.toDate = new Date().toISOString().slice(0, 10);
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
    searchAppUsagesRequest.fromdate = this.utilsService.convertToUTC(this.convertToDateWithStartTime(this.fromDate));
    searchAppUsagesRequest.todate = this.utilsService.convertToUTC(this.convertToDateWithEndTime(this.toDate));
    searchAppUsagesRequest.projects = this.selectedProject;
    searchAppUsagesRequest.users = (this.selectedUser.length==0) ? [this.currentUser.id] : this.selectedUser;
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
    const ms = Math.floor(Math.abs(milliseconds));
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return hours + ' hr ' + minutes + ' m ' + seconds + ' s';
  }

  minutesToTime(input) {
    const minutes = Math.floor(Math.abs(input));
    const hours = Math.floor(minutes / 60);
    const seconds = minutes % 60;
    return hours + ' hr ' + minutes + ' m ' + seconds +' s';
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

  private convertToDateWithStartTime(dateString: string): Date {
    const date = new Date(dateString);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  private convertToDateWithEndTime(dateString: string): Date {
    const date = new Date(dateString);
    date.setUTCHours(23, 59, 59, 999);
    return date;
  }
}
