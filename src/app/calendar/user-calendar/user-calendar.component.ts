import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from 'fullcalendar';
@Component({
  selector: 'app-user-calendar',
  templateUrl: './user-calendar.component.html',
  styleUrls: ['./user-calendar.component.css']
})
export class UserCalendarComponent implements OnInit {
  calendarPlugins = [dayGridPlugin];
 
  constructor() { }

  ngOnInit(): void {
    document.addEventListener('DOMContentLoaded', function() {
      let calendarEl: HTMLElement = document.getElementById('calendar')!;
    
      let calendar = new Calendar(calendarEl, {
       
      });
    
      calendar.render();
    });
  }

}
