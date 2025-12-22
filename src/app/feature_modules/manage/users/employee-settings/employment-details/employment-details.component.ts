import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { TranslateService } from '@ngx-translate/core';
import { toUtcDateOnly } from 'src/app/util/date-utils';

@Component({
  selector: 'app-employment-details',
  templateUrl: './employment-details.component.html',
  styleUrls: ['./employment-details.component.css']
})
export class EmploymentDetailsComponent {
  step = 0;
  selectedUser: any;
  disableSelect = new FormControl(false);
  jobInformationForm: FormGroup;
  appointmentForm: FormGroup;
  supervisors: any;
  bands: any = [];
  zones: any = [];
  subDepartments: any = [];
  departments: any = [];
  employmentStatus: any;
  designations: any = [];
  locations: any = [];
  appointment: any;
  isNew: boolean = true;
  jobInformationId: any;

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    public authService: AuthenticationService
  ) {
   

    this.appointmentForm = this.fb.group({
      user: [''],
      salaryTypePaid: ['',Validators.required],
      joiningDate: [0,Validators.required],
      confirmationDate: [0]
    }, { validators: CustomValidators.ConfirmationAfterJoiningValidator() });     

    this.jobInformationForm = this.fb.group({
      user: [''],
      effectiveFrom: ['', Validators.required],
      location: [''],
      designation: [''],
      employmentType: [''],
      reportingSupervisor: [''],
      department: [''],
      band: [''],
      subDepartments: [''],
      employmentStatusEffectiveFrom: [''],
      zone: [''],
      noticePeriod: ['0', [Validators.required, CustomValidators.digitsOnly]]
    });
    this.jobInformationForm.patchValue({ noticePeriod: '0' });
  }

  ngOnInit() {
    this.logUrlSegmentsForUser();
  }

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  getAllUsers() {
    this.userService.getUserList().subscribe((res: any) => {
      this.supervisors = res.data;
    });
  }

  onAppointmentSubmission() {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error'));
    
      return;
    }

    this.appointmentForm.value.user = this.selectedUser[0]._id;
    const payload = { ...this.appointmentForm.value };
    if (payload.joiningDate) {
      payload.joiningDate = toUtcDateOnly(payload.joiningDate);
    }
    if (payload.confirmationDate) {
      payload.confirmationDate = toUtcDateOnly(payload.confirmationDate);
    }
    this.userService.getAppointmentByUserId(this.selectedUser[0]._id).subscribe((res: any) => {
      if (!res.data) {
        this.userService.addAppointment(payload).subscribe((res: any) => {
         
          this.toast.success(this.translate.instant('manage.users.employee-settings.appointment_Added'), this.translate.instant('common.success'));
    
        });
      } else {
        this.userService.updateAppointment(res.data._id, payload).subscribe((res: any) => {
          this.toast.success(this.translate.instant('manage.users.employee-settings.appointment_updated'), this.translate.instant('common.success'))
        });
      }
    });
  }

  onSubmissionJobInformation() {
    if (this.jobInformationForm.invalid) {
      this.jobInformationForm.markAllAsTouched();
      this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error'));
      return;
    }

    this.jobInformationForm.enable();
    const formData = { ...this.jobInformationForm.value, user: this.selectedUser[0]?._id };

    // Convert empty strings to null for ObjectId fields to avoid CastError
    const objectIdFields = ['location', 'designation', 'reportingSupervisor', 'department', 'band', 'subDepartments', 'zone'];
    objectIdFields.forEach(field => {
      if (formData[field] === '' || formData[field] === null || formData[field] === undefined) {
        formData[field] = null;
      }
    });

    // Convert job information date fields to UTC date-only strings if present
    if (formData.effectiveFrom) {
      formData.effectiveFrom = toUtcDateOnly(formData.effectiveFrom);
    }
    if (formData.employmentStatusEffectiveFrom) {
      formData.employmentStatusEffectiveFrom = toUtcDateOnly(formData.employmentStatusEffectiveFrom);
    }

    if (this.isNew === true) {
      this.userService.addJobInformation(formData).subscribe({
        next: (res: any) => {
          this.toast.success(this.translate.instant('manage.users.employee-settings.job_information_Added'), this.translate.instant('common.success'));
    
        },
        error: (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_job_information_add')
          ;
         
          this.toast.error(errorMessage, 'Error!');
        }
      });
    } else {
      this.userService.updateJobInformation(this.jobInformationId, formData).subscribe({
        next: (res: any) => {
          this.toast.success(this.translate.instant('manage.users.employee-settings.job_information_Updated'), this.translate.instant('common.success'));
    
        },
        error: (err) => {
          const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('manage.users.employee-settings.failed_job_information_update')
          ;
         
          this.toast.error(errorMessage, 'Error!');
        }
      });
    }

    this.userService.getJobInformationByUserId(this.selectedUser[0]._id).subscribe((res: any) => {
      this.jobInformationForm.patchValue(res.data[0]);
      this.jobInformationId = res.data[0]._id;
      this.isNew = false;
    });
  }

  logUrlSegmentsForUser() {
    const empCode = this.route.parent.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
        this.selectedUser = res.data;
        this.getData();
      });
    }
  }

  getData() {
    forkJoin([
      this.userService.getAppointmentByUserId(this.selectedUser[0]._id),
      this.userService.getJobInformationByUserId(this.selectedUser[0]._id),
      this.userService.getUserList(),
      this.companyService.getBand(),
      this.companyService.getZones(),
      this.companyService.getSubDepartments(),
      this.companyService.getDepartments(),
      this.companyService.getDesignations(),
      this.companyService.getLocations()
    ]).subscribe((results: any[]) => {
      this.appointment = results[0].data;
      this.appointmentForm.patchValue(results[0].data);
      this.jobInformationForm.patchValue(results[1].data[0]);
      if (results[1].data[0]) {
        this.isNew = false;
        this.jobInformationId = results[1].data[0]._id;
      }
      this.supervisors = results[2].data.data;
      this.bands = results[3].data;
      this.zones = results[4].data.filter(zone => zone.status === 'Active');
      this.subDepartments = results[5].data;
      this.departments = results[6].data;
      this.designations = results[7].data;
      this.locations = results[8].data;
    });
  }
}