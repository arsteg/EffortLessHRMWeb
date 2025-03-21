import { Component, Inject, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { WebSocketService, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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
  isMinimized: boolean = false;
  isMaximized: boolean = false;
  originalSize: { width: string; height: string } = { width: '60vw', height: 'auto' };

  @ViewChild('header', { static: false }) header!: ElementRef;

  private isDragging = false;
  private initialX!: number;
  private initialY!: number;
  private currentX = 0;
  private currentY = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<LiveScreenComponent>,
    private sanitizer: DomSanitizer,
    private wsService: WebSocketService,
    private commonService: CommonService,
    private timelog: TimeLogService
  ) {
    this.userIds = Array.isArray(data.id) ? data.id : [data.id];
    this.isSingle = this.userIds.length === 1;
  }

  ngOnInit(): void {
    this.commonService.populateUsers().subscribe(result => {
      this.allUsers = result?.data?.data || [];
    });

    this.userIds.forEach(userId => {
      this.wsService.connect(userId);
      const sub = this.wsService.getMessagesByType(WebSocketNotificationType.SCREENSHOT)
        .subscribe(message => {
          if (message.contentType === 'image') {
            const imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              `data:image/jpeg;base64,${message.content}`
            );
            this.imageUrls[userId] = imageUrl;
          }
        });
      this.wsSubscription.add(sub);
    });

    this.timelog.createLiveScreenRecord({ users: this.userIds })
      .subscribe({
        error: (err) => console.error('Failed to create live screen record:', err)
      });

    // Center the dialog initially
    this.dialogRef.updatePosition({ top: '50px', left: '50px' });
  }

  ngAfterViewInit(): void {
    const headerEl = this.header.nativeElement;
    headerEl.addEventListener('mousedown', this.startDragging.bind(this));
    document.addEventListener('mousemove', this.drag.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
  }

  startDragging(event: MouseEvent): void {
    if (this.isMaximized || this.isMinimized) return; // Disable dragging when maximized or minimized
    this.isDragging = true;
    this.initialX = event.clientX - this.currentX;
    this.initialY = event.clientY - this.currentY;
    event.preventDefault(); // Prevent text selection
  }

  drag(event: MouseEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    this.currentX = event.clientX - this.initialX;
    this.currentY = event.clientY - this.initialY;

    // Update dialog position
    this.dialogRef.updatePosition({
      top: `${this.currentY}px`,
      left: `${this.currentX}px`
    });
  }

  stopDragging(): void {
    this.isDragging = false;
  }

  getUserName(userId: string): string {
    const user = this.allUsers.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  }

  minimizeDialog(): void {
    this.isMinimized = !this.isMinimized;
    this.isMaximized = false;
    if (this.isMinimized) {
      this.dialogRef.updateSize('300px', '50px');
    } else {
      this.dialogRef.updateSize(this.originalSize.width, this.originalSize.height);
    }
  }

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
    this.isMinimized = false;
    if (this.isMaximized) {
      this.dialogRef.updateSize('100vw', '100vh');
      this.dialogRef.updatePosition({ top: '0px', left: '0px' }); // Fullscreen position
    } else {
      this.dialogRef.updateSize(this.originalSize.width, this.originalSize.height);
      this.dialogRef.updatePosition({ top: '50px', left: '50px' }); // Restore position
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.userIds, event.previousIndex, event.currentIndex);
  }

  ngOnDestroy(): void {
    this.wsSubscription.unsubscribe();
    this.userIds.forEach(userId => this.wsService.disconnect());
    this.timelog.removeLiveScreenRecord({ users: this.userIds })
      .subscribe({
        error: (err) => console.error('Failed to remove live screen record:', err)
      });

    // Clean up event listeners
    const headerEl = this.header?.nativeElement;
    if (headerEl) {
      headerEl.removeEventListener('mousedown', this.startDragging.bind(this));
    }
    document.removeEventListener('mousemove', this.drag.bind(this));
    document.removeEventListener('mouseup', this.stopDragging.bind(this));
  }
}