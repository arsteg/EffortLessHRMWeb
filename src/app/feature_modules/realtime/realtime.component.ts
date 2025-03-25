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
  selectedUser: any[] = [];
  selectedProject: any[] = [];
  selectedTask: any[] = [];
  taskList: any[] = [];
  projectList: any;
  searchText = '';
  currentUser: any;
  realtime: any = {}; // Initialize to avoid undefined errors
  members: any[] = [];
  member: any;
  onlineUsers: any[] = [];
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
    console.log('ngOnInit started');
    this.commonService.getCurrentUserRole().subscribe({
      next: (role: any) => {
        this.role = role;
        console.log('Role:', this.role);
      },
      error: err => console.error('Error fetching role:', err)
    });

    this.getCurrentUser().subscribe({
      next: () => {
        console.log('Current user fetched:', this.currentUser);
        this.populateUsers();
        this.getProjectList();
        this.getRealtime();
        this.setupWebSocket();
      },
      error: err => console.error('Error in getCurrentUser:', err)
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
      this.projectService.getprojects('', '').subscribe({
        next: (response: any) => {
          this.projectList = response?.data?.projectList?.filter(project => project !== null) || [];
          console.log('Project list:', this.projectList);
        },
        error: err => console.error('Error fetching projects:', err)
      });
    } else {
      this.projectService.getProjectByUserId(this.currentUser.id).subscribe({
        next: (response: any) => {
          this.projectList = response?.data?.projectList?.filter(project => project !== null) || [];
          console.log('Project list:', this.projectList);
        },
        error: err => console.error('Error fetching user projects:', err)
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
        console.log('Team users:', this.teamUser);
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email !== this.currentUser.email) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            });
            console.log('Members populated:', this.members);
          },
          error: error => console.error('Error fetching users:', error)
        });
      },
      error: error => console.error('Error fetching team members:', error)
    });
  }

  filterData() {
    console.log('filterData called with selectedUser:', this.selectedUser);
    if (this.selectedUser.length === 0) {
      // Show all members when no users are selected
      this.realtime.onlineUsers = this.members.map(member => ({
        user: { id: member.id, firstName: member.name.split(' ')[0], lastName: member.name.split(' ')[1] || '' },
        isOnline: this.isUserOnline(member.id)
      }));
      this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length;
      this.showAllUserLiveButton = this.realtime.onlineUsers.filter(u => u.isOnline && u.user.id !== this.currentUser.id).length > 0;
      console.log('No filter applied, onlineUsers:', this.realtime.onlineUsers);
    } else {
      // Fetch filtered data for selected users
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
    if (!this.members || !this.member) {
      console.warn('getRealtime skipped: members or member not set');
      return;
    }
    this.timelog.getTeamMembers(this.member.id).subscribe({
      next: (response: any) => {
        this.teamUser = response.data;
        console.log('Team members in getRealtime:', this.teamUser);
        let realtime = new RealTime();
        if (this.selectedProject?.length > 0) {
          this.realtime.projects = this.selectedProject; // Corrected to local realtime
        }
        if (this.selectedTask?.length > 0) {
          this.realtime.tasks = this.selectedTask; // Corrected to local realtime
        }
        if (this.selectedUser?.length > 0) {
          this.realtime.users = this.selectedUser; // Send only selected users to the backend
        } else if (this.role?.toLowerCase() === 'admin') {
          this.realtime.users = this.members.map(m => m.id); // All members for admin
        } else {
          this.realtime.users = [...this.teamUser, this.currentUser.id]; // Default team for non-admin
        }
        console.log('Sending realtime filter:', realtime);
        this.timelog.realTime(realtime).subscribe({
          next: (result) => {
            this.realtime = result.data[0] || {};
            console.log('Realtime data received:', this.realtime);
            this.getOnlineUsersByCompany();
            // Filter onlineUsers to only include selected users if any are selected
            this.realtime.onlineUsers = (this.realtime.onlineUsers || []).map(user => ({
              ...user,
              isOnline: this.isUserOnline(user.user.id)
            })).filter(user => this.selectedUser.length === 0 || this.selectedUser.includes(user.user.id));
            this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length;
            this.showAllUserLiveButton = this.realtime.onlineUsers.filter(u => u.isOnline && u.user.id !== this.currentUser.id).length > 0;
            console.log('Filtered onlineUsers:', this.realtime.onlineUsers);
          },
          error: err => console.error('Error in timelog.realTime:', err)
        });
      },
      error: err => console.error('Error fetching team members in getRealtime:', err)
    });
  }

  getOnlineUsersByCompany() {
    this.commonService.getOnlineUsersByCompany().subscribe({
      next: (response: any) => {
        this.onlineUsers = response.data.onlineUsers || [];
        console.log('Online users fetched:', this.onlineUsers);
        this.updateOnlineStatusInRealtime();
      },
      error: err => console.error('Error fetching online users:', err)
    });
  }

  setupWebSocket() {
    if (this.currentUser) {
      this.webSocketService.connect(this.currentUser.id);
      this.wsSubscription = this.webSocketService.getMessagesByType(WebSocketNotificationType.ALERT).subscribe({
        next: message => {
          const content = JSON.parse(message.content);
          if (content.userId && content.isOnline !== undefined) {
            this.updateUserStatus(content.userId, content.isOnline);
            console.log('User status updated:', content.userId, 'isOnline:', content.isOnline);
          }
        },
        error: err => console.error('WebSocket error:', err)
      });
    }
  }

  updateUserStatus(userId: string, isOnline: boolean) {
    if (this.realtime?.onlineUsers) {
      const user = this.realtime.onlineUsers.find(u => u.user.id === userId);
      if (user) {
        user.isOnline = isOnline;
        this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length;
        this.showAllUserLiveButton = this.realtime.onlineUsers.filter(u => u.isOnline && u.user.id !== this.currentUser.id).length > 0;
        console.log('User status updated:', userId, 'isOnline:', isOnline, 'showAllUserLiveButton:', this.showAllUserLiveButton);
      } else if (this.selectedUser.length === 0 || this.selectedUser.includes(userId)) {
        // Refresh if the user is relevant to the current filter
        this.getRealtime();
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
      })).filter(user => this.selectedUser.length === 0 || this.selectedUser.includes(user.user.id));
      this.realtime.activeMember = this.realtime.onlineUsers.filter(u => u.isOnline).length;
      console.log('Online status updated with filter:', this.realtime.onlineUsers);
    }
  }

  multipleUserLiveScreen() {
    const userIds = this.realtime.onlineUsers
      .filter(item => item.isOnline)
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