import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../Project/project.service';
import { ReportsService } from '../reports.service';
import { DatePipe } from '@angular/common'; 
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ExportService } from 'src/app/_services/export.service';
import { SearchTaskRequest } from '../model/productivityModel';

@Component({
  selector: 'app-taskreport',
  templateUrl: './taskreport.component.html',
  styleUrls: ['./taskreport.component.css']
})
export class TaskreportComponent implements OnInit {
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
  taskList: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  selectedTask: any = [];
  roleName = localStorage.getItem('roleName');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));

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
  }

  ngOnInit(): void {
    this.getProjectList();
    this.populateUsers();
    this.getTaskData();
  }

  getProjectList() {
    //Admin and Manager can see the list of all projects
    if(this.roleName.toLocaleLowerCase() === "admin"){
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
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.email });
    this.member = this.currentUser;
    this.timeLogService.getTeamMembers(this.member.id).subscribe({
      next: response => {
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

  filterData(){
    this.getTaskData();
  }

  getTaskData() {
    let searchTaskRequest = new SearchTaskRequest();
    searchTaskRequest.fromdate = new Date(this.fromDate);
    searchTaskRequest.todate = new Date(this.toDate);
    searchTaskRequest.projects = this.selectedProject;
    searchTaskRequest.tasks = this.selectedTask;
    searchTaskRequest.users = (this.roleName.toLocaleLowerCase() === "admin") ? this.selectedUser : [this.currentUser.id];
    this.reportService.getTaskReport(searchTaskRequest).subscribe(result => {
      this.taskList = result.data;
      this.totalHours = result.data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.time), 0);
    }
    )
  }

  minutesToTime(minutes) {
    let hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    return hours + ' hr ' + minutes + ' m';
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
