import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-employee-settings',
  templateUrl: './employee-settings.component.html',
  styleUrl: './employee-settings.component.css'
})
export class EmployeeSettingsComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string = 'tabEmploymentProfile';
  @Input() selectedUser: any;
  data: any;
  isEdit: boolean;

  constructor(private userService: UserService,private router: Router,
    private route: ActivatedRoute,) { }

  ngOnInit() {
    console.log(this.userService.toggleEmployeesDetails.getValue());

    this.data = this.userService.getData();
    this.isEdit = this.userService.getIsEdit();
  }

  toggleToEmployees() {
    this.userService.toggleEmployeesDetails.next(false);
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}