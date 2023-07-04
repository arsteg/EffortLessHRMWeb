import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../common/common.service';
import { ManageTeamService } from '../_services/manage-team.service';
import { TimeLogService } from '../_services/timeLogService';
import { SearchTaskRequest } from '../reports/model/productivityModel';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../_services/reports.service';
import { ProjectService } from '../_services/project.service';
import { ExportService } from '../_services/export.service';
import { RealTime } from '../models/timeLog';

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css']
})
export class RealtimeComponent implements OnInit {
  selectedManager: any;
  selectedUsers: any;
  selectedUser: any = [];
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
  realtime: any;
  roleName = localStorage.getItem('adminView');
  members: any;
  member: any;
  p: number = 1;
  onlineUserData:any;
  user:any;
  constructor(private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private datepipe: DatePipe,
    private reportService: ReportsService,
    private projectService: ProjectService,
    private exportService: ExportService,) {

  }

  ngOnInit(): void {
    this.populateUsers();
    this.getProjectList();
    this.firstLetter = this.commonService.firstletter;
    this.getRealtime();
  }

  getProjectList() {
    //Admin and Manager can see the list of all projects
    if (this.roleName.toLocaleLowerCase() == "admin" || this.roleName.toLocaleLowerCase() == "manager") {
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
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.id });
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

  filterData() {
    this.getRealtime();
  }

  

  
  exportToExcel() {
    this.exportService.exportToExcel('RealTime', 'realTime', this.realtime);
  }
  exportToCsv() {
    this.exportService.exportToCSV('RealTime', 'realTime', this.realtime);
  }

  @ViewChild('realTime') content!: ElementRef
  exportToPdf() {
    this.exportService.exportToPdf('RealTime', this.content.nativeElement)
  }
 
  
  getRealtime() {
    let realtime = new RealTime();
    realtime.projects = this.selectedProject ;
    realtime.tasks = this.selectedTask;
    realtime.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];
    this.timelog.realTime(realtime).subscribe(result => {
      this.realtime = result.data[0];
         
      
    })
  }
}
