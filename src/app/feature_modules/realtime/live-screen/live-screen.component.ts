import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { WebSocketService, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';

@Component({
  selector: 'app-live-screen',
  templateUrl: './live-screen.component.html',
  styleUrls: ['./live-screen.component.css']
})
export class LiveScreenComponent implements OnInit, OnDestroy {
  userIds: string[];
  isSingle: boolean;
  imageUrls: { [key: string]: SafeUrl } = {};
  allUsers: any[] = [];
  private wsSubscription: Subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
    private wsService: WebSocketService,
    private commonService: CommonService,
    private timelog: TimeLogService
  ) {
    this.userIds = Array.isArray(data.id) ? data.id : [data.id];
    this.isSingle = this.userIds.length === 1;
  }

  ngOnInit(): void {
    // Load user details
    this.commonService.populateUsers().subscribe(result => {
      this.allUsers = result?.data?.data || [];
    });

    // Connect WebSocket and subscribe to screenshots
    this.userIds.forEach(userId => {      
      this.wsService.connect(userId);
      
      const sub = this.wsService.getMessagesByType(WebSocketNotificationType.SCREENSHOT)
        .subscribe(message => {
          if (message.contentType === 'image' ) {
            const imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:image/jpeg;base64,${message.content}`
            );
            this.imageUrls[userId] = imageUrl;
          }
        });
      this.wsSubscription.add(sub);
    });

    // Create live screen record
    this.timelog.createLiveScreenRecord({ users: this.userIds })
      .subscribe({
        error: (err) => console.error('Failed to create live screen record:', err)
      });
  }

  getUserName(userId: string): string {
    const user = this.allUsers.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  ngOnDestroy(): void {
    // Clean up WebSocket connections
    this.wsSubscription.unsubscribe();
    this.userIds.forEach(userId => this.wsService.disconnect());
    
    // Remove live screen record
    this.timelog.removeLiveScreenRecord({ users: this.userIds })
      .subscribe({
        error: (err) => console.error('Failed to remove live screen record:', err)
      });
  }
}