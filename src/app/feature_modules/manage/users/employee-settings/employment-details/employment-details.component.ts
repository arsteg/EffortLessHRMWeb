import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
@Component({
  selector: 'app-employment-details',
  templateUrl: './employment-details.component.html',
  styleUrl: './employment-details.component.css'
})
export class EmploymentDetailsComponent {
  step = 0;
  selectedUser = this.userService.getData();
  disableSelect = new FormControl(false);
  jobInformationForm: FormGroup;
  supervisors: any;
  bands: any = [];
  zones: any = [];
  subDepartments: any = [];
  departments: any = [];
  employmentStatus: any;
  designations: any = [];
  locations: any = [];

  constructor(
    private userService: UserService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.jobInformationForm = this.fb.group({
      user: [''],
      effectiveFrom: [ , Validators.required],
      location: [''],
      designation: [''],
      employmentType: [''],
      reportingSupervisor: [''],
      department: [''],
      band: [''],
      subDepartments: [''],
      employmentStatusEffectiveFrom: [],
      zone: [''],
      noticePeriod: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getData();
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

  onSubmissionJobInformation() {
    this.userService.getJobInformationByUserId(this.selectedUser.id).subscribe((res: any) => {
      if (res.data.length < 0) {
        this.jobInformationForm.value.user = this.selectedUser.id;
        this.userService.addJobInformation(this.jobInformationForm.value).subscribe((res: any) => {
          this.toast.success('Job Information Added Successfully');
        }, err => { this.toast.error('Job Information Not Added', 'Error'); })
      } else {
        this.userService.updateJobInformation(res.data[0]._id, this.jobInformationForm.value).subscribe((res: any) => {
          this.userService.getJobInformationByUserId(this.selectedUser.id).subscribe((res: any) => {
            this.jobInformationForm.patchValue(res.data[0]);
          })
        })
      }
    })
  }

  getData() {
    this.userService.getJobInformationByUserId(this.selectedUser.id).subscribe((res: any) => {
      this.jobInformationForm.patchValue(res.data[0]);
    })
    this.userService.getUserList().subscribe((res: any) => {
      this.supervisors = res.data.data;
    })
    this.companyService.getBand().subscribe((res: any) => {
      this.bands = res.data;
    })
    this.companyService.getZones().subscribe((res: any) => {
      this.zones = res.data;
    })
    this.companyService.getSubDepartments().subscribe((res: any) => {
      this.subDepartments = res.data;
    })
    this.companyService.getDepartments().subscribe((res: any) => {
      this.departments = res.data;
    })
    this.companyService.getDesignations().subscribe((res: any) => {
      this.designations = res.data;
    })
    this.companyService.getLocations().subscribe((res: any) => {
      this.locations = res.data;
    })
  }
}