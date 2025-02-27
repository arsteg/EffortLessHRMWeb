import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {
  selectedTab: number = 1;
  generalSettings: any;
  closeResult: string = '';
  isEdit = false;
  regularization: any;
  members: any = [];
  activeTab: string = 'tabRoundingRules';
  generalSettingForm: FormGroup;
  selectedRecord: any;
  day: number[] = [];
  approvers: any;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  fixedAllowance: any[];
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  roundingRules: any;
  pfTemplates: any;
  gratuityTemplate: any;
  public sortOrder: string = '';

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private payroll: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService,
    private authService: AuthenticationService
  ) {
    this.generalSettingForm = this.fb.group({
      dayOfMonthToRunPayroll: [0],
      payrollApprovar: [''],
      dayOfMonthToStartAttendanceCycle: [0],
      password: [''],
      isPasswordForSalaryRegister: [true],
      isGraduityEligible: [true],
      percentageForGraduity: [''],
      attendanceCycle: [''],
      graduityComponentsGraduitycalculation: [''],
      leaveEncashment: [
        []
      ],
      denominatorForCalculatingTheEncashment: [''],
      payoutRolloverLeaveEncashmentForEmployees: [
        []
      ],
      calculateLeaveRecovery: [
        []
      ],
      denominatorForCalculatingTheLeaveRecovery: [
        []
      ],
      recoverOutstandingIncomeTaxOfEmployees: [
        []
      ],
      isNoticePeriodRecoveryApplicable: [true],
      denominatorForCalculatingTheNoticeRecovery: [''],
      isAllowTDSFromEffortlessHRM: [true],
      isAllowNcpDaysApplicableInPF: [true],
      isAllowToCalculateOvertime: [true]
    });
    this.generalSettingForm.disable();


  }

  ngOnInit() {
    this.getData();
    this.loadRecords();
  }

  getData() {
    // Display Day
    for (let i = 1; i <= 28; i++) {
      this.day.push(i);
    }
    // get Managers
    this.authService.getUserManagers(this.currentUser.id).subscribe((res: any) => {
      this.approvers = res.data;
    });
    // get fixed allowances
    let payload = {
      skip: '',
      next: ''
    }
    this.payroll.getFixedAllowance(payload).subscribe((res: any) => {
      this.fixedAllowance = res.data;

      // get general settings by company
      this.payroll.getGeneralSettings(this.fixedAllowance[0].company).subscribe((res: any) => {
        this.generalSettings = res.data;
        this.generalSettingForm.patchValue({
          dayOfMonthToRunPayroll: this.generalSettings.dayOfMonthToRunPayroll,
          payrollApprovar: this.generalSettings.payrollApprovar,
          dayOfMonthToStartAttendanceCycle: this.generalSettings.dayOfMonthToStartAttendanceCycle,
          password: this.generalSettings.password,
          isPasswordForSalaryRegister: this.generalSettings.isPasswordForSalaryRegister,
          isGraduityEligible: this.generalSettings.isGraduityEligible,
          percentageForGraduity: this.generalSettings.percentageForGraduity,
          attendanceCycle: this.generalSettings.attendanceCycle,
          graduityComponentsGraduitycalculation: this.generalSettings.graduityComponentsGraduitycalculation,
          leaveEncashment: this.generalSettings.leaveEncashment,
          denominatorForCalculatingTheEncashment: this.generalSettings.denominatorForCalculatingTheEncashment,
          payoutRolloverLeaveEncashmentForEmployees: this.generalSettings.payoutRolloverLeaveEncashmentForEmployees,
          calculateLeaveRecovery: this.generalSettings.calculateLeaveRecovery,
          denominatorForCalculatingTheLeaveRecovery: this.generalSettings.denominatorForCalculatingTheLeaveRecovery,
          recoverOutstandingIncomeTaxOfEmployees: this.generalSettings.recoverOutstandingIncomeTaxOfEmployees,
          isNoticePeriodRecoveryApplicable: this.generalSettings.isNoticePeriodRecoveryApplicable,
          denominatorForCalculatingTheNoticeRecovery: this.generalSettings.denominatorForCalculatingTheNoticeRecovery,
          isAllowTDSFromEffortlessHRM: this.generalSettings.isAllowTDSFromEffortlessHRM,
          isAllowNcpDaysApplicableInPF: this.generalSettings.isAllowNcpDaysApplicableInPF,
          isAllowToCalculateOvertime: this.generalSettings.isAllowToCalculateOvertime
        })
      })
    });
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    console.log(this.activeTab);
    this.loadRecords();
  }

  onCancel() {
    this.payroll.getGeneralSettings(this.fixedAllowance[0].company).subscribe((res: any) => {
      this.generalSettings = res.data;
      this.generalSettingForm.patchValue({
        dayOfMonthToRunPayroll: this.generalSettings.dayOfMonthToRunPayroll,
        payrollApprovar: this.generalSettings.payrollApprovar,
        dayOfMonthToStartAttendanceCycle: this.generalSettings.dayOfMonthToStartAttendanceCycle,
        password: this.generalSettings.password,
        isPasswordForSalaryRegister: this.generalSettings.isPasswordForSalaryRegister,
        isGraduityEligible: this.generalSettings.isGraduityEligible,
        percentageForGraduity: this.generalSettings.percentageForGraduity,
        attendanceCycle: this.generalSettings.attendanceCycle,
        graduityComponentsGraduitycalculation: this.generalSettings.graduityComponentsGraduitycalculation,
        leaveEncashment: this.generalSettings.leaveEncashment,
        denominatorForCalculatingTheEncashment: this.generalSettings.denominatorForCalculatingTheEncashment,
        payoutRolloverLeaveEncashmentForEmployees: this.generalSettings.payoutRolloverLeaveEncashmentForEmployees,
        calculateLeaveRecovery: this.generalSettings.calculateLeaveRecovery,
        denominatorForCalculatingTheLeaveRecovery: this.generalSettings.denominatorForCalculatingTheLeaveRecovery,
        recoverOutstandingIncomeTaxOfEmployees: this.generalSettings.recoverOutstandingIncomeTaxOfEmployees,
        isNoticePeriodRecoveryApplicable: this.generalSettings.isNoticePeriodRecoveryApplicable,
        denominatorForCalculatingTheNoticeRecovery: this.generalSettings.denominatorForCalculatingTheNoticeRecovery,
        isAllowTDSFromEffortlessHRM: this.generalSettings.isAllowTDSFromEffortlessHRM,
        isAllowNcpDaysApplicableInPF: this.generalSettings.isAllowNcpDaysApplicableInPF,
        isAllowToCalculateOvertime: this.generalSettings.isAllowToCalculateOvertime
      })
    })
  }
  saveGeneralSettings() {
    this.payroll.getGeneralSettings(this.fixedAllowance[0]?.company).subscribe((res: any) => {
      const response = res.data;
      console.log(response)
      if (response.length === 0) {
        console.log(this.isEdit);
        this.payroll.addGeneralSettings(this.generalSettingForm.value).subscribe((res: any) => {
          this.generalSettings = res.data;
          this.toast.success('General Settings Added Successfully');
          this.resetSettings();
        });
      }
      else {
        const company = this.fixedAllowance[0].company;
        this.payroll.updateGeneralSettings(company, this.generalSettingForm.value).subscribe((res: any) => {
          this.generalSettings = res.data;
          this.toast.success('General Settings Updated Successfully');
          this.resetSettings();
        });
      }

    });
  }
  open(content: any) {
    this.payroll.generalSettings.next(this.generalSettings);
    this.payroll.fixedAllowance.next(this.fixedAllowance);
    console.log(this.fixedAllowance);
    console.log(this.isEdit)
    if (this.isEdit) {
      this.payroll.data.next(this.selectedRecord);
      console.log(this.selectedRecord)
      this.payroll.generalSettings.next(this.generalSettings);
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {
      const new_record = this.payroll.addResponse.getValue();
      console.log(new_record)
      this.roundingRules.push(new_record);
      console.log(this.roundingRules)
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

  clearForm() { }

  deleteRecord(_id: string) {
    console.log(this.activeTab)
    if (this.activeTab === 'tabRoundingRules') {
      this.payroll.deleteRoundingRules(_id).subscribe((res: any) => {
        const index = this.roundingRules.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.roundingRules.splice(index, 1);
        }
        this.toast.success('Successfully Deleted!!!', 'Rounding Rules');
      },
        (err) => {
          this.toast.error('This Can not be delete as it is already used in the system', 'Rounding Rules');
        })
    }
    else if (this.activeTab === 'tabPFTemplate') {
      this.payroll.deletePFTemplate(_id).subscribe((res: any) => {
        const index = this.fixedAllowance.findIndex(temp => temp._id === _id);
        if (index!== -1) {
          this.fixedAllowance.splice(index, 1);
        }
        this.toast.success('Successfully Deleted!!!', 'Fixed Allowance');
      },
        (err) => {
          this.toast.error('This Can not be delete as it is already used in the system', 'Fixed Allowance');
        })
    }
    
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
    if (this.isEdit) {
      this.generalSettingForm.enable();
    } else {
      this.onCancel();
      this.generalSettingForm.disable();
    }
  }
  resetSettings() {
    this.toggleEdit();
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
    if (this.activeTab == 'tabRoundingRules') {
      this.payroll.getRoundingRules(pagination).subscribe((res: any) => {
        this.roundingRules = res.data;
        this.totalRecords = res.total;
      });
    }
    else if (this.activeTab == 'tabPFTemplate') {
      console.log(this.activeTab)
      this.payroll.getPfTemplate(pagination).subscribe((res: any) => {
        this.pfTemplates = res.data;
        this.totalRecords = res.total;
      });
    }
   
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
      this.loadRecords();
    }
  }

}