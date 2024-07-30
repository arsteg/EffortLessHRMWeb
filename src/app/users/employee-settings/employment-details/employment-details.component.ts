import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
@Component({
  selector: 'app-employment-details',
  templateUrl: './employment-details.component.html',
  styleUrl: './employment-details.component.css'
})
export class EmploymentDetailsComponent {
  step = 0;
  @Input() selectedUser: any;
  disableSelect = new FormControl(false);
  jobInformationForm: FormGroup;
  supervisors: any;
  bands: any;
  zones: any;
  subDepartments: any;
  departments: any;
  employmentStatus: any;
  designations: any;
  locations: any;


  constructor(private userService: UserService,
    private companyService: CompanyService,
    private fb: FormBuilder) {
    this.jobInformationForm = this.fb.group({
      user: [''],
      effectiveFrom: [],
      location: [''],
      designation: [''],
      employmentType: [''],
      reportingSupervisor: [''],
      department: [''],
      band: [''],
      subDepartments: [''],
      employmentStatusEffectiveFrom: [],
      zone: [''],
      noticePeriod: ['']
    })

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
    this.jobInformationForm.value.user = this.selectedUser.id;
    this.jobInformationForm.value.organization = this.selectedUser.company.id;
    console.log(this.selectedUser.id)
    this.userService.addAppointmentDetails(this.jobInformationForm.value).subscribe((res: any) => {
      console.log(res.data);
    })
  }
  getData() {
    this.userService.getUserList().subscribe((res: any) => {
      this.supervisors = res.data;
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
    this.companyService.getLocations().subscribe((res: any)=>{
      this.locations = res.data;
    })
  }
}
