import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
import { forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/authentication.service';
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

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthenticationService,

  ) {
    this.appointmentForm = this.fb.group(
      {
        user: [''],
        salaryTypePaid: [''],
        joiningDate: [0],
        confirmationDate: [0]
      }
    )

    this.jobInformationForm = this.fb.group({
      user: ['', Validators.required],
      effectiveFrom: [, Validators.required],
      location: ['', Validators.required],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      reportingSupervisor: ['', Validators.required],
      department: ['', Validators.required],
      band: ['', Validators.required],
      subDepartments: ['', Validators.required],
      employmentStatusEffectiveFrom: [, Validators.required],
      zone: ['', Validators.required],
      noticePeriod: ['0', Validators.required]
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
    })
  }

  onAppointmentSubmission() {
    this.appointmentForm.value.user = this.selectedUser[0]._id
    this.userService.getAppointmentByUserId(this.selectedUser[0]._id).subscribe((res: any) => {
      if (!res.data) {
        this.userService.addAppointment(this.appointmentForm.value).subscribe((res: any) => {
          this.toast.success('Appointment Details Added', 'Successfully')
        })
      }
      else {
        this.userService.updateAppointment(res.data._id, this.appointmentForm.value).subscribe((res: any) => {
          this.toast.success('Appointment Details Updated', 'Successfully')
        })
      }
    })
  }

  onSubmissionJobInformation() {
    if (this.jobInformationForm.valid) {
      this.jobInformationForm.value.user = this.selectedUser[0]?._id;
      this.userService.getJobInformationByUserId(this.selectedUser[0]._id).subscribe((res: any) => {
        if (res.data.length <= 0) {
          this.jobInformationForm.value.user = this.selectedUser[0]._id;
          this.userService.addJobInformation(this.jobInformationForm.value).subscribe((res: any) => {
            this.toast.success('Job Information Added Successfully');
          }, err => { this.toast.error('Job Information Not Added', 'Error'); })
        } else {
          this.userService.updateJobInformation(res.data[0]._id, this.jobInformationForm.value).subscribe((res: any) => {
            this.userService.getJobInformationByUserId(this.selectedUser[0]._id).subscribe((res: any) => {
              this.jobInformationForm.patchValue(res.data[0]);
            })
          })
        }
      })
    } else {
      this.jobInformationForm.markAllAsTouched();
    }
  }

  logUrlSegmentsForUser() {
    const empCode = this.route.parent.snapshot.paramMap.get('empCode') || this.authService.currentUserValue?.empCode;
    if (empCode) {
      this.userService.getUserByEmpCode(empCode).subscribe((res: any) => {
        this.selectedUser = res.data;
        this.getData(); // Call getData after setting selectedUser
      })
    }
  }

  getData() {
    console.log(this.selectedUser)
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
      this.supervisors = results[2].data.data;
      this.bands = results[3].data;
      this.zones = results[4].data;
      this.subDepartments = results[5].data;
      this.departments = results[6].data;
      this.designations = results[7].data;
      this.locations = results[8].data;
    });
  }
}