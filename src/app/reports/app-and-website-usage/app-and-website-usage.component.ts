import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../Project/project.service';
import { DatePipe } from '@angular/common'; 
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'app-app-and-website-usage',
  templateUrl: './app-and-website-usage.component.html',
  styleUrls: ['./app-and-website-usage.component.css']
})
export class AppAndWebsiteUsageComponent implements OnInit {

  private _jsonURL = '.../../../assets/appreports.json';
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
  appUsagesList: any = [];
  p: number = 1;
  selectedUser: any = [];
  selectedProject: any = [];
  roleId = localStorage.getItem('roleId');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  public getJSON(): Observable<any> {
    return this.http.get(this._jsonURL);
  }

  constructor(
    private projectService: ProjectService,
    private datepipe: DatePipe
    , private http: HttpClient
    , private timeLogService: TimeLogService
    , private exportService: ExportService
    )
  {
    this.fromDate= this.datepipe.transform(new Date(this.currentDate.setDate(this.diff)),'yyyy-MM-dd');  
    this.toDate=this.datepipe.transform(new Date(this.currentDate.setDate(this.lastday)),'yyyy-MM-dd');
    this.getApplicationData();
  }

  ngOnInit(): void {
    this.getProjectList();
    this.populateUsers();
  }

  getProjectList() {
    //Admin and Manage can see the list of all projects
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

  filterData(){
    let users = (this.selectedUser === undefined || this.selectedUser.length==0) ? null : this.selectedUser;
    let project = (this.selectedProject=== undefined || this.selectedProject.length==0) ? null : this.selectedProject;
    let fromDate = this.fromDate;
    let toDate = this.toDate;
    //this.getApplicationDatav1();
  }

  // getApplicationDatav1(){
  //   this.getJSON().subscribe(data => {
  //     data = data.filter(d => d.task == "Dovestones software ticket")
  //     this.appUsagesList = data;
  //     this.totalHours = data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.duration), 0);
  //    });
  // }

  getApplicationData(){
    this.getJSON().subscribe(data => {
      this.appUsagesList = data;
      this.totalHours = data.reduce((sum, elem) => parseInt(sum) + parseInt(elem.total), 0);
     });
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
  
  exportToExcel(){
    this.exportService.exportToExcel('ApplicationUsages', 'applicationUsages', this.appUsagesList);
  }
  exportToCsv(){
    this.exportService.exportToCSV('ApplicationUsages', 'applicationUsages', this.appUsagesList);
  }
  
  @ViewChild('applicationUsages') content!: ElementRef
  exportToPdf(){
    this.exportService.exportToPdf('ApplicationUsages', this.content.nativeElement)
  }

}
