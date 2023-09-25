import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { Calendar } from '@fullcalendar/core';
import { CalendarService } from 'src/app/_services/calendar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-calendar',
  templateUrl: './admin-calendar.component.html',
  styleUrls: ['./admin-calendar.component.css']
})
export class AdminCalendarComponent {
  calendarPlugins = [dayGridPlugin];
  searchText: string = '';
  showAddMilestone: boolean = false;
  events: any;
  calendarEventForm: FormGroup
  selectedEvent: any;
  isEdit: boolean = false;

  constructor(private elementRef: ElementRef,
    private renderer: Renderer2,
    private calendarService: CalendarService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private tost: ToastrService) {

    this.calendarEventForm = this.fb.group({
      title: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.getAllEvents();
  }
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
    this.isEdit= false
  }
  editEvent(event) {
    this.isEdit = true;
    this.selectedEvent = event;
    this.calendarEventForm.patchValue(event);
    this.showAddMilestone = true;
}

  getAllEvents() {
    this.calendarService.getAllCalendarEvents().subscribe((res: any) => {
      this.events = res.data;
    })
  }

  addEvent(eventForm) {
    this.calendarService.addEvent(eventForm).subscribe((res: any) => {
      this.events = res.data;
      this.tost.success('Event Added Successfully!')
      this.getAllEvents();
    })
    err => {
      this.tost.error('Event Can not be Added', 'Error!')
    }
  }

  updateEvent(eventForm){
    this.calendarService.updateEvent(this.selectedEvent._id, eventForm).subscribe((res: any) => {
      this.events = res.data
      this.isEdit = false; 
      this.tost.success('Event Updated Successfully!')
      this.calendarEventForm.reset();
      this.getAllEvents();
    })
    err => {
      this.tost.error('Event Can not be Updated', 'Error!')
    }
  }

  deleteEvent(id: string){
    this.calendarService.deleteEvent(id).subscribe((res: any)=>{
      this.tost.success('Event Deleted Successfully!')
      this.getAllEvents();
    });
  }
  openDialog(id): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteEvent(id);
      }
      err => {
        this.tost.error('EVent Can not be Deleted', 'Error!')
      }
    });
  }
}
