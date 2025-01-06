import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrl: './employee-settings.component.css'
})
export class EmployeeSettingsComponent {
  @Output() backToUserView = new EventEmitter<void>();
  @Input() selectedUser: any;
  data: any;
  isEdit: boolean;
  selectedIndex: number = 0;
  employeeForm: FormGroup;

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.employeeForm = this.fb.group({
      employeeId: ['', Validators.required],
      salaryPaymentMethod: ['', Validators.required],
      joiningDate: ['', Validators.required],
      confirmationDate: ['', Validators.required],
      effectiveFrom: ['', Validators.required],
      location: ['', Validators.required],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      reportingSupervisor: ['', Validators.required],
      department: ['', Validators.required],
      band: ['', Validators.required],
      subDepartments: ['', Validators.required],
      employmentStatusEffectiveFrom: ['', Validators.required],
      employmentStatus: ['', Validators.required],
      noticePeriod: ['', Validators.required],
      zone: ['', Validators.required],
      biometricEmployeeCode: ['', Validators.required],
      previousExperience: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.data = this.userService.getData();
    this.isEdit = this.userService.getIsEdit();
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab) {
        this.selectedIndex = this.getTabIndex(tab);
      } else {
        this.route.firstChild?.url.subscribe(url => {
          const path = url[0]?.path;
          this.selectedIndex = this.getTabIndex(path);
        });
      }
    });
  }

  toggleToEmployees() {
    this.userService.toggleEmployeesDetails.next(false);
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onTabChange(event: any) {
    const tabRoutes = ['employee-profile', 'employment-details', 'salary-details', 'statutory-details', 'loans-advances', 'tax'];
    this.router.navigate([tabRoutes[event.index]], { relativeTo: this.route });
  }

  getTabIndex(path: string): number {
    const tabRoutes = ['employee-profile', 'employment-details', 'salary-details', 'statutory-details', 'loans-advances', 'tax'];
    return tabRoutes.indexOf(path);
  }

  getTabLabel(index: number): string {
    const tabLabels = ['Employee Profile', 'Employment Details', 'Salary Details', 'Statutory Details', 'Loans/Advances', 'Tax'];
    return tabLabels[index];
  }

  onSubmit() {
    if (this.employeeForm.valid) {
      // Handle form submission
    } else {
      this.employeeForm.markAllAsTouched();
    }
  }
}