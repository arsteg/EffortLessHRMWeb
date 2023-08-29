import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from 'fullcalendar'; 
@Component({
  selector: 'app-user-calendar',
  templateUrl: './user-calendar.component.html',
  styleUrls: ['./user-calendar.component.css']
})
export class UserCalendarComponent {
  calendarPlugins = [dayGridPlugin];
  calendarEvents= [
    {
      title: 'Today',
      start: new Date(),
      end: new Date()
    },
    {
      title: 'User Birthday',
      start: new Date(),
      end: new Date()
    },
    {
      title: 'Event 2',
      start: '2023-08-15',
      end: '2023-08-16'
    }
  ]
  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    const calendarEl: HTMLElement = this.elementRef.nativeElement.querySelector('#calendar');

    const calendar = new Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev today next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: this.calendarEvents
    });

    calendar.render();
  }

}
