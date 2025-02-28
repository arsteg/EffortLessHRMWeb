import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/_services/log.service';
import { SharedModule } from 'src/app/shared/shared.Module';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-log.component',
  standalone: true,
  imports: [ SharedModule ],
  templateUrl: './log.component.component.html',
  styleUrl: './log.component.component.css'
})

export class LogComponentComponent implements OnInit, OnDestroy {
  userId = '62dfa8d13babb9ac2072863c'; // Replace with the selected user ID
  logs: any[] = [];
  private logSubscription: Subscription;
  companies: any[] = [];
  users: any[] = [];
  
  selectedCompany: string = '';

  displayedColumns: string[] = ['timestamp', 'message'];
  dataSource: MatTableDataSource<any>;


  constructor(private logService: LogService, private toast: ToastrService) {}

  ngOnInit() {
    //Listen for logs for the selected user
    this.logSubscription = this.logService.listenForLogs(this.userId).subscribe((log) => {
      console.log('listen socket');
      this.logs.unshift(log); // Add new log to the top of the list
      },
      err => {
        this.toast.error(`Error: ${err.message}`, 'Error!!!');
    });
    this.loadCompanies();

    let selectedUser = {
      userId: this.userId,
    };

    this.logService.setSelectedUser(selectedUser).subscribe((res: any) => {
      console.log(res.data);
      const retdata = res.data;
    },
      err => {
        this.toast.error('Selected user can not be set', 'Error!!!')
    });

    this.logService.getLogForloggedInUser().subscribe((log) => {
      console.log('called');
    });
  }

  loadCompanies() {
    // this.logService.getCompanies().subscribe({
    //   next: (companies) => {
    //     this.companies = companies;
    //   },
    //   error: (error) => {
    //     console.error('Error loading companies:', error);
    //     // Handle error appropriately
    //   }
    // });
  }

  onCompanyChange() {
    // Reset user selection and users list when company changes
    this.userId = '';
    this.users = [];
    this.logs = [];

    if (this.selectedCompany) {
      // this.logService.getUsersByCompany(this.selectedCompany).subscribe({
      //   next: (users) => {
      //     this.users = users;
      //   },
      //   error: (error) => {
      //     console.error('Error loading users:', error);
      //     // Handle error appropriately
      //   }
      // });
    }
  }

  onUserChange() {
    // Clear previous logs
    this.logs = [];

    if (this.userId) {
      // this.logService.getUserLogs(this.selectedUser).subscribe({
      //   next: (logs) => {
      //     this.logs = logs;
      //   },
      //   error: (error) => {
      //     console.error('Error loading logs:', error);
      //     // Handle error appropriately
      //   }
      // });
    }
  }

  ngOnDestroy() {
    // Clean up the subscription
    if (this.logSubscription) {
      this.logSubscription.unsubscribe();
    }
    // Disconnect the WebSocket connection
    this.logService.disconnect();
  }
}

