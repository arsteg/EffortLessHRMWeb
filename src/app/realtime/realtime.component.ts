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
import { Observable, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { LiveScreenComponent } from './live-screen/live-screen.component';

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
  taskList: any = [];
  projectList: any;
  searchText = '';
  currentUser: any;
  realtime: any;
  members: any;
  member: any;
  p: number = 1;
  onlineUserData: any;
  user: any;
  role: any;
  constructor(private timelog: TimeLogService,
    private manageTeamService: ManageTeamService,
    public commonService: CommonService,
    private datepipe: DatePipe,
    private reportService: ReportsService,
    private projectService: ProjectService,
    private exportService: ExportService,
    private dialog: MatDialog) {

  }

  ngOnInit(): void {

    this.firstLetter = this.commonService.firstletter;

    this.commonService.getCurrentUserRole().subscribe((role: any) => {
      this.role = role;
    })
    this.getCurrentUser().subscribe(() => {
      this.populateUsers();
      this.getProjectList();
      this.getRealtime();
    })
  }
  getCurrentUser() {
    return this.commonService.getCurrentUser().pipe(
      switchMap((profile: any) => {
        this.currentUser = profile;
        return new Observable((observer) => {
          observer.next();
          observer.complete();
        });
      })
    );
  }
  getProjectList() {
    //Admin and Manager can see the list of all projects
    if (this.role.toLowerCase() == "admin" || null) {
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
  teamUser;
  populateUsers() {
    this.members = [];
    this.members.push({ id: this.currentUser.id, name: "Me", email: this.currentUser.id });
    this.member = this.currentUser;
    this.timelog.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any[]; }) => {

        this.teamUser = response.data;
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
    console.log(this.member.id)
    this.timelog.getTeamMembers(this.member.id).subscribe((response: any) => {
      this.teamUser = response.data;
console.log(this.teamUser)

      let realtime = new RealTime();
      realtime.projects = this.selectedProject;
      realtime.tasks = this.selectedTask;
      realtime.users = (this.role.toLowerCase() === "admin") ? this.selectedUser : [...this.teamUser , this.currentUser.id];
      console.log(realtime.users)

      this.timelog.realTime(realtime).subscribe(result => {
        this.realtime = result.data[0];
      })
    });
  }
  openLiveScreen(){
    const dialogRef = this.dialog.open(LiveScreenComponent, {
      width: '650px',
      height: 'auto'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }
}
