import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
// import dayGridPlugin from '@fullcalendar/daygrid';

import { CalendarService } from 'src/app/_services/calendar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './admin-calendar.component.html',
  styleUrls: ['./admin-calendar.component.css']
})
export class AdminCalendarComponent {
  // calendarPlugins = [dayGridPlugin];
  searchText: string = '';
  showAddMilestone: boolean = false;
  events: any[] = [];
  calendarEventForm: FormGroup
  selectedEvent: any;
  isEdit: boolean = false;
  milestoneData;
  // calendar: Calendar;
tab: boolean = false;
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
    start: '2023-10-15',
    end: '2023-10-16'
  }
]
  constructor(private elementRef: ElementRef,
    private renderer: Renderer2,
    private calendarService: CalendarService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private tost: ToastrService) {

    this.calendarEventForm = this.fb.group({
      mileStone: ['', Validators.required],
      startDate: ['', Validators.required],
      color: ['', Validators.required]
    });

  }
  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
   
    setTimeout(() => {

      const calendarEl: HTMLElement = this.elementRef.nativeElement.querySelector('#calendar');

      // this.calendar = new Calendar(calendarEl, {
      //   headerToolbar: {
      //     left: 'prev today next',
      //     center: 'title',
      //     right: 'dayGridMonth,timeGridWeek,timeGridDay'
      //   },
      //   events: this.calendarEvents,
      //   eventClick: (info) => this.toggleMilestoneView(info.event)
      //   });
      // this.calendar.render();
    }, 0);
  }

  toggleMilestoneView(event) {

    this.showAddMilestone = !this.showAddMilestone;
  }
  editEvent(event) {
    this.isEdit = true;
    this.selectedEvent = event;
    this.calendarEventForm.patchValue(event);
    this.showAddMilestone = true;
  }



  addMilestone() {
    this.milestoneData = this.calendarEventForm.value;
  
    const newMilestoneEvent = {
      title: this.milestoneData.mileStone,
      start: this.milestoneData.startDate,
      allDay: true,
      backgroundColor: this.milestoneData.color,
      color: this.milestoneData.color
    };
  
    this.events.push(newMilestoneEvent);
  
    // Update the calendar with the new event
    // this.calendar.addEvent(newMilestoneEvent);
  
    // // Refetch events to update the calendar
    // this.calendar.refetchEvents();
    // this.calendar.render();
  
    this.calendarEventForm.reset();
    this.showAddMilestone = false;
  }
  
}

// getAllEvents() {
  //   this.calendarService.getAllCalendarEvents().subscribe((res: any) => {
  //     this.events = res.data;
  //   })
  // }

  // addEvent(eventForm) {
  //   this.calendarService.addEvent(eventForm).subscribe((res: any) => {
  //     this.events = res.data;
  //     this.tost.success('Event Added Successfully!')
  //     this.getAllEvents();
  //   })
  //   err => {
  //     this.tost.error('Event Can not be Added', 'Error!')
  //   }
  // }

  // updateEvent(eventForm){
  //   this.calendarService.updateEvent(this.selectedEvent._id, eventForm).subscribe((res: any) => {
  //     this.events = res.data
  //     this.isEdit = false; 
  //     this.tost.success('Event Updated Successfully!')
  //     this.calendarEventForm.reset();
  //     this.getAllEvents();
  //   })
  //   err => {
  //     this.tost.error('Event Can not be Updated', 'Error!')
  //   }
  // }

  // deleteEvent(id: string){
  //   this.calendarService.deleteEvent(id).subscribe((res: any)=>{
  //     this.tost.success('Event Deleted Successfully!')
  //     this.getAllEvents();
  //   });
  // }
  // openDialog(id): void {
  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: '400px'
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result === 'delete') {
  //       this.deleteEvent(id);
  //     }
  //     err => {
  //       this.tost.error('EVent Can not be Deleted', 'Error!')
  //     }
  //   });
  // }
