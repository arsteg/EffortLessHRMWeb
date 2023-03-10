import { Component,ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';
import { ManageTeamService } from 'src/app/_services/manage-team.service'; 
import { TimeLogService } from 'src/app/_services/timeLogService';
import { SearchTaskRequest } from '../model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../reports.service';
import { ProjectService } from 'src/app/Project/project.service'; 
import { ExportService } from 'src/app/_services/export.service'; 
@Component({
  selector: 'app-activity-level',
  templateUrl: './activity-level.component.html',
  styleUrls: ['./activity-level.component.css']
})
export class ActivityLevelComponent implements OnInit {
  selectedManager: any;
  selectedUsers: any;
  selectedUser: any;
  teamOfUsers: any[];
  firstLetter: string;
  color: string;
  selectedProject: any = [];
  selectedTask: any = [];
  roleId = localStorage.getItem('roleId');
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

  constructor(private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private datepipe: DatePipe,
    private reportService: ReportsService,
    private projectService: ProjectService,
    private exportService: ExportService) {

    this.fromDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)), 'yyyy-MM-dd');
    this.toDate = this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)), 'yyyy-MM-dd');
    this.getTaskData();

  }

  ngOnInit(): void {
    this.populateTeamOfUsers();
    this.getProjectsByUser();
    this.firstLetter = this.commonService.firstletter;
  }
  getProjectsByUser() {
    this.projectService.getProjectByUserId(this.selectedUsers).subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }
  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        console.log(this.teamOfUsers)
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.teamOfUsers.forEach((user: any, index: number) => {
          if (user.id == currentUser.id) {
            this.selectedManager = user;
            this.Selectmanager(user);
          }
        });
      },
      error: error => { }
    })
  }

  Selectmanager(user: any) {
    this.selectedManager = user;
    this.timelog.getTeamMembers(user.id).subscribe({
      next: response => {
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            this.selectedUsers = result.data;
            this.teamOfUsers.forEach((user: any, index: number) => {
              user['isChecked'] = this.selectedUsers.some((selectedUser: any) => selectedUser.id == user.id);
            });
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
    this.getTaskData();
  }

  getTaskData() {
    let searchTaskRequest = new SearchTaskRequest();
    searchTaskRequest.fromdate = new Date(this.fromDate);
    searchTaskRequest.todate = new Date(this.toDate);
    searchTaskRequest.projects = this.selectedProject;
    searchTaskRequest.tasks = this.selectedTask;
    searchTaskRequest.users = (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") ? this.selectedUser : [this.currentUser.email];
    this.reportService.getTaskReport(searchTaskRequest).subscribe(result => {
      this.taskList = result.data;
      this.totalHours = result.data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.time), 0);
    }
    )
  }
  exportToExcel() {
    this.exportService.exportToExcel('TimeSheets', 'timeSheet', this.selectedUsers);
  }
  exportToCsv() {
    this.exportService.exportToCSV('TimeSheets', 'timeSheet', this.selectedUsers);
  }

  @ViewChild('timeSheet') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('TimeSheets', this.content.nativeElement)
  }
}

