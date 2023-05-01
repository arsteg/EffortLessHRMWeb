import { Component,ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { Activity } from 'src/app/reports/model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from 'src/app/_services/reports.service';
import { ProjectService } from 'src/app/_services/project.service';
import { ExportService } from 'src/app/_services/export.service';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
@Component({
  selector: 'app-activity-level',
  templateUrl: './activity-level.component.html',
  styleUrls: ['./activity-level.component.css']
})
export class ActivityLevelComponent implements OnInit {
  selectedManager: any;
  members: any;
  member: any;
  teamOfUsers: any[];
  firstLetter: string;
  color: string;
  selectedProject: any = [];
  selectedTask: any = [];
  roleName = localStorage.getItem('roleName');
  taskList: any = [];
  projectList: any;
  searchText = '';
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public sortOrder: string = ''; // 'asc' or 'desc'
  fromDate: any;
  toDate: any;
  currentDate: Date = new Date();
  diff: any = this.currentDate.getDate() - this.currentDate.getDay() + (this.currentDate.getDay() === 0 ? -6 : 1);
  lastday: any = this.currentDate.getDate() - (this.currentDate.getDay() - 1) + 6;
  totalHours: number = 0;
  userId: string;
  activity: any [];
  daysOfWeek: any = [];
  showProjectsColumn = true;
  showMembersColumn = true;
  selectedUser: any = [];
  activeButton: string = 'Contract';

  constructor(private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonservice: CommonService,
    public datepipe: DatePipe,
    private reportService: ReportsService,
    private projectService: ProjectService,
    private exportService: ExportService) {

    this.fromDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)), 'yyyy-MM-dd');

    
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
    this.firstLetter = this.commonservice.firstletter;
    this.getActivity();
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
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.email });
    this.member = this.currentUser;
    this.timelog.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any; }) => {
        this.timelog.getusers(response.data).subscribe({
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

  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
  }
  
  filterData() {
    this.getActivity();
  }

  
  exportToExcel() {
    this.exportService.exportToExcel('Activity', 'activityExport', this.activity);
  }
  exportToCsv() {
    this.exportService.exportToCSV('Activity', 'activityExport', this.activity);
  }

  @ViewChild('activityExport') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('Activity', this.content.nativeElement)
  }

  getActivity(){
    let searchActivity = new Activity();
    searchActivity.projects = this.selectedProject;
    searchActivity.tasks = [];
    searchActivity.fromdate = new Date(this.fromDate);
    searchActivity.todate = new Date(this.toDate);
    searchActivity.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];
    this.reportService.getActivity(searchActivity).subscribe(result => {
      this.activity = result.data;
      this.totalHours = result.data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.time), 0);
    }
    )
  }
}

