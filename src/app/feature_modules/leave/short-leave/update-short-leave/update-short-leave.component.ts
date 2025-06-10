import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { LeaveService } from 'src/app/_services/leave.service';

@Component({
  selector: 'app-update-short-leave',
  templateUrl: './update-short-leave.component.html',
  styleUrls: ['./update-short-leave.component.css'] // Updated to styleUrls as per Angular convention
})
export class UpdateShortLeaveComponent {
  @Output() shortLeaveRefreshed: EventEmitter<void> = new EventEmitter<void>();
  updateLeaveReport: FormGroup;
  leaveUpdateStatus: any;

  @Input() selectedShortLeave: any;
  @Input() selectedStatus: string;
  @Input() modalInstance!: NgbModalRef;

  constructor(
    public leaveService: LeaveService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.updateLeaveReport = this.fb.group({
      employee: [''],
      date: [],
      startTime: [],
      endTime: [],
      durationInMinutes: [],
      comments: [''],
      status: [this.selectedStatus || 'Pending'],
      level1Reason: ['', Validators.required], // Added required validator for reason
      level2Reason: ['']
    });
  }

  ngOnInit() {
    // Populate form with selectedShortLeave data
    if (this.selectedShortLeave) {
      this.updateLeaveReport.patchValue({
        employee: this.selectedShortLeave.employee,
        date: this.selectedShortLeave.date || this.selectedShortLeave.Date, // Handle potential case mismatch
        startTime: this.selectedShortLeave.start,
        endTime: this.selectedShortLeave.end,
        durationInMinutes: this.selectedShortLeave.durationInMinutes,
        comments: this.selectedShortLeave.comments,
        status: this.selectedStatus || this.selectedShortLeave.status || 'Pending',
        level1Reason: this.selectedShortLeave.level1Reason,
        level2Reason: this.selectedShortLeave.level2Reason
      });
    }
  }

  updateApprovedReport() {
    if (this.updateLeaveReport.invalid) {
      this.updateLeaveReport.markAllAsTouched();
      this.toast.error(this.translate.instant('leave.formInvalidError'));
      return;
    }

    const payload = {
      employee: this.updateLeaveReport.value.employee,
      date: this.updateLeaveReport.value.date,
      startTime: this.updateLeaveReport.value.startTime,
      endTime: this.updateLeaveReport.value.endTime,
      durationInMinutes: this.updateLeaveReport.value.durationInMinutes,
      comments: this.updateLeaveReport.value.comments,
      status: this.selectedStatus,
      level1Reason: this.updateLeaveReport.value.level1Reason,
      level2Reason: this.updateLeaveReport.value.level2Reason
    };

    this.leaveService.updateShortLeave(this.selectedShortLeave?._id, payload).subscribe({
      next: (res: any) => {
        this.toast.success(this.translate.instant('leave.successUpdateShortLeave')); // New translation key
        this.shortLeaveRefreshed.emit();
        this.modalInstance.close();
      },
      error: () => {
        this.toast.error(this.translate.instant('leave.errorUpdatingShortLeave')); // Existing translation key
      }
    });
  }

  closeModal() {
    this.modalInstance.close();
    this.toast.info(this.translate.instant('leave.modalClosed')); // Existing translation key
  }
}