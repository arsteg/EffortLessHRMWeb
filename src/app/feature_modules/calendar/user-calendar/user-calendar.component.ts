import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarService } from 'src/app/_services/calendar.service';
import { CompanyService } from 'src/app/_services/company.service';
import { LeaveService } from 'src/app/_services/leave.service';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-user-calendar',
  templateUrl: './user-calendar.component.html',
  styleUrls: ['./user-calendar.component.css']
})
export class UserCalendarComponent {
  selectedEvent: any = null;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  userLocation: string = null;
  weeklyOffDays: string[] = [];
  holidays: any[] = [];
  calendarOptions: any = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],  // empty initially
    //eventClick: this.onEventClick.bind(this)
    eventDidMount: (info) => {},
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay' // user can switch between the two
    }
  };
  constructor(
    private calendarService: CalendarService,
    private companyService: CompanyService,
    private leaveService: LeaveService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.getAllEvents();
  }

  getAllEvents() {
    const currentYear = new Date().getFullYear();
    const holidayRequest = { year: currentYear, skip: '', next: '' };
    const leaveRequest = {
      skip: '',
      next: '',
      status: '' // fetch all statuses (Pending, Approved, etc.)
    };

    forkJoin({
      userEvents: this.calendarService.getUserEvents(),
      holidays: this.companyService.getHolidays(holidayRequest),
      leaves: this.leaveService.getLeaveApplicationbyUser(leaveRequest, this.currentUser?.id),
      userEmployments: this.userService.getUserEmploymentByCompany(),
      attendanceTemplate: this.leaveService.getattendanceTemplatesByUser(this.currentUser?.id)
    }).subscribe({
      next: (results: any) => {
        const allEvents: any[] = [];

        // Get user's location from employment data
        const userEmployment = results.userEmployments?.data?.find(
          (emp: any) => emp.user === this.currentUser?.id || emp.user?._id === this.currentUser?.id
        );
        this.userLocation = userEmployment?.location || null;

        // Get weekly off days from attendance template
        this.weeklyOffDays = [];
        if (results.attendanceTemplate?.data?.[0]?.attendanceTemplate?.weeklyOfDays) {
          const dayNameMap: { [key: string]: string } = {
            'Sun': 'Sunday', 'Sat': 'Saturday', 'Mon': 'Monday',
            'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday'
          };
          results.attendanceTemplate.data[0].attendanceTemplate.weeklyOfDays.forEach((day: string) => {
            if (day !== 'false' && dayNameMap[day]) {
              this.weeklyOffDays.push(dayNameMap[day]);
            }
          });
        }

        // Store filtered holidays for later reference
        this.holidays = [];
        if (results.holidays?.data) {
          this.holidays = results.holidays.data.filter((holiday: any) => {
            if (holiday.locationAppliesTo === 'All-Locations' || !holiday.locationAppliesTo) {
              return true;
            }
            if (holiday.locationAppliesTo === 'Selected-Locations' && this.userLocation) {
              return holiday.holidayapplicableOffice?.some((hao: any) =>
                hao.office && (hao.office.name === this.userLocation ||
                              hao.office._id === this.userLocation ||
                              hao.office === this.userLocation)
              );
            }
            return false;
          });
        }

        // Generate weekoff events for the current year
        const weekoffEvents = this.generateWeekoffEvents(currentYear);
        allEvents.push(...weekoffEvents);

        // Add user events
        if (results.userEvents?.data) {
          allEvents.push(...results.userEvents.data);
        }

        // Add holidays
        const holidayEvents = this.holidays.map((holiday: any) => ({
          id: holiday._id || `holiday-${holiday.date}`,
          title: holiday.label || holiday.holidayName || 'Holiday',
          start: holiday.date,
          end: holiday.date,
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          textColor: '#ffffff',
          allDay: true,
          extendedProps: { type: 'holiday' }
        }));
        allEvents.push(...holidayEvents);

        // Add leave applications - split by day to handle weekoffs
        if (results.leaves?.data) {
          results.leaves.data.forEach((leave: any) => {
            const leaveEvents = this.generateLeaveEvents(leave);
            allEvents.push(...leaveEvents);
          });
        }

        this.calendarOptions.events = allEvents;
        this.calendarOptions.eventDidMount = (info) => {
          const event = info.event;
          const dateOnly = event.start ? event.start.toLocaleDateString() : '';
          const eventType = event.extendedProps?.type || 'event';
          const tooltipText = `${event.title}\n${dateOnly}\nType: ${eventType}`;
          info.el.setAttribute('title', tooltipText);
        };
        this.calendarOptions.headerToolbar = {
          left: 'prev,next',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek,dayGridDay'
        };
      },
      error: (error) => {
        console.error('Error fetching calendar events:', error);
        // Fallback to just user events if other APIs fail
        this.calendarService.getUserEvents().subscribe((res: any) => {
          this.calendarOptions.events = res.data || [];
        });
      }
    });
  }

  // Helper to format date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper to get day name
  getDayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  // Check if date is a holiday
  isDateHoliday(dateStr: string): boolean {
    return this.holidays.some((h: any) => {
      const holidayDate = this.formatDate(new Date(h.date));
      return holidayDate === dateStr;
    });
  }

  // Generate weekoff events for visible range (current year)
  generateWeekoffEvents(year: number): any[] {
    const weekoffEvents: any[] = [];
    if (!this.weeklyOffDays.length) return weekoffEvents;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayName = this.getDayName(currentDate);
      if (this.weeklyOffDays.includes(dayName)) {
        const dateStr = this.formatDate(currentDate);
        // Check if this date is not already a holiday
        if (!this.isDateHoliday(dateStr)) {
          weekoffEvents.push({
            id: `weekoff-${dateStr}`,
            title: 'Week Off',
            start: dateStr,
            end: dateStr,
            backgroundColor: '#adb5bd',
            borderColor: '#6c757d',
            textColor: '#212529',
            allDay: true,
            extendedProps: { type: 'weekoff' }
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekoffEvents;
  }

  // Generate leave events, considering leave category settings for weekoffs and holidays
  generateLeaveEvents(leave: any): any[] {
    const events: any[] = [];
    const status = leave.status?.toLowerCase();
    const leaveCategory = leave.leaveCategory;
    const categoryLabel = leaveCategory?.label || 'Leave';

    // Check if weekoffs and holidays should be counted as leave days
    const isWeeklyOffPartOfLeave = leaveCategory?.isWeeklyOffLeavePartOfNumberOfDaysTaken || false;
    const isHolidayPartOfLeave = leaveCategory?.isAnnualHolidayLeavePartOfNumberOfDaysTaken || false;

    let backgroundColor = '#ffc107'; // default yellow for pending
    let borderColor = '#ffc107';

    if (status === 'approved') {
      backgroundColor = '#17a2b8';
      borderColor = '#17a2b8';
    } else if (status === 'rejected') {
      backgroundColor = '#dc3545';
      borderColor = '#dc3545';
    } else if (status === 'cancelled') {
      backgroundColor = '#6c757d';
      borderColor = '#6c757d';
    }

    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate);
      const dayName = this.getDayName(currentDate);
      const isWeekoff = this.weeklyOffDays.includes(dayName);
      const isHoliday = this.isDateHoliday(dateStr);

      if (isWeekoff && !isHoliday) {
        // Weekoff day within leave period
        if (isWeeklyOffPartOfLeave) {
          // Show as leave (weekoff counts as leave)
          events.push({
            id: `${leave._id}-${dateStr}`,
            title: `${categoryLabel} (${leave.status || 'Pending'})`,
            start: dateStr,
            end: dateStr,
            backgroundColor,
            borderColor,
            textColor: '#ffffff',
            allDay: true,
            extendedProps: { type: 'leave', status: leave.status, isWeekoff: true }
          });
        }
        // If isWeeklyOffPartOfLeave is false, weekoff is already shown separately
      } else if (isHoliday) {
        // Holiday day within leave period
        if (isHolidayPartOfLeave) {
          // Show leave along with holiday (holiday already shown, add leave too)
          events.push({
            id: `${leave._id}-${dateStr}`,
            title: `${categoryLabel} (${leave.status || 'Pending'})`,
            start: dateStr,
            end: dateStr,
            backgroundColor,
            borderColor,
            textColor: '#ffffff',
            allDay: true,
            extendedProps: { type: 'leave', status: leave.status, isHoliday: true }
          });
        }
        // If isHolidayPartOfLeave is false, only holiday is shown
      } else {
        // Regular working day - show leave
        events.push({
          id: `${leave._id}-${dateStr}`,
          title: `${categoryLabel} (${leave.status || 'Pending'})`,
          start: dateStr,
          end: dateStr,
          backgroundColor,
          borderColor,
          textColor: '#ffffff',
          allDay: true,
          extendedProps: { type: 'leave', status: leave.status }
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  onEventClick(clickInfo: EventClickArg) {
    this.selectedEvent = {
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      id: clickInfo.event.id
    };
    console.log('Selected Event:', this.selectedEvent);
  }
}
