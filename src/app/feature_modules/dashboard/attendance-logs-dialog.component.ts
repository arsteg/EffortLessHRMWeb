import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AttendanceLog {
  type: string;
  timestamp: string;
}

export interface AttendanceLogsDialogData {
  employeeName: string;
  date: string;
  logs: AttendanceLog[];
}

@Component({
  selector: 'app-attendance-logs-dialog',
  template: `
    <h2 mat-dialog-title>Attendance Details</h2>
    <mat-dialog-content>
      <div class="mb-3">
        <p class="mb-1"><strong>Employee:</strong> {{data.employeeName}}</p>
        <p class="mb-1"><strong>Date:</strong> {{data.date}}</p>
      </div>

      @if(data.logs && data.logs.length > 0) {
        <div class="table-responsive">
          <table class="table table-bordered table-sm">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              @for(log of sortedLogs; track log; let i = $index) {
                <tr>
                  <td>{{i + 1}}</td>
                  <td>
                    @if(log.type === 'check-in') {
                      <span class="badge bg-success">Check-In</span>
                    } @else {
                      <span class="badge bg-info">Check-Out</span>
                    }
                  </td>
                  <td>{{formatTime(log.timestamp)}}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="text-muted text-center py-3">No attendance records for this day</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      max-width: 600px;
    }
  `]
})
export class AttendanceLogsDialogComponent {
  sortedLogs: AttendanceLog[] = [];

  constructor(
    public dialogRef: MatDialogRef<AttendanceLogsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AttendanceLogsDialogData
  ) {
    // Sort logs by timestamp
    this.sortedLogs = [...(data.logs || [])].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return timestamp;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
