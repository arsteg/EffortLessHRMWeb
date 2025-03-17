import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.Module';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { WebSocketNotification } from 'src/app/models/eventNotification/eventNotitication';
import { CompanyService } from 'src/app/_services/company.service';
import { company } from 'src/app/models/company';
import { UserService } from 'src/app/_services/users.service';
import { CommonService } from 'src/app/_services/common.Service';
import { WebSocketNotificationType, WebSocketService } from 'src/app/_services/web-socket.service';

@Component({
  selector: 'app-log.component',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './log.component.component.html',
  styleUrl: './log.component.component.css'
})

export class LogComponent implements OnInit, OnDestroy {
  selectedUserId: string = '';
  companies: company[] = [];
  users: any[] = [];
  selectedCompany: string = '';
  displayedColumns: string[] = ['timestamp', 'message'];
  messages: MatTableDataSource<any> = new MatTableDataSource([]);
  private webSocketSubscription: Subscription | null = null;

  constructor(
    private toast: ToastrService,
    private companyService: CompanyService,
    private userService: UserService,
    private webSocketService: WebSocketService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.loadCompanies();
    this.subscribeToLogs();
  }

  private subscribeToLogs(): void {
    this.webSocketSubscription = this.webSocketService
      .getMessagesByType(WebSocketNotificationType.LOG)
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
        },
        error: (error) => console.error('Error setting selected user:', error)
      });
    }
  }

  onClear(): void {
    this.messages.data = [];
  }

  onStop(): void {
    this.selectedUserId = '';
    this.users = [];
    this.messages.data = [];
  }

  ngOnDestroy() {
    this.webSocketSubscription?.unsubscribe();
    // Commenting out disconnect to keep WebSocket alive across components
    // this.webSocketService.disconnect();
  }
}

