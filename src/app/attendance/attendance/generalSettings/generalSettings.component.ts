import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/_services/common.Service';
import { TimeLogService } from 'src/app/_services/timeLogService';
import { DatePipe, NgIf } from '@angular/common';
import { ReportsService } from 'src/app/_services/reports.service';
import { ExportService } from 'src/app/_services/export.service';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PaginationService } from 'src/app/_services/pagination.service'

@Component({
  selector: 'app-generalSettings',
  templateUrl: './generalSettings.component.html',
  styleUrls: ['./generalSettings.component.css'],
})

export class GeneralSettingsComponent implements OnInit {
  selectedTab: number = 1;
  generalSettingForm: FormGroup;
  regularizationForm: FormGroup;
  generalSettings: any;
  closeResult: string = '';
  isEdit = false;
  regularization: any;
  members: any = [];
  activeTab: string = 'tabRegularizationReason';
  p: number = 1;
  selectedReason: any;
  dutyReason: any;
  dutyReasonForm: FormGroup;
  selectedDutyReason: any;
  totalRecords: number // example total records
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(
    public commonService: CommonService,
    public datepipe: DatePipe,
    private attendanceService: AttendanceService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private paginationService: PaginationService
  ) {
    this.generalSettingForm = this.fb.group({
      canSelectRegularizationReason: [false],
      canSelectOnDutyReason: [false],
      shiftAssignmentsBasedOnRoster: [false],
      IsRegularizationandLeaveBlockedForUser: [false]
    });
    this.regularizationForm = this.fb.group({
      label: [''],
      isFrequecyRestriction: [false],
      limit: [0],
      frequency: [''],
      applicableEmployee: [''],
      users: [[]]
    });
    this.dutyReasonForm = this.fb.group({
      label: [''],
      applicableEmployee: [''],
      users: [[]]
    })
  }

  ngOnInit(): void {
    this.getGeneralSettings();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
    this.loadRecords()
  }



  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRecords();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.loadRecords();
  }

  loadRecords() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    if (this.activeTab == 'tabRegularizationReason') {
      this.attendanceService.getRegularizationReason(pagination.skip, pagination.next).subscribe((res: any) => {
        this.regularization = res.data;
        this.totalRecords = res.total;
      });
    }
    else if(this.activeTab == 'tabOnDutyReason'){
      console.log('on dutyReason')
      this.attendanceService.getDutyReason(pagination).subscribe((res: any) => {
        this.dutyReason = res.data;
        this.totalRecords = res.total;
      });
    }
  }

  selectTab(tabId: string) {

    this.activeTab = tabId;
    console.log(this.activeTab);
    this.loadRecords();
  }

  savegeneralSettings() {
    this.attendanceService.getGeneralSettings().subscribe((res: any) => {
      this.generalSettings = res.data;
      if (this.generalSettings.length && this.generalSettings.length >= 1) {
        this.attendanceService.updateGeneralSettings(this.generalSettings[0]._id, this.generalSettingForm.value).subscribe((res: any) => {
          this.generalSettings = res.data;
          this.getGeneralSettings();
          this.toast.success('Successfully!!!', 'General Setting Updated');
        })
      }
      else {
        this.attendanceService.addGeneralSettings(this.generalSettingForm.value).subscribe((res: any) => {
          this.generalSettings = res.data;
          this.toast.success('Successfully!!!', 'General Setting Created');
          this.getGeneralSettings();

        });
      }
    });
  }

  getGeneralSettings() {
    this.attendanceService.getGeneralSettings().subscribe((res: any) => {
      this.generalSettings = res.data;
      this.generalSettingForm.patchValue({
        canSelectRegularizationReason: this.generalSettings[0].canSelectRegularizationReason,
        canSelectOnDutyReason: this.generalSettings[0].canSelectOnDutyReason,
        shiftAssignmentsBasedOnRoster: this.generalSettings[0].shiftAssignmentsBasedOnRoster,
        IsRegularizationandLeaveBlockedForUser: this.generalSettings[0].IsRegularizationandLeaveBlockedForUser
      });
    })
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  addRegularization() {
    const formattedUsers = this.regularizationForm.value.users.map((user: any) => ({ user: user }));
    this.regularizationForm.value.users = formattedUsers;
    this.attendanceService.addRegularizationReason(this.regularizationForm.value).subscribe((res: any) => {
      this.regularization = res.data;
      this.toast.success('Regularization Reason Added', 'Successfully!!!');

      // this.getRegularizationReason();
      this.regularizationForm.reset();
    })
  }

  editReason() {
    const formattedUsers = this.selectedReason.userRegularizationReasons.map((user: any) => (user.user));
    this.regularizationForm.patchValue({
      label: this.selectedReason.label,
      isFrequecyRestriction: this.selectedReason.isFrequecyRestriction,
      limit: this.selectedReason.limit,
      frequency: this.selectedReason.frequency,
      applicableEmployee: this.selectedReason.applicableEmployee,
      users: formattedUsers
    });
  }

  updateRegularization() {
    let id = this.selectedReason._id;
    const formattedUsers = this.regularizationForm.value.users.map((user: any) => ({ user: user }));
    this.regularizationForm.value.users = formattedUsers;
    this.attendanceService.updateRegularizationReason(id, this.regularizationForm.value).subscribe((res: any) => {
      const reason = res.data;
      const index = this.regularization.findIndex(reas => reas._id === reason._id);
      if (index !== -1) {
        this.regularization[index] = reason;
        this.toast.success('Regularization Reason Updated', 'Successfully!!!');
        this.regularizationForm.reset();
      }
    })
  }

  deleteReason(_id: string) {
    this.attendanceService.deleteReason(_id).subscribe((res: any) => {
      const index = this.regularization.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.regularization.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Regularization Reason')
    },
      (err) => {
        this.toast.error('This Reason is already being used!'
          , 'Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteReason(id);
      }
    });
  }


  deleteDutyReason(_id: string) {
    this.attendanceService.deleteDutyReason(_id).subscribe((res: any) => {
      const index = this.dutyReason.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.dutyReason.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'On Duty Reason')
    },
      (err) => {
        this.toast.error('This Duty Reason is already being used!'
          , 'Can not be deleted!')
      })
  }

  deleteDutyDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteDutyReason(id);
      }
    });
  }

  addDutyReason() {
    const formattedUsers = this.dutyReasonForm.value.users.map((user: any) => ({ user: user }));
    this.dutyReasonForm.value.users = formattedUsers;
    this.attendanceService.addDutyReason(this.dutyReasonForm.value).subscribe((res: any) => {
      this.dutyReason = res.data;
      // this.getDutyReason();
      this.dutyReasonForm.reset();
      this.toast.success('On Duty Reason Created', 'Successfully!!!');
    })
  }

  editDutyReason() {
    console.log(this.selectedDutyReason)
    const formattedUsers = this.selectedDutyReason.userOnDutyReason.map((user: any) => (user.user));
    this.dutyReasonForm.patchValue({
      label: this.selectedDutyReason.label,
      applicableEmployee: this.selectedDutyReason.applicableEmployee,
      users: formattedUsers
    });
  }
  updateDutyReason() {
    let id = this.selectedDutyReason._id;
    if (this.dutyReasonForm.value.applicableEmployee == 'all-employees') {
      this.dutyReasonForm.value.users = []
    }
    else {
      const formattedUsers = this.dutyReasonForm.value.users.map((user: any) => ({ user: user }));
      this.dutyReasonForm.value.users = formattedUsers;
    }
    this.attendanceService.updateDutyReason(id, this.dutyReasonForm.value).subscribe((res: any) => {
      const reason = res.data;
      const index = this.dutyReason.findIndex(reas => reas._id === reason._id);
      if (index !== -1) {
        this.dutyReason[index] = reason;
        this.toast.success('On Duty Reason Updated', 'Successfully!!!');
        this.dutyReasonForm.reset();
      }
    })
  }



  clearForm() {
    this.dutyReasonForm.reset();
    this.regularizationForm.reset();
  }

}
