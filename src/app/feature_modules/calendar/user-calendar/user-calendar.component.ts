import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarService } from 'src/app/_services/calendar.service';
@Component({
  selector: 'app-user-calendar',
  templateUrl: './user-calendar.component.html',
  styleUrls: ['./user-calendar.component.css']
})
export class UserCalendarComponent {
  selectedEvent: any = null;
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
  constructor(private calendarService: CalendarService) { }

  ngOnInit(): void {
    this.getAllEvents();
  }

  getAllEvents() {
    this.calendarService.getUserEvents().subscribe((res: any) => {
      this.calendarOptions.events = res.data;
      //this.calendarOptions.eventClick = this.onEventClick.bind(this);
      this.calendarOptions.eventDidMount = (info) => {
        const event = info.event;
        const dateOnly = event.start ? event.start.toLocaleDateString() : '';
        // Create tooltip text with event title and formatted start date/time
        const tooltipText = `${event.title}\n${dateOnly}`;
        info.el.setAttribute('title', tooltipText);
      },
      this.calendarOptions.headerToolbar = {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay' // user can switch between the two
      }
    });
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
