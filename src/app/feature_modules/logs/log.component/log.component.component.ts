// log.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from 'src/app/shared/shared.Module';
import { WebSocketNotificationType, WebSocketService } from 'src/app/_services/web-socket.service';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
import { CommonService } from 'src/app/_services/common.Service';
import { company } from 'src/app/models/company';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './log.component.component.html',
  styleUrls: ['./log.component.component.css']
})
export class LogComponent implements OnInit, OnDestroy {
  selectedUserId: string = '';
  selectedCompany: string = '';
  selectedLogLevels: string[] = [];
  companies: company[] = [];
  users: any[] = [];
  messages: MatTableDataSource<any> = new MatTableDataSource([]);
  displayedColumns: string[] = ['timestamp', 'message'];
  logLevels: string[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  private webSocketSubscription: Subscription | null = null;

  constructor(
    private toast: ToastrService,
    private companyService: CompanyService,
    private userService: UserService,
    private webSocketService: WebSocketService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.subscribeToLogs();
    this.fetchLogLevel();
  }

  ngOnDestroy(): void {
    this.webSocketSubscription?.unsubscribe();
  }

  private subscribeToLogs(): void {
    this.webSocketSubscription = this.webSocketService
      .getMessagesByType(WebSocketNotificationType.SCREENSHOT)
      .subscribe({
        next: (message) => {
          this.messages.data = [...this.messages.data, message];
          console.log('Log received:', message);
        },
        error: (error) => console.error('WebSocket log subscription error:', error)
      });
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (response) => this.companies = response.data,
      error: (error) => console.error('Error loading companies:', error)
    });
  }

  onCompanyChange(): void {
    this.selectedUserId = '';
    this.users = [];
    this.messages.data = [];
    if (this.selectedCompany) {
      this.userService.getUsersByCompany(this.selectedCompany).subscribe({
        next: (response) => this.users = response.data?.users || [],
        error: (error) => console.error('Error loading users:', error)
      });
    }
  }

  onUserChange(): void {
    this.messages.data = [];
    if (this.selectedUserId) {
      this.commonService.setSelectedUser({ userId: this.selectedUserId }).subscribe({
        next: () => {
          this.toast.success('User for log set successfully');
          this.webSocketService.connect(this.selectedUserId);
          this.fetchLogLevel();
        },
        error: (error) => console.error('Error setting selected user:', error)
      });
    }
  }

  fetchLogLevel(): void {   
    
    this.commonService.getLogLevels().subscribe({
      next: (response) => {
        this.selectedLogLevels = response.data || [];
      },
      error: (error) => console.error('Error fetching log levels:', error)
    });
  }

  updateLogLevel(): void {  

    this.commonService.setLogLevels(this.selectedLogLevels).subscribe({
      next: () => {
        this.toast.success('Log levels updated successfully');
      },
      error: (error) => console.error('Error updating log levels:', error)
    });
  }

  onClear(): void {
    this.messages.data = [];
  }

  onStop(): void {
    this.selectedUserId = '';
    this.selectedCompany = '';
    this.users = [];
    this.messages.data = [];
    this.selectedLogLevels = [];
  }
}