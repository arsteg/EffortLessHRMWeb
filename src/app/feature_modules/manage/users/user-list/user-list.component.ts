import { Component, ComponentFactoryResolver, inject, OnInit, ViewChild, ViewContainerRef, OnDestroy } from '@angular/core';
import { signup, User } from 'src/app/models/user';
import { Validators, FormGroup, FormBuilder, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { RoleService } from 'src/app/_services/role.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { UserService } from 'src/app/_services/users.service';
import { MatTableDataSource } from '@angular/material/table';
import { TableColumn, ActionVisibility } from 'src/app/models/table-column';
import { DatePipe } from '@angular/common';
import { filter, switchMap, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit, OnDestroy {
  private datePipe = inject(DatePipe);
  private destroy$ = new Subject<void>();
  usersList: MatTableDataSource<any>;
  inviteUser: signup[] = [];
  searchText = '';
  p: number = 1;
  public users: Array<User> = [];
  date = new Date('MMM d, y, h:mm:ss a');
  selectedUser: any;
  firstLetter: string;
  color: string;
  public sortOrder: string = '';
  showEmployeeDetails = false;
  selectedEmployee: any;
  isEdit: boolean = false;
  userForm: FormGroup;
  roles: any;
  totalRecords: number;
  showOffcanvas: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  @ViewChild('offcanvasContent', { read: ViewContainerRef }) offcanvasContent: ViewContainerRef;
  columns: TableColumn[] = [
    { key: 'empCode', name: 'Emp Code', valueFn: (row: any) => row.appointment[0]?.empCode },
    { key: 'name', name: 'Member', valueFn: (row: any) => `${row.firstName} ${row.lastName}` },
    { key: 'email', name: 'Email' },
    { key: 'jobTitle', name: 'Position' },
    { key: 'role.name', name: 'Role' },
    { key: 'createdOn', name: 'Created On', valueFn: (row: any) => row.createdOn ? this.datePipe.transform(row.createdOn, 'mediumDate') : '' },
    { key: 'status', name: 'Status', cssClassFn: (row: any) => row.status === 'Active' ? 'text-success' : 'text-danger' },
    {
      key: 'actions', name: 'Actions', isAction: true, options: [
        { label: 'Settings', icon: 'settings', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH },
      ]
    }
  ]

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private fb: FormBuilder,
    private roleService: RoleService,
    private toastrrr: ToastrService,
    public commonservice: CommonService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: ToastrService
  ) {
    // Custom validators


    const emailExistsValidator = (): AsyncValidatorFn => {
      return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) return of(null);
        return of(control.value).pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(email => this.userService.checkEmailExists(email)),
          map(response => {
          
            return response.exists ? { emailExists: true } : null;
          }),
          takeUntil(this.destroy$)
        );
      };
    };

    this.userForm = this.fb.group(
      {
        firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
        lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z]{2,}$')]],
        email: ['', [Validators.required, Validators.email], [emailExistsValidator()]],
        password: ['', [Validators.required, Validators.minLength(8), CustomValidators.strongPasswordValidator]],
        passwordConfirm: ['', [Validators.required]],
        jobTitle: [''],
        phone: ['', [Validators.pattern('^[0-9]{10}$')]],
        role: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );

    this.userForm.statusChanges.pipe(takeUntil(this.destroy$)).subscribe(status => {
      console.log('Form status:', status, this.userForm.errors, this.userForm.get('email')?.errors);
    });

    if (this.router.url === '/home/manage/employees') {
      this.showEmployeeDetails = false;
    } else {
      this.showEmployeeDetails = true;
    }
    this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        console.log('Navigation ended:', event.url);
        if (event.url === '/home/manage/employees') {
          this.showEmployeeDetails = false;
          this.fetchUsers();
        } else {
          this.showEmployeeDetails = true;
        }
      });
  }

  ngOnInit() {
    this.getRoles();
    this.fetchUsers();
    this.firstLetter = this.commonservice.firstletter;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchUsers() {
    this.userService.getUserList().subscribe({
      next: (result: any) => {
        this.totalRecords = result.results;
        this.usersList = new MatTableDataSource(result && result.data && result.data.data);
      },
      error: (err) => {
      
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.users.user-list.failed_user_load')
        ;
       
        this.toast.error(errorMessage, 'Error!');
      }
    });
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case 'Settings':
        this.toggleView(event.row);
        break;
      case 'Delete':
        this.deleteEmployee(event.row?._id);
        break;
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirm')?.value;
    return password === confirmPassword ? null : { notMatching: true };
  }

  togglePasswordVisibility(field: 'password' | 'passwordConfirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.usersList.data, event.previousIndex, event.currentIndex);
    this.usersList.data = [...this.usersList.data];
  }

  getRoleName(id) {
    let role = this.roles.find((role) => role.id == id);
    return role && role.Name ? role.Name : 'Employee';
  }

  getRoles() {
    this.roleService.getAllRole().subscribe({
      next: (res: any) => {
        this.roles = res.data;
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.users.user-list.failed_roles_load')
        ;
       
        this.toast.error(errorMessage, 'Error!');
      }
    });
  }

  addUser() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error')); 
      return;
    }

    const formValue = { ...this.userForm.value };
    delete formValue.passwordConfirm; // Remove confirmPassword before sending to backend
    this.userService.addUser(formValue).subscribe({
      next: (result) => {
         const users = result['data'].User;
        this.usersList.data = [...this.usersList.data, users];
         this.toast.success(this.translate.instant('manage.user-list.user_added'), this.translate.instant('common.success'));
         this.userForm.reset();
        this.showOffcanvas = false;
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.user-list.user_add_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
       }
    });
  }

  deleteUser() {
    this.userService.deleteUser(this.selectedUser._id).subscribe({
      next: (response) => {
        this.usersList.data = this.usersList.data.filter((user) => user._id !== this.selectedUser._id);
        this.toast.success(this.translate.instant('manage.user-list.user_deleted'), this.translate.instant('common.success'));
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.user-list.user_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
        
      }
    });
  }

  toggleView(data: any) {
    this.isEdit = true;
    this.userService.setData(data, this.isEdit);
    const empCode = data.appointment[0]?.empCode;
    if (empCode) {
      this.router.navigate([empCode, 'employee-settings', 'employee-profile'], {
        relativeTo: this.route,
        state: { data: { empName: data.firstName + ' ' + data.lastName } },
      });
    } else {
      console.error('empCode is not defined');
    }
  }

  openOffcanvas(isEdit: boolean) {
    this.isEdit = isEdit;
    this.showOffcanvas = true;
    this.userForm.reset(); // Reset form to clear previous values
  }

  closeOffcanvas() {
    this.showOffcanvas = false;
    this.isEdit = false;
    this.userForm.reset();
  }

  deleteEmployee(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result === 'delete') {
          this.delete(id);
        }
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.user-list.user_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
      
      }
    });
  }

  delete(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: (res: any) => {
        this.usersList.data = this.usersList.data.filter((user) => user?._id !== id);
        this.toast.success(this.translate.instant('manage.user-list.user_deleted'), this.translate.instant('common.success'));
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.user-list.user_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
       
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersList.filter = filterValue.trim().toLowerCase();
  }
}