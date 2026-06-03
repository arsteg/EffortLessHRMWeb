import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { WebSocketService, WebSocketNotificationType } from 'src/app/_services/web-socket.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AttendanceLogsDialogComponent } from '../attendance-logs-dialog.component';

@Component({
  selector: 'app-attendance-overview',
  templateUrl: './attendance-overview.component.html',
  styleUrls: ['./attendance-overview.component.scss']
})
export class AttendanceOverviewComponent implements OnInit, OnDestroy {
  readonly dialog = inject(MatDialog);

  // Mobile App Attendance Overview
  attendanceOffices: any[] = [];
  selectedOffice: string = 'all';
  selectedAttendanceView: string = 'daily';
  attendanceOverviewData: any = null;
  attendanceSummary: any = null;
  private attendanceWebSocketSubscription: Subscription;

  // Cache for week and month days
  private cachedWeekDays: Date[] | null = null;
  private cachedMonthDays: Date[] | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private webSocketService: WebSocketService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAttendanceOffices();
    this.loadMobileAttendanceOverview();
    this.setupAttendanceWebSocketListener();
  }

  loadAttendanceOffices(): void {
    this.attendanceService.getAttendanceOffices().subscribe({
      next: (response: any) => {
        if (response?.status === 'success' && response?.data?.offices) {
          this.attendanceOffices = response.data.offices;
        }
      },
      error: (err) => {
        console.error('Error loading attendance offices:', err);
      }
    });
  }

  loadMobileAttendanceOverview(): void {
    const officeId = this.selectedOffice === 'all' ? undefined : this.selectedOffice;

    // Clear cache when loading new data
    this.cachedWeekDays = null;
    this.cachedMonthDays = null;

    this.attendanceService.getMobileAttendanceOverview(officeId, this.selectedAttendanceView).subscribe({
      next: (response: any) => {
        console.log('Attendance Overview Response:', response);
        if (response?.status === 'success' && response?.data) {
          this.attendanceOverviewData = response.data.attendanceData;
          this.attendanceSummary = response.data.summary;
          console.log('Attendance Data:', this.attendanceOverviewData);
          console.log('Summary:', this.attendanceSummary);
        } else {
          console.warn('Unexpected response format:', response);
        }
      },
      error: (err) => {
        console.error('Error loading mobile attendance overview:', err);
        this.toastr.error('Failed to load attendance overview');
      }
    });
  }

  onOfficeChange(officeId: string): void {
    this.selectedOffice = officeId;
    this.loadMobileAttendanceOverview();
  }

  onAttendanceViewChange(viewType: string): void {
    this.selectedAttendanceView = viewType;
    this.loadMobileAttendanceOverview();
  }

  setupAttendanceWebSocketListener(): void {
    this.attendanceWebSocketSubscription = this.webSocketService
      .getMessagesByType(WebSocketNotificationType.ATTENDANCE_UPDATE)
      .subscribe({
        next: (message: any) => {
          try {
            const content = typeof message.content === 'string' ? JSON.parse(message.content) : message.content;

            if (content?.type === 'mobile-overview-update' && content?.data) {
              const receivedOfficeId = content.data.officeId || 'all';
              const receivedCompanyId = content.data.companyId;

              // SECURITY: Additional frontend validation (backend already ensures this)
              // Note: Backend already filters by company, this is defense in depth
              if (!receivedCompanyId) {
                console.warn('⚠ Received attendance update without companyId');
              }

              // Only update if the viewType matches AND the office matches
              const viewTypeMatches = content.data.viewType === this.selectedAttendanceView;
              const officeMatches = this.selectedOffice === 'all' ||
                                   receivedOfficeId === 'all' ||
                                   receivedOfficeId === this.selectedOffice;

              if (viewTypeMatches && officeMatches) {
                console.log(`✓ Received real-time attendance update (${content.data.viewType} view, office: ${receivedOfficeId}, company: ${receivedCompanyId})`);

                this.attendanceOverviewData = content.data.attendanceData;
                this.attendanceSummary = content.data.summary;

                // Show subtle notification that data was updated
                this.toastr.info('Attendance data updated', '', {
                  timeOut: 2000,
                  positionClass: 'toast-top-right'
                });
              } else {
                console.log(`Skipping update: viewType=${content.data.viewType} (selected: ${this.selectedAttendanceView}), office=${receivedOfficeId} (selected: ${this.selectedOffice})`);
              }
            }
          } catch (error) {
            console.error('Error processing attendance WebSocket message:', error);
          }
        },
        error: (err) => {
          console.error('Attendance WebSocket error:', err);
        }
      });
  }

  // Helper methods for weekly/monthly attendance views
  getWeekDays(): Date[] {
    if (this.cachedWeekDays) {
      return this.cachedWeekDays;
    }

    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    // Get Monday of current week (day 1 = Monday, 0 = Sunday)
    monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday.getTime());
      day.setDate(day.getDate() + i);
      weekDays.push(day);
    }

    this.cachedWeekDays = weekDays;
    return weekDays;
  }

  getMonthDays(): Date[] {
    if (this.cachedMonthDays) {
      return this.cachedMonthDays;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push(new Date(year, month, i));
    }

    this.cachedMonthDays = monthDays;
    return monthDays;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  formatDate(date: Date, format: string = 'DD MMM'): string {
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `${day} ${month}`;
  }

  getAttendanceForDate(employee: any, date: Date): any {
    if (!employee.dailyRecords) return null;

    // Use local date components to avoid timezone shift when matching records
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    const record = employee.dailyRecords[dateKey];

    if (!record || !record.checkIn) {
      return { status: 'Absent', checkIn: null, checkOut: null, hours: '-', allLogs: [], dateKey };
    }

    // Check if the date is in the past (not today)
    const now = new Date();
    const recordDate = new Date(date);
    recordDate.setHours(23, 59, 59, 999);
    const isPastDate = recordDate < now;

    // Convert UTC timestamps to user's local timezone for display
    const checkInTime = new Date(record.checkIn);
    let checkOutTime = record.checkOut ? new Date(record.checkOut) : null;

    // Validate check-out is after check-in
    if (checkOutTime && checkOutTime.getTime() <= checkInTime.getTime()) {
      checkOutTime = null; // Invalid checkout, ignore it
    }

    let hours = '-';
    let checkOutDisplay = '-';
    let status = record.status || 'Absent';

    if (checkOutTime) {
      // Valid checkout exists
      const diff = checkOutTime.getTime() - checkInTime.getTime();
      const totalHours = diff / (1000 * 60 * 60);
      const h = Math.floor(totalHours);
      const m = Math.round((totalHours % 1) * 60);
      hours = `${h}h ${m}m`;
      checkOutDisplay = checkOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      status = 'Present';
    } else if (record.checkIn && isPastDate) {
      // Past date with missing checkout
      hours = '-';
      checkOutDisplay = 'Missing';
      status = 'Absent';
    } else if (record.checkIn) {
      // Today and still working
      const now = new Date();
      const diff = now.getTime() - checkInTime.getTime();
      const totalHours = diff / (1000 * 60 * 60);
      const h = Math.floor(totalHours);
      const m = Math.round((totalHours % 1) * 60);
      hours = `${h}h ${m}m`;
      checkOutDisplay = 'Working...';
      status = 'Checked In';
    }

    return {
      status: status,
      checkIn: checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      checkOut: checkOutDisplay,
      hours: hours,
      allLogs: record.allLogs || [],
      dateKey: dateKey
    };
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Present' || status === 'Checked In') return 'bg-success';
    if (status === 'Absent') return 'bg-danger';
    return 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    if (status === 'Present') return 'P';
    if (status === 'Absent') return 'A';
    if (status === 'Checked In') return 'P';
    return 'W';
  }

  formatTimeToLocal(timeString: string): string {
    if (!timeString || timeString === '-' || timeString === 'Working...' || timeString === 'Checkout Missing') {
      return timeString;
    }

    try {
      const date = new Date(timeString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return timeString;
      }
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  }

  isCheckoutMissing(checkoutValue: string): boolean {
    return checkoutValue === 'Checkout Missing' || checkoutValue === 'Missing';
  }

  openAttendanceLogsDialog(employee: any, date?: Date, attendanceData?: any): void {
    let logs = [];
    let dateString = '';

    // For daily view
    if (!date && employee.allLogs) {
      logs = employee.allLogs;
      const today = new Date();
      dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // For weekly/monthly views
    else if (date && attendanceData && attendanceData.allLogs) {
      logs = attendanceData.allLogs;
      dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (!logs || logs.length === 0) {
      this.toastr.info('No attendance logs available for this day', 'Info');
      return;
    }

    this.dialog.open(AttendanceLogsDialogComponent, {
      width: '500px',
      data: {
        employeeName: employee.name,
        date: dateString,
        logs: logs
      }
    });
  }

  ngOnDestroy(): void {
    if (this.attendanceWebSocketSubscription) {
      this.attendanceWebSocketSubscription.unsubscribe();
    }
  }
}
