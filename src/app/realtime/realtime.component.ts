import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../common/common.service';
import { ManageTeamService } from '../_services/manage-team.service';
import { TimeLogService } from '../_services/timeLogService';
import { SearchTaskRequest } from '../reports/model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../reports/reports.service';
import { ProjectService } from '../Project/project.service';
import { ExportService } from '../_services/export.service';

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css']
})
export class RealtimeComponent implements OnInit {
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

  constructor(private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private datepipe: DatePipe,
    private reportService: ReportsService,
    private projectService: ProjectService,
    private exportService: ExportService) {

  }

  ngOnInit(): void {
    this.populateTeamOfUsers();
    this.getProjectList();
    this.firstLetter = this.commonService.firstletter;
  }

  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
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

    searchTaskRequest.projects = this.selectedProject;
    searchTaskRequest.tasks = this.selectedTask;
    searchTaskRequest.users = (this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96") ? this.selectedUser : [this.currentUser.email];
    this.reportService.getTaskReport(searchTaskRequest).subscribe(result => {
      this.taskList = result.data;
    }
    )
  }

  getProjectList() {
    if(this.roleId == "639acb77b5e1ffe22eaa4a39" || this.roleId == "63b56b9ca3396271e4a54b96"){
        this.projectService.getprojectlist().subscribe((response: any) => {
        this.projectList = response && response.data && response.data['projectList'];
      });
    }
  }

  exportToExcel(){
    this.exportService.exportToExcel('Task', 'taskReport', this.taskList);
  }
  exportToCsv(){
    this.exportService.exportToCSV('Task', 'taskReport', this.taskList);
  }
  
  @ViewChild('taskReport') content!: ElementRef
  exportToPdf(){
    this.exportService.exportToPdf('Task', this.content.nativeElement)
  }
}
