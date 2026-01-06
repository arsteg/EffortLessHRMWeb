import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CompanyService } from 'src/app/_services/company.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { toUtcDateOnly, toUtcDateTime } from 'src/app/util/date-utils';

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
  currentYear: number = new Date().getFullYear();
  isSubmitting: boolean = false;
  selectedYear: number;
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';
  dialogRef: MatDialogRef<any> | null = null;
  allData: any[] = [];
  offices: any[] = [];
  columns: TableColumn[] = [
    {
      key: 'label',
      name: this.translate.instant('organization.holiday.table.holiday')
    },
    {
      key: 'date',
      name: this.translate.instant('organization.holiday.table.date'),
      valueFn: (row: any) => { return row.date ? this.datePipe.transform(row.date, 'mediumDate') : '' }
    },
    {
      key: 'isMandatoryForFlexiHoliday',
      name: this.translate.instant('organization.holiday.table.type'),
      valueFn: (row: any) => { return row.isMandatoryForFlexiHoliday ? 'Mandatory' : 'Flexi' }
    },
    {
      key: 'isHolidayOccurEveryYearOnSameDay',
      name: this.translate.instant('organization.holiday.table.reoccur'),
      valueFn: (row: any) => { return row.isHolidayOccurEveryYearOnSameDay ? 'Yes' : 'No' }
    },
    {
      key: 'locationAppliesTo',
      name: 'Locations',
      valueFn: (row: any) => { return row.locationAppliesTo === 'Selected-Locations' ? 'Selected Locations' : 'All Locations' }
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        {
          label: 'Edit',
          icon: 'edit',
          visibility: ActionVisibility.LABEL
        },
        {
          label: 'Delete',
          icon: 'delete',
          visibility: ActionVisibility.LABEL,
        }
      ]
    }
  ]

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private translate: TranslateService,
    private commonService: CommonService,
    private datePipe: DatePipe
  ) {
    this.holidayForm = this.fb.group({
      label: ['', Validators.required],
      date: ['', Validators.required],
      isHolidayOccurEveryYearOnSameDay: [true, Validators.required],
      isMandatoryForFlexiHoliday: [{ value: true, disabled: true }, Validators.required], // ✅ disabled
      holidaysAppliesFor: [{ value: 'All-Employees', disabled: true }, Validators.required], // ✅ disabled
      locationAppliesTo: ['All-Locations', Validators.required],
      offices: [[]],
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
    this.companyService.getLocations().subscribe((res: any) => {
      this.offices = res.data.offices;
    });
    this.holidayForm.reset(this.getDefaultFormValues());
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.isSubmitting = false;
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
      locationAppliesTo: 'All-Locations',
      offices: [],
      year: '',
      users: []
    };
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  onYearChange(event: any) {
    this.currentYear = event.value;
    this.getHolidays();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getHolidays();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getHolidays();
  }


  getHolidays() {
    console.log(this.currentYear);
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: '',
      year: this.currentYear
    };
    this.companyService.getHolidays(pagination).subscribe(res => {
      this.holidays = res.data;
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  onSubmission() {
    this.isSubmitting = true;

    this.holidayForm.markAllAsTouched();

    if (this.holidayForm.invalid) {
      this.isSubmitting = false;
      return;
    }
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

    if (formData.locationAppliesTo === 'Selected-Locations' && (!formData.offices || formData.offices.length === 0)) {
      this.holidayForm.get('offices').setErrors({ required: true });
      this.isSubmitting = false;
      return;
    }

    formData.year = this.currentYear || this.selectedYear;
    if (this.holidayForm.valid) {
      if (!this.isEdit) {
        formData.date = toUtcDateOnly(formData.date);
        this.companyService.addHolidays(formData).subscribe(res => {
          this.getHolidays();
          this.toast.success(this.translate.instant('organization.setup.holiday_added'))
          this.holidayForm.reset(this.getDefaultFormValues());
          this.dialogRef.close(true);
        },
          err => {
            const errorMessage = err?.error?.message || err?.message || err
              || this.translate.instant('organization.setup.holiday_add_fail')
              ;
            this.toast.error(errorMessage, 'Error!');
            this.isSubmitting = false;
          }
        );
      }
      else if (this.isEdit) {
        formData.date = toUtcDateOnly(formData.date);
        this.companyService.updateHolidays(this.selectedRecord._id, formData).subscribe(res => {
          this.toast.success(this.translate.instant('organization.setup.holiday_updated'));

          this.getHolidays();
          this.holidayForm.reset(this.getDefaultFormValues());
          this.isEdit = false;
          this.dialogRef.close(true);
        },
          err => {
            const errorMessage = err?.error?.message || err?.message || err
              || this.translate.instant('organization.setup.holiday_update_fail')
              ;
            this.toast.error(errorMessage, 'Error!');
            this.isSubmitting = false;
          }
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
      locationAppliesTo: data.locationAppliesTo || (data.holidayapplicableOffice?.length > 0 ? 'Selected-Locations' : 'All-Locations'),
      offices: (data.holidayapplicableOffice || []).map((o: any) => {
        const id = o.office?._id || o.office || o;
        return typeof id === 'object' && id !== null ? id.toString() : id;
      }),
      year: data.year,
      users: users
    });
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.isSubmitting = false;
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
    this.dialogRef = this.dialog.open(content, {
      disableClose: true,
      width: '50%'
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = null;
    });
  }

  deleteHoliday(id: string) {
    this.companyService.deleteHolidays(id).subscribe((res: any) => {
      this.getHolidays();
      this.toast.success(this.translate.instant('organization.setup.holiday_deleted'));
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err
          || this.translate.instant('organization.setup.holiday_delete_fail')
          ;
        this.toast.error(errorMessage, 'Error!');
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
        const errorMessage = err?.error?.message || err?.message || err
          || this.translate.instant('organization.setup.holiday_delete_fail')
          ;
        this.toast.error(errorMessage, 'Error!');
      }
    });
  }

  onClose() {
    this.isEdit = false;
    this.holidayForm.reset(this.getDefaultFormValues());
    this.dialogRef.close(true);
  }

  onSortChange(event: any) {
    const sorted = this.allData.slice().sort((a: any, b: any) => {
      var valueA = this.getNestedValue(a, event.active);
      var valueB = this.getNestedValue(b, event.active);

      if (valueA < valueB) return event.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.holidays = sorted;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
  }

  onSearchChange(search: any) {
    const data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
    this.holidays = data;
  }
}