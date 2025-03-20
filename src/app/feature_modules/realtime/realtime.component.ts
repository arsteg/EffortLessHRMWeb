import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { ProjectService } from 'src/app/_services/project.service';
import { ExportService } from 'src/app/_services/export.service';
import { WebSocketService, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { RealTime } from 'src/app/models/timeLog';
import { Observable, switchMap, Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LiveScreenComponent } from './live-screen/live-screen.component';

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.css']
})
export class RealtimeComponent implements OnInit, OnDestroy {
  selectedManager: any;
  selectedUsers: any;
  selectedUser: any[] = [];
  teamOfUsers: any[];
  firstLetter: string;
  color: string;
  selectedProject: any[] = [];
  selectedTask: any[] = [];
  taskList: any[] = [];
  projectList: any;
  searchText = '';
  currentUser: any;
  realtime: any;
  members: any[] = [];
  member: any;
  p: number = 1;
  onlineUsers: any[] = [];
  user: any;
  role: any;
  showAllUserLiveButton: boolean = false;
  teamUser: any;
  private wsSubscription: Subscription;

  constructor(
    private timelog: TimeLogService,
    public commonService: CommonService,
    private projectService: ProjectService,
    private exportService: ExportService,
    private dialog: MatDialog,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.firstLetter = this.commonService.firstletter;

    this.commonService.getCurrentUserRole().subscribe((role: any) => {
      this.role = role;
    });

    this.getCurrentUser().subscribe(() => {
      this.populateUsers();
      this.getProjectList();      
      this.getRealtime();
      this.setupWebSocket();
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
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
    if (!this.currentUser) return;
    if (this.role?.toLowerCase() === 'admin') {
      this.projectService.getprojects('', '').subscribe((response: any) => {
        this.projectList = response?.data?.projectList?.filter(project => project !== null) || [];
      });
    } else {
      this.projectService.getProjectByUserId(this.currentUser.id).subscribe((response: any) => {
        this.projectList = response?.data?.projectList?.filter(project => project !== null) || [];
      });
    }
  }

  populateUsers() {
    if (!this.currentUser) return;
    this.members = [];
    this.members.push({ id: this.currentUser?.id, name: 'Me', email: this.currentUser?.id });
    this.member = this.currentUser;
    this.timelog.getTeamMembers(this.member?.id).subscribe({
      next: (response: { data: any[] }) => {
        this.teamUser = response.data;
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email !== this.currentUser.email) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            });
          },
          error: error => console.log('Error fetching users:', error)
        });
      },
      error: error => console.log('Error fetching team members:', error)
    });
  }

  filterData() {
    if (this.selectedUser.length === 0) {
      this.realtime.onlineUsers = this.members.map(member => ({
        user: { id: member.id, firstName: member.name.split(' ')[0], lastName: member.name.split(' ')[1] || '' },
        isOnline: this.isUserOnline(member.id)
      }));
      this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length; // Update activeMember
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

  @ViewChild('realTime') content!: ElementRef;
  exportToPdf() {
    this.exportService.exportToPdf('RealTime', 'RealTime Report', this.content.nativeElement);
  }

  getRealtime() {
    if (!this.members || !this.member) return;
    this.timelog.getTeamMembers(this.member.id).subscribe((response: any) => {
      this.teamUser = response.data;
      let realtime = new RealTime();
      if (this.selectedProject && this.selectedProject.length > 0) {
        this.realtime.projects = this.selectedProject; // Fixed assignment
      }  
      if (this.selectedTask && this.selectedTask.length > 0) {
        this.realtime.tasks = this.selectedTask; // Fixed assignment
      }
      if (this.selectedUser && this.selectedUser.length > 0) {
        this.realtime.users = (this.role.toLowerCase() === 'admin') ? this.selectedUser : [...this.teamUser, this.currentUser.id];       
      }   
      this.timelog.realTime(realtime).subscribe(result => {
        this.realtime = result.data[0];
        this.getOnlineUsersByCompany();
        this.realtime.onlineUsers = this.realtime.onlineUsers.map(user => ({
          ...user,
          isOnline: this.isUserOnline(user.user.id)
        }));
        this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length; // Calculate activeMember
        this.showAllUserLiveButton = this.realtime.onlineUsers.filter(u => u.isOnline && u.user.id !== this.currentUser.id).length > 1;
      });      
    });
  }

  getOnlineUsersByCompany() {
    this.commonService.getOnlineUsersByCompany().subscribe((response: any) => {
      this.onlineUsers = response.data.onlineUsers || [];
      this.updateOnlineStatusInRealtime();
    });
  }

  setupWebSocket() {
    if (this.currentUser) {
      this.webSocketService.connect(this.currentUser.id);
      this.wsSubscription = this.webSocketService.getMessagesByType(WebSocketNotificationType.ALERT).subscribe(message => {
        const content = JSON.parse(message.content);
        if (content.userId && content.isOnline !== undefined) {
          this.updateUserStatus(content.userId, content.isOnline);
        }
      });
    }
  }

  updateUserStatus(userId: string, isOnline: boolean) {
    if (this.realtime?.onlineUsers) {
      const user = this.realtime.onlineUsers.find(u => u.user.id === userId);
      if (user) {
        user.isOnline = isOnline;
        this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length; // Update activeMember
        this.showAllUserLiveButton = this.realtime.onlineUsers.filter(u => u.isOnline && u.user.id !== this.currentUser.id).length > 1;
      } else {
        this.getRealtime(); // Refresh if user not found
      }
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.some(u => u.userId === userId && u.isOnline);
  }

  updateOnlineStatusInRealtime() {
    if (this.realtime?.onlineUsers) {
      this.realtime.onlineUsers = this.realtime.onlineUsers.map(user => ({
        ...user,
        isOnline: this.isUserOnline(user.user.id)
      }));
      this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length; // Update activeMember
    }
  }

  multipleUserLiveScreen() {
    const userIds = this.realtime.onlineUsers
      .filter(item => item.isOnline && item.user.id !== this.currentUser.id)
      .map(item => item.user.id);
    this.openLiveScreen(userIds);
  }

  singleUserLiveScreen(id: string) {
    this.openLiveScreen([id]);
  }

  openLiveScreen(userIds: string[]) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '60vw';
    dialogConfig.height = 'auto';
    dialogConfig.maxWidth = '100vw';
    dialogConfig.data = { id: userIds };
    dialogConfig.panelClass = 'no-padding-dialog';

    const dialogRef = this.dialog.open(LiveScreenComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log('The modal was closed');
    });
  }
}