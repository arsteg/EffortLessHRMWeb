import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { signup, User } from 'src/app/models/user';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { RoleService } from 'src/app/_services/role.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  usersList: MatTableDataSource<any>;
  inviteUser: signup[] = [];
  searchText = '';
  p: number = 1;
  public users: Array<User> = [];
  date = new Date('MMM d, y, h:mm:ss a');
  selectedUser: any;
  addForm: FormGroup;
  updateForm: FormGroup;
  firstLetter: string;
  color: string;
  public sortOrder: string = '';
  showEmployeeDetails = false;
  selectedEmployee: any;
  isEdit: boolean = false;
  userForm: FormGroup;
  roles: any;
  totalRecords: number;
  showOffcanvas: boolean;
  @ViewChild('offcanvasContent', { read: ViewContainerRef }) offcanvasContent: ViewContainerRef;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private UserService: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private toastrrr: ToastrService,
    public commonservice: CommonService,
    private dialog: MatDialog,
    private toast: ToastrService) {

    this.userForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
        lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordConfirm: ['', Validators.required],
        jobTitle: [''],
        phone: ['', [Validators.pattern('^[0-9]{10}$')]],
        role: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.getRoles();
    this.commonservice.populateUsers().subscribe(result => {
      this.totalRecords = result.results;
      this.usersList = new MatTableDataSource(result && result.data && result.data.data);
    });
    this.firstLetter = this.commonservice.firstletter;
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirm')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.usersList.data, event.previousIndex, event.currentIndex);
    this.usersList.data = [...this.usersList.data];
  }

  getRoleName(id) {
    let role = this.roles.find((role) => { return role.id == id; });
    if (role && role.Name) {
      return role.Name
    } else { return 'Employee' }
  }

  getRoles() {
    this.roleService.getAllRole().subscribe((res: any) => {
      this.roles = res.data;
    })
  }

  addUser() {
    // if (this.addForm.valid) {
    this.UserService.addUser(this.userForm.value).subscribe(result => {
      const users = result['data'].User;
      this.usersList.data = [...this.usersList.data, users];
      this.toastrrr.success('New User Added', 'Successfully Added!');
    }, err => {
      this.toastrrr.error('User with this Email already Exists', 'Duplicate Email!')
    });
    this.userForm.reset();

  }

  deleteUser() {
    this.UserService.deleteUser(this.selectedUser._id)
      .subscribe(response => {
        this.usersList.data = this.usersList.data.filter(user => user._id !== this.selectedUser._id);
        this.toastrrr.success('Existing User Deleted', 'Successfully Deleted!')
      }, err => {
        this.toastrrr.error('Can not be Deleted', 'ERROR!')
      })
  }

  clearForm() {
    this.addForm.reset();
  }

  toggleView(data: any) {
    this.isEdit = true;
    this.UserService.setData(data, this.isEdit);

    const empCode = data.appointment[0]?.empCode;
    if (empCode) {
      this.router.navigate([empCode, 'employee-settings', 'employee-profile'], { relativeTo: this.route });
    } else {
      console.error('empCode is not defined');
    }
    this.showEmployeeDetails = !this.showEmployeeDetails;
  }


  openOffcanvas(isEdit: boolean) {
    this.isEdit = isEdit;
    this.showOffcanvas = true;
  }

  closeOffcanvas() {
    this.showOffcanvas = false;
    this.isEdit = false;
  }

  deleteEmployee(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.delete(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  delete(id: string) {
    this.UserService.deleteUser(id).subscribe((res: any) => {
      this.usersList.data = this.usersList.data.filter(user => user?._id !== id);
      this.toast.success('Employee record has been successfully deleted.', 'Action Complete');
    },
      (err) => {
        this.toast.error('This Employee record Can not be deleted.'
          , 'Error!')
      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersList.filter = filterValue.trim().toLowerCase();
  }

}