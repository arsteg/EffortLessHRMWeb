import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ExportService } from 'src/app/_services/export.service';
import { CommonService } from 'src/app/common/common.service';
import { EmployeeAttendanceHistoryComponent } from './employee-attendance-history/employee-attendance-history.component';
import { UploadRecordsComponent } from './upload-records/upload-records.component';

@Component({
  selector: 'app-attendance-records',
  templateUrl: './attendance-records.component.html',
  styleUrl: './attendance-records.component.css'
})
export class AttendanceRecordsComponent {
  isEdit: boolean;
  searchText: string = '';
  closeResult: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  fromDate: string;
  toDate: string;
  fromDateControl: FormControl;
  toDateControl: FormControl;
  weekDates: { day: string, date: string }[] = [];

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private commonService: CommonService) {
    this.fromDateControl = new FormControl('', Validators.required);
    this.toDateControl = new FormControl('', Validators.required);
  }

  ngOnInit() {
    this.setCurrentWeek();
  }

  setCurrentWeek(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    const saturday = new Date(today);

    sunday.setDate(today.getDate() - dayOfWeek);
    saturday.setDate(today.getDate() + (6 - dayOfWeek));

    this.fromDate = this.formatDate(sunday);
    this.toDate = this.formatDate(saturday);

    this.fromDateControl.setValue(this.fromDate);
    this.toDateControl.setValue(this.toDate);

    this.calculateWeekDates(sunday);
  }

  navigateWeek(direction: number): void {
    const currentFromDate = new Date(this.fromDate);
    const newFromDate = new Date(currentFromDate);
    newFromDate.setDate(currentFromDate.getDate() + (direction * 7));
    const newToDate = new Date(newFromDate);
    newToDate.setDate(newFromDate.getDate() + 6);

    this.fromDate = this.formatDate(newFromDate);
    this.toDate = this.formatDate(newToDate);

    this.fromDateControl.setValue(this.fromDate);
    this.toDateControl.setValue(this.toDate);

    this.calculateWeekDates(newFromDate);
  }

  calculateWeekDates(startDate: Date): void {
    this.weekDates = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      this.weekDates.push({
        day: daysOfWeek[i],
        date: this.formatDate(currentDate)
      });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  closeModal() {
    this.modalService.dismissAll();
  }



  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }


  exportToCsv() {
    // const dataToExport = this.shiftAssigments.map((data) => ({
    //   user: this.getUser(data.user),
    //   template: this.getShiftTemplateName(data.template),
    //   startDate: data.startDate
    // }));
    // this.exportService.exportToCSV('Shift-Assignment', 'Shift-Assignment', dataToExport);
  }

  viewHistory() {
    const dialogRef = this.dialog.open(EmployeeAttendanceHistoryComponent, {
      width: '100%',
      height: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  uploadAttendanceRecord() {
    const dialogRef = this.dialog.open(UploadRecordsComponent, {
      width: '80%',
      height: '80%'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
}
