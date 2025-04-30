import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrls: ['./employee-settings.component.css']
})
export class EmployeeSettingsComponent {
  @Output() backToUserView = new EventEmitter<void>();
  @Input() selectedUser: any;
  selectedIndex: number;
  employeeForm: FormGroup;
  selectedTab: string;
  isProfileView = false;

  constructor(private userService: UserService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    const urlPath = this.router.url;
    this.isProfileView = urlPath.includes('/profile');
    const segments = urlPath.split('/').filter(segment => segment);
    const lastRoute = segments[segments.length - 1];

    const tabRoutes = ['employee-profile', 'employment-details', 'salary-details', 'statutory-details', 'loans-advances'];
    this.selectedIndex = tabRoutes.indexOf(lastRoute);

    switch (this.selectedIndex) {
      case 0:
        this.selectedTab = 'Employee Profile';
        break;
      case 1:
        this.selectedTab = 'Employment Details';
        break;
      case 2:
        this.selectedTab = 'Salary Details';
        break;
      case 3:
        this.selectedTab = 'Statutory Details';
        break;
      case 4:
        this.selectedTab = 'Loans/Advances';
        break;
      case 5:
        this.selectedTab = 'Tax';
        break;
      default:
        this.selectedTab = 'Employee Profile';
        break;
    }
    if (this.selectedTab) {
      this.userService.toggleEmployeesDetails.next(true);
    }
  }

  toggleToEmployees() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    const newSegments = segments.slice(0, -3);
    const newPath = newSegments.join('/');
    if (this.selectedTab) {
      this.userService.toggleEmployeesDetails.next(false);
    }
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() =>
      this.router.navigate(['/' + newPath], { relativeTo: this.route })
    );
  }

  onTabChange(event: any) {
    this.selectedTab = event.tab.textLabel;
    const tabRoutes = ['employee-profile', 'employment-details', 'salary-details', 'statutory-details', 'loans-advances'];
    this.router.navigate([tabRoutes[event.index]], { relativeTo: this.route });
  }
}