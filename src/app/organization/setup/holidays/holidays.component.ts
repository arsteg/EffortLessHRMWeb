import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrl: './holidays.component.css'
})
export class HolidaysComponent {
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

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService,
    private commonService: CommonService
  ) {
    this.holidayForm = this.fb.group({
      label: [''],
      date: [],
      isHolidayOccurEveryYearOnSameDay: [true],
      isMandatoryForFlexiHoliday: [true],
      holidaysAppliesFor: [''],
      year: [''],
      users: []
    });
    this.currentYear = new Date().getFullYear();
  }


  ngOnInit() {
    this.getHolidays();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
  }

  getYearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  }

  onYearChange(event: any) {
    this.selectedYear = event.target.value;
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
    if (this.holidayForm.get('holidaysAppliesFor').value == 'Specific-Employees') {
      const users = this.holidayForm.value.users.map(user => ({ user: user }));
      this.holidayForm.value.users = users;
    }
    else {
      this.holidayForm.value.users = [];
    }
    this.holidayForm.value.year = this.currentYear || this.selectedYear;
    console.log(this.holidayForm.value);
    if (!this.isEdit) {
      this.companyService.addHolidays(this.holidayForm.value).subscribe(res => {
        this.holidays.push(res.data);
        this.toast.success('Holiday added successfully', 'Success');
        this.holidayForm.reset();
      },
        err => { this.toast.error('Holiday Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateHolidays(this.selectedRecord._id, this.holidayForm.value).subscribe(res => {
        this.toast.success('Holiday updated successfully', 'Success');
        const index = this.holidays.findIndex(z => z._id === this.selectedRecord._id);
        if (index !== -1) {
          this.holidays[index] = { ...this.selectedRecord, ...this.holidayForm.value };
        }
        this.holidayForm.reset();
        this.isEdit = false;
      },
        err => { this.toast.error('Holiday Can not be Updated', 'Error') }
      );
    }
  }

  edit(data: any) {
    let users = [];
  
  if (data.holidaysAppliesFor === 'Specific-Employees') {
    users = data.users.map(user => ({ user: user }));
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
    this.holidayForm.reset();
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
