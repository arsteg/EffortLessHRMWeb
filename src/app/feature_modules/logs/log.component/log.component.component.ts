import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/_services/log.service';
import { SharedModule } from 'src/app/shared/shared.Module';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { WebSocketNotification } from 'src/app/models/eventNotification/eventNotitication';
import { CompanyService } from 'src/app/_services/company.service';
import { company } from 'src/app/models/company';
import { UserService } from 'src/app/_services/users.service';
import { CommonService } from 'src/app/_services/common.Service';
import { WebSocketService } from 'src/app/_services/web-socket.service';

@Component({
  selector: 'app-log.component',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './log.component.component.html',
  styleUrl: './log.component.component.css'
})

export class LogComponentComponent implements OnInit, OnDestroy {
  userId = ''; // Replace with the selected user ID
  logs: any[] = [];
  private logSubscription: Subscription | null = null;
  private webSocketSubscription: Subscription | null = null;
  companies: company[] = [];
  users: any[] = [];
  selectedCompany: string = '';
  displayedColumns: string[] = ['timestamp', 'message'];  
  message = '';
  messages: MatTableDataSource<any> = new MatTableDataSource([]);

  constructor(
    private logService: LogService,
    private toast: ToastrService,
    private companyService: CompanyService,
    private userService: UserService,
    private webSocketService: WebSocketService,
    private commonService: CommonService
  ) {    
  }

  ngOnInit() {
    this.loadCompanies();
    this.connectToWebSocket();
  }

  connectToWebSocket() {
    this.webSocketService.connect();
    this.webSocketSubscription = this.webSocketService.messages$.subscribe({
      next: (message) => {
        this.messages.data = [...this.messages.data, message]; // Update the data source
        console.log(this.messages.data);
      },
      error: (error) => console.error('WebSocket subscription error:', error)
    });
  }

  onCompanyChange() {
    this.userId = '';
    this.users = [];
    this.logs = [];
  
    if (this.selectedCompany) {
      this.userService.getUsersByCompany(this.selectedCompany).subscribe({
        next: (response) => {
          this.users = response.data?.users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
    }
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (response) => {
        this.companies = response.data;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        // Handle error appropriately
      }
    });
  }

  onUserChange() {
    // Clear previous logs
    this.logs = [];

    if (this.userId) {
      this.commonService.setSelectedUser({
        "userId": this.userId
      }).subscribe({
        next: (response) => {
          this.toast.success('User for log set successfully');
        },
        error: (error) => {
          console.error('Error loading logs:', error);
          // Handle error appropriately
        }
      });
    }
  }

  ngOnDestroy() {
    // Clean up the subscription
    if (this.logSubscription) {
      this.logSubscription.unsubscribe();
    }
    // Disconnect the WebSocket connection
    this.webSocketService.disconnect();
  }

  onClear(){
    this.messages.data = [];
  }

  onStop() {
    this.userId = '';
    this.users = [];
  }
}

