import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogService } from 'src/app/_services/log.service';

@Component({
  selector: 'app-log.component',
  standalone: true,
  imports: [],
  templateUrl: './log.component.component.html',
  styleUrl: './log.component.component.css'
})
export class LogComponentComponent implements OnInit, OnDestroy {
  userId = 'user1'; // Replace with the selected user ID
  logs: any[] = [];
  private logSubscription: Subscription;

  constructor(private logService: LogService) {}

  ngOnInit() {
    // Listen for logs for the selected user
    this.logSubscription = this.logService.listenForLogs(this.userId).subscribe((log) => {
      this.logs.unshift(log); // Add new log to the top of the list
    });
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

