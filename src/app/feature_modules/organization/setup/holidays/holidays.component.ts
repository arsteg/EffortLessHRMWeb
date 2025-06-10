import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CompanyService } from 'src/app/_services/company.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.css'
})
export class HolidaysComponent {
  @ViewChild('addModal') addModal: ElementRef;
  holidays: any;
  holidayForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  members: any[] = [];
  currentYear: number;
  selectedYear: number;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';
  columns: TableColumn[] = [
    { key: 'label', name: 'Holiday' },
    { key: 'date', name: 'Date', valueFn: (row: any) => { return row.date ? this.datePipe.transform(row.date, 'mediumDate') : '' } },
    { key: 'isMandatoryForFlexiHoliday',
       name: 'Type',
      valueFn: (row: any) => { return row.isMandatoryForFlexiHoliday ? 'Mandatory' : 'Flexi' }
     },
    { key: 'isHolidayOccurEveryYearOnSameDay', name: 'Re-occure Every Year', valueFn: (row: any) => { return row.isHolidayOccurEveryYearOnSameDay ? 'Yes' : 'No' } },
    { key: 'holidaysAppliesFor', name: 'Applies To' },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Edit',
          icon: 'edit',
          visibility: ActionVisibility.BOTH
        },
        {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.BOTH,
          cssClass: 'text-danger'
        }
      ]
    }
  ]

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private commonService: CommonService,
    private datePipe: DatePipe
  ) {
    this.holidayForm = this.fb.group({
      label: ['', Validators.required],
      date: ['', Validators.required],
      isHolidayOccurEveryYearOnSameDay: [true, Validators.required],
      isMandatoryForFlexiHoliday: [{ value: true, disabled: true }, Validators.required], // ✅ disabled
      holidaysAppliesFor: [{ value: 'All-Employees', disabled: true }, Validators.required], // ✅ disabled
      year: [''],
      users: [[]]
    });
    this.currentYear = new Date().getFullYear();
  }


  ngOnInit() {
    this.getHolidays();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    this.holidayForm.reset(this.getDefaultFormValues());
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedRecord = event.row;
        this.isEdit = true;
        this.edit(event.row);
        this.open(this.addModal);
        break;

      case 'Delete':
        this.deleteDialog(event.row?._id)
        break;
    }
  }


  private getDefaultFormValues() {
    return {
      label: '',
      date: '',
      isHolidayOccurEveryYearOnSameDay: true,
      isMandatoryForFlexiHoliday: true,
      holidaysAppliesFor: 'All-Employees',
      year: '',
      users: []
    };
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  onYearChange(event: any) {
    this.selectedYear = event.value;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getHolidays();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getHolidays();
  }


  getHolidays() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: '',
      year: this.currentYear
    };
    this.companyService.getHolidays(pagination).subscribe(res => {
      this.holidays = res.data;
      this.totalRecords = res.total;
    });
  }

  onSubmission() {
    const formData = this.holidayForm.getRawValue();
    if (formData.holidaysAppliesFor === 'specific-employees' &&
      (!formData.users || formData.users.length === 0)) {
      this.holidayForm.get('users').setErrors({ required: true });  // Set 'required' error manually
      return;
    }

    if (formData.holidaysAppliesFor !== 'all-employees') {
      const formattedUsers = (formData?.users || []).map(user => ({ user }));

      this.holidayForm.patchValue({ users: formattedUsers });
    }

    formData.year = this.currentYear || this.selectedYear;
    if (this.holidayForm.valid) {
      if (!this.isEdit) {
        this.companyService.addHolidays(formData).subscribe(res => {
          this.holidays.push(res.data);
          this.toast.success('Holiday added successfully', 'Success');
          this.holidayForm.reset(this.getDefaultFormValues());
        },
          err => { this.toast.error('Holiday Can not be Added', 'Error') }
        );
      }
      else if (this.isEdit) {
        this.companyService.updateHolidays(this.selectedRecord._id, formData).subscribe(res => {
          this.toast.success('Holiday updated successfully', 'Success');
          const index = this.holidays.findIndex((z) => z._id === this.selectedRecord._id);
          if (index !== -1) {
            this.holidays[index] = { ...res.data };
          }
          this.holidayForm.reset(this.getDefaultFormValues());
          this.isEdit = false;
        },
          err => { this.toast.error('Holiday Can not be Updated', 'Error') }
        );
      }
    }
    else {
      this.holidayForm.markAllAsTouched();
    }
  }

  edit(data: any) {
    let users = [];
    if (data.holidaysAppliesFor === 'Specific-Employees') {
      users = data.holidayapplicableEmployee.map(user => user.user);
    }

    this.holidayForm.patchValue({
      label: data.label,
      date: data.date,
      isHolidayOccurEveryYearOnSameDay: data.isHolidayOccurEveryYearOnSameDay,
      isMandatoryForFlexiHoliday: data.isMandatoryForFlexiHoliday,
      holidaysAppliesFor: data.holidaysAppliesFor,
      year: data.year,
      users: users
    });
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.holidayForm.reset(this.getDefaultFormValues());
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteHoliday(id: string) {
    this.companyService.deleteHolidays(id).subscribe((res: any) => {
      this.getHolidays();
      this.toast.success('Successfully Deleted!!!', 'Holiday')
    },
      (err) => {
        this.toast.error('This Holiday Can not be deleted!', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteHoliday(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}