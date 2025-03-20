import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ProjectService } from 'src/app/_services/project.service';
import { ExportService } from 'src/app/_services/export.service';
import { RealTime } from 'src/app/models/timeLog';
import { Observable, switchMap } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
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
  showAllUserLiveButton: boolean = false;
  teamUser;

  constructor(private timelog: TimeLogService,
    public commonService: CommonService,
    private projectService: ProjectService,
    private exportService: ExportService,
    private dialog: MatDialog,
  ) {

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
    if(this.currentUser==null){
      return;
    }
    if (this.role?.toLowerCase() == "admin" || null) {
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
    if(!this.currentUser){
      return; 
    }
    this.members = [];
    this.members.push({ id: this.currentUser?.id, name: "Me", email: this.currentUser?.id });
    this.member = this.currentUser;
    this.timelog.getTeamMembers(this.member?.id).subscribe({
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
  if (this.selectedUser.length === 0) {
    this.realtime.onlineUsers = this.members; // Show all members if no filter is selected
  } else {
    this.getRealtime();
  }
}



  exportToExcel() {
    this.exportService.exportToExcel('RealTime', 'realTime', this.realtime);
  }
  exportToCsv() {
    this.exportService.exportToCSV('RealTime', 'realTime', this.realtime);
  }

  @ViewChild('realTime') content!: ElementRef
  exportToPdf() {
    console.log(this.content?.nativeElement, this.content)
    this.exportService.exportToPdf('RealTime', 'RealTime Report', this.content.nativeElement)
  }


  getRealtime() {
    if(this.members == null){
      return;
    }
    this.timelog.getTeamMembers(this.member.id).subscribe((response: any) => {
      this.teamUser = response.data;
      let realtime = new RealTime();
      realtime.projects = this.selectedProject;
      realtime.tasks = this.selectedTask;
      realtime.users = (this.role.toLowerCase() === "admin") ? this.selectedUser : [...this.teamUser, this.currentUser.id];
      this.timelog.realTime(realtime).subscribe(result => {
        this.realtime = result.data[0];
        this.showAllUserLiveButton = this.realtime.onlineUsers.length > 1;
      })
    });
  }

  multipleUserLiveScreen() {
    let userIds: string[] = [];
    for (let item of this.realtime.onlineUsers) {
      if (item.user.id != this.currentUser.id) {
        userIds = userIds.concat(item.user.id);
      }
    }
    
    this.openLiveScreen(userIds);
  }

  singleUserLiveScreen(id) {
    let userIds: string[] = [];
    userIds.push(id);
    this.openLiveScreen(userIds);
  }

  openLiveScreen(userIds) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '60vw';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '100vw'; // Prevent dialog from exceeding viewport
    dialogConfig.data = { id: userIds };
    dialogConfig.panelClass = 'no-padding-dialog'; // Custom class for styling
  
    const dialogRef = this.dialog.open(LiveScreenComponent, dialogConfig);
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }
}
