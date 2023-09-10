import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core'; 

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './admin-calendar.component.html',
  styleUrls: ['./admin-calendar.component.css']
})
export class AdminCalendarComponent{
  calendarPlugins = [dayGridPlugin];
  searchText: string = '';
  showAddMilestone: boolean = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  // ngOnInit(): void {
  //   document.addEventListener('DOMContentLoaded', function() {
  //     let calendarEl: HTMLElement = document.getElementById('calendar')!;

  //   let calendar = new Calendar(calendarEl, {
  //     headerToolbar: {
  //       left: 'prev today next',
  //       center: 'title',
  //       right: 'dayGridMonth,timeGridWeek,timeGridDay'
  //     },
  //   });
    
  //     calendar.render();
  //   });
  // }
  ngAfterViewInit(): void {
    const calendarEl: HTMLElement = this.elementRef.nativeElement.querySelector('#calendar');

    const calendar = new Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev today next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
    });

    calendar.render();
  }

  toggleMilestoneView() {
    this.showAddMilestone = !this.showAddMilestone;
  }
}
