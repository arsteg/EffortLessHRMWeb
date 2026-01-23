import { Component, EventEmitter, OnInit, Output, HostListener } from '@angular/core';
import { Task, TaskAttachment, TaskBoard, attachments, taskAttachments } from './task';
import { TasksService } from '../_services/tasks.service';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { response } from '../models/response';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../_services/project.service';
import { UserService } from '../_services/users.service';
import { CommonService } from 'src/app/_services/common.Service';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { TimeLogService } from '../_services/timeLogService';
import { GetTaskService } from '../_services/get-task.service';
import * as moment from 'moment';
import { Observable, switchMap } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { PreferenceService } from '../_services/user-preference.service';
import { PreferenceKeys } from '../constants/preference-keys.constant';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  providers: [UserService]
})
export class TasksComponent implements OnInit {
  searchText = '';
  p: number = 1;
  projectList: any;
  taskList: any;
  tasks: any;
  date = new Date();
  addForm: FormGroup;
  createTask_Board: FormGroup;
  updateForm: FormGroup;
  selectedTask: any;
  allAssignee: any;
  firstLetter: string;
  color: string;
  projectId: string;
  taskUserList: any;
  isChecked = true;
  userId: string;
  selectedUser: any = [];
  selectedUsers = [];
  public sortOrder: string = ''; // 'asc' or 'desc'
  public allOption: string = "ALL";
  priorityList: priority[] = [{ name: 'Urgent', url: "assets/images/icon-urgent.svg", class: "delete-btn" },
  { name: 'High', url: "assets/images/icon-high.svg", class: "warning-btn" },
  { name: 'Normal', url: "assets/images/icon-normal.svg", class: "success-btn" }];

  statusList: status[] = [
    { name: 'ToDo', faclass: "fa-tasks", isChecked: true },
    { name: 'In Progress', faclass: "fa-indent", isChecked: true },
    { name: 'Done', faclass: "fa-check-square-o", isChecked: true },
    { name: 'Closed', faclass: "fa-window-close-o", isChecked: true }
  ];

  unKnownImage = "assets/images/icon-unknown.svg";

  showPriorityDropdown = false;
  selectedTaskIndex = -1;
  selectedTaskStatusIndex = -1;
  attachments: attachments[] = [];
  task: any;
  selectedFiles: any = [];
  fileProperties: any = {};
  taskAttachment: any = [];
  activeTaskId: string = '';
  isListView: boolean = true;
  filteredTasks: any[];
  showToDoTask: boolean = false;
  showInProgressTask: boolean = false;
  showDoneTask: boolean = false;
  showClosedTask: boolean = false;
  newTask: any = {};
  view = localStorage.getItem('adminView');
  admin: string = 'admin';
  comments: any[];
  skip: string = '0';
  next = '10';
  @Output() editTask: EventEmitter<string> = new EventEmitter<string>();
  members: any;
  member: any;
  assignedUser: any;
  usersByProject: any;
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100]; // Add the available options for records per page
  recordsPerPage: number = 10; // Default records per page
  totalRecords: any; // Total number of records
  currentPage: number = 1;
  index: number;
  currentProfile: any;
  role: any;
  showEditor: boolean = false;
  selectedPriority: any;
  selectedStatus: string = '';
  storedFilters: any;
  status = new FormControl([]);
  toppingList: string[] = ['ToDo', 'In-Progress', 'Done', 'Close'];
  domain: string;
  dialogRef: MatDialogRef<any> | null = null;
  isSubmitting: boolean = false;

  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private projectService: ProjectService,
    public commonservice: CommonService,
    private router: Router,
    private authService: AuthenticationService,
    private timelog: TimeLogService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private preferenceService: PreferenceService
  ) {
    this.addForm = this.fb.group({
      taskName: [''],
      title: [''],
      startDate: [moment().format('YYYY-MM-DD')],
      endDate: [moment().format('YYYY-MM-DD')],
      description: [''],
      estimate: [0],
      comment: ['Task Created'],
      priority: [''],
      user: ['', Validators.required],
      project: ['', Validators.required],
      taskAttachments: [this.attachments]
    }, { validators: this.dateValidator });
    this.createTask_Board = this.fb.group({
      taskName: [''],
      title: [''],
      description: [''],
      estimate: [0],
      comment: [''],
      priority: ['', Validators.required],
      user: ['', Validators.required],
      project: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      title: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      user: ['', Validators.required],
      project: ['', Validators.required],
      status: ['', Validators.required],
      estimate: [0],
      timeTaken: [0],
    });
    this.status = new FormControl(this.statusList.filter(item => item.isChecked).map(item => item.name));
  }

  getPriorityClass(name:string) {
    return this.priorityList.find(p=>p.name === name)?.class;
  }

  ngOnInit(): void {
    this.onLoad();
    this.commonservice.getCurrentUserRole().subscribe((role: any) => {
      this.role = role;
    })
    this.isChecked = true;
    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
    this.storedFilters = this.commonservice.getFilters();
    if (this.storedFilters) {
      this.userId = this.storedFilters.userId;
      this.projectId = this.storedFilters.projectId
    }

    this.getCurrentUser().subscribe(() => {
      this.getprojects();
      this.populateUsers();

      this.userId = this.storedFilters.userId;
      this.projectId = this.storedFilters.projectId;
      if (this.storedFilters) {
        if (this.storedFilters.userId) {
          this.getTaskByIds();
        }
        if (this.storedFilters.projectId) {
          this.getTasksByProject();
        }
        if (this.storedFilters.projectId && this.storedFilters.userId) {
          this.authService.getUserTaskListByProject(this.userId, this.projectId, this.skip, this.next).subscribe(
            (response: any) => {
              this.totalRecords = response;
              this.tasks = response.taskList;
              this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
            });
        } else {
          this.getTasks();
        }
      }
    });

    this.setDefaultViewMode()
    
    this.status.valueChanges.subscribe(value => {
      this.statusList.forEach(item => {
        item.isChecked = value.includes(item.name);
      });
    });
  }
  dateValidator(group: AbstractControl) {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    // Only validate if both dates are present
    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      return { dateRangeError: true };
    }
    return null;
  }
  
  onStatusChange(statusItem: any): void {
    const currentStatusValues = this.status.value || [];

    if (statusItem.isChecked) {
      this.status.setValue([...currentStatusValues, statusItem.name]);
    } else {
      this.status.setValue(currentStatusValues.filter(value => value !== statusItem.name));
    }
  }

  getCurrentUsersTasks() {
    if (this.currentProfile.id) {
      this.tasksService.getTaskByUser(this.currentProfile.id, this.skip, this.next).subscribe(response => {
        this.tasks = response && response.data && response.data['taskList'];
        this.totalRecords = response && response.data;
        this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
        this.tasks = this.tasks.filter(task => task !== null);
      });
    }
  }

  getCurrentUser() {
    return this.commonservice.getCurrentUser().pipe(
      switchMap((profile: any) => {
        this.currentProfile = profile;
        return new Observable((observer) => {
          observer.next();
          observer.complete();
        });
      })
    );
  }

  populateUsers() {
    this.members = [];
    this.member = this.currentProfile;

    // Add "Me" by default
    this.members.push({ id: this.member?.id, name: "Me", email: this.member?.email });

    this.timelog.getTeamMembers(this.member?.id).subscribe({
      next: (response: { data: any; }) => {
        const hasSubordinates = response.data && response.data.length > 0;

        if (hasSubordinates) {
          this.members.unshift({ id: '', name: 'ALL Users', email: '' });
        }

        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email != this.currentProfile.email) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
          }, error: error => { }
        });
      }, error: error => { }
    });
  }

  navigateToEditPage(task: any) {
    const taskId = task.id.toString();
    const p_Id = task.parentTask;

    const currentFilters = {
      userId: this.userId,
      projectId: this.projectId
    };
    this.commonservice.setFilters(currentFilters);

    const navigationExtras: NavigationExtras = {
      queryParams: { taskId: taskId }
    };
    if (p_Id) {
      this.router.navigate(['home/SubTask'], navigationExtras);
    } else {
      this.router.navigate(['home/edit-task'], navigationExtras);
    }
  }
 
  

  isStatusChecked(status: string): boolean {
    const statusItem = this.statusList.find(item => item.name === status);
    return statusItem ? statusItem.isChecked : false;
  }

  async listAllTasks() {
    this.tasksService.getAllTasks(this.skip, this.next).subscribe((response: any) => {

      // this.tasksService.getTasklistbyTeam(this.skip, this.next).subscribe((response: any) => {
      this.totalRecords = response && response.data
      this.tasks = response && response.data && response.data['taskList'];
      this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
    });
  }

  getTasksbyTeam() {
    this.tasksService.getTasklistbyTeam(this.skip, this.next).subscribe((response: any) => {
      this.totalRecords = response && response.data
      this.tasks = response && response.data && response.data['taskList'];
      this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
    });
  }

  async paginateTasks(event?: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.next = this.recordsPerPage.toString();
    this.skip = ((this.currentPage - 1) * this.recordsPerPage).toString();

    // Check if "ALL" projects is selected (empty string or null/undefined)
    const isAllProjects = !this.projectId || this.projectId === '';
    // Check if "ALL" users is selected (empty string or null/undefined)
    const isAllUsers = !this.userId || this.userId === '';

    if (isAllProjects && isAllUsers) {
      // Both ALL users and ALL projects - get all tasks based on role
      if ((this.view === 'admin') && (this.role?.toLowerCase() === 'admin' || this.role == null) || (this.role?.toLowerCase() === 'admin' && this.view == null)) {
        this.listAllTasks();
      } else {
        this.getTasksbyTeam();
      }
    } else if (!isAllProjects && !isAllUsers) {
      // Both specific user and specific project selected
      this.authService.getUserTaskListByProject(this.userId, this.projectId, this.skip, this.next).subscribe(
        (response: any) => {
          this.totalRecords = response;
          this.tasks = response.taskList;
          this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
        });
    } else if (!isAllUsers) {
      // Specific user, ALL projects
      this.getTaskByIds();
    } else if (!isAllProjects) {
      // ALL users, specific project
      this.getTasksByProject();
    }
  }


  async getTasksByProject() {
    // Check if a specific user is selected (not "ALL" users)
    const hasSelectedUser = this.userId && this.userId !== '';
    if (!hasSelectedUser) {
      // ALL users, specific project - get all tasks for project
      this.tasksService.getTasksByProjectId(this.projectId, this.skip, this.next).subscribe(
        (response: any) => {
          if (response && response.data && Array.isArray(response.data.taskList)) {
            this.totalRecords = response && response.data
            this.tasks = response.data.taskList;
          }
          this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
        }, (error: any) => { }
      );
    } else {
      // Specific user and specific project
      this.authService.getUserTaskListByProject(this.userId, this.projectId, this.skip, this.next).subscribe(
        (response: any) => {
          this.totalRecords = response;
          this.tasks = response.taskList;
          this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
        }, (error: any) => { });
    }
  }

  getUsersByProject() {
    const selectedProject = this.createTask_Board.value.project;
    this.projectService.getprojectUser(selectedProject).subscribe((res: any) => {
      this.usersByProject = res?.data?.projectUserList;
      this.usersByProject = this.usersByProject.filter(user => user !== null);
    });
  }

  getUsersListByProject() {
    const selectedProject = this.addForm.value.project;
    this.projectService.getprojectUser(selectedProject).subscribe((res: any) => {
     const usersByProject = res?.data?.projectUserList;
      this.usersByProject = usersByProject.filter(user => user.user !== null);
    });
  }

  onSubmit() {
    if (this.addForm.valid) {

      if(this.isSubmitting){
        this.toast.info('You have already clicked on submit.', 'Info!');
        return;
      }
      else{
        this.isSubmitting = true;
      }

      const newTask: Task = {
        _id: '',
        taskName: this.addForm.value.title,
        title: this.addForm.value.title,
        estimate: this.addForm.value.estimate,
        startDate: this.addForm.value.startDate,
        endDate: this.addForm.value.endDate,
        description: this.addForm.value?.description,
        comment: this.addForm.value.comment,
        isSubTask: false,
        priority: this.addForm.value.priority,
        user: this.addForm.value.user,
        status: "ToDo",
        project: this.addForm.value.project,
        taskAttachments: [] // Initialize an empty array of attachments
      };

      if (this.selectedFiles.length > 0) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file: File = this.selectedFiles[i];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().split(',')[1];
            const fileSize = file.size;
            const fileType = file.type;
            const fileNameParts = file.name.split('.');
            const extention = fileNameParts[fileNameParts.length - 1];

            attachments.push({
              attachmentName: file.name,
              attachmentType: fileType,
              attachmentSize: fileSize,
              extention: extention,
              file: base64String
            });

            if (i === this.selectedFiles.length - 1) {
              newTask.taskAttachments = attachments;

              // Make the API call inside the asynchronous block
              this.tasksService.addTask(newTask).subscribe(
                (response) => {
                  this.task = response;
                  const newTask = this.task.data;
                  this.tasks.push(newTask);
                  newTask.taskAttachments = [];
                  if (this.userId && this.projectId) {
                    this.getTasksByProject()
                  } else {
                    this.getTaskByIds();
                  }
                  this.addForm.reset({
                    startDate: moment().format('YYYY-MM-DD'),
                    endDate: moment().format('YYYY-MM-DD'),
                    taskAttachments: []
                  });
                  this.dialogRef.close(true);
                  this.selectedFiles = [];
                  this.toast.success('New Task Successfully Created!', `Task Number: ${newTask.newTask.taskNumber}`);
                }, (err) => {
                  this.toast.error('Task Can not be Created', 'Error!');
                }
              );
            }
          };
        }
      } else {
        // If no files are selected, directly make the API call without attachments
        this.tasksService.addTask(newTask).subscribe(
          (response) => {
            this.task = response;
            const newTask = this.task.data;
            this.tasks.push(newTask);
            if (this.userId && this.projectId) {
              this.getTasksByProject()
            } else if
              (!this.userId && !this.projectId) {
              this.listAllTasks();
            } else {
              this.getTaskByIds();
            }
            this.addForm.reset({
              startDate: moment().format('YYYY-MM-DD'),
              endDate: moment().format('YYYY-MM-DD'),
              taskAttachments: []
            });
            this.selectedFiles = [];
            this.dialogRef.close(true);
            this.isSubmitting = false;
            this.toast.success('New Task Successfully Created!', `Task Number: ${newTask.newTask.taskNumber}`);
          }, (err) => {
            this.isSubmitting = false;
            this.toast.error('Choose a different, unique title for your task', 'Error!');
          }
        );
      }
    } else {
      this.markFormGroupTouched(this.addForm);
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  clearForm() {
    this.addForm.reset();
    if (this.view == 'admin') {
      this.getprojects();
    } else if (this.view == 'user') {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'))
      this.projectService.getProjectByUserId(currentUser.id).subscribe(response => {
        this.projectList = response && response.data && response.data['projectList'];
        this.projectList = this.projectList.filter(project => project !== null);
      });
    }
    this.addForm.patchValue({
      startDate: moment().format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      taskAttachments: [],
      project: undefined,
      user: undefined,
      estimate: 8
    });
    this.selectedFiles = [];
  }

  openDialog(addModal: any): void {
    this.clearForm();
    this.isSubmitting = false;
    this.dialogRef = this.dialog.open(addModal, {
      width: '50%',
    });
    this.dialogRef.afterClosed().subscribe(result => {
    });
  }

  onFileSelect(event) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files.item(i);
        if (file) {
          this.selectedFiles.push(file);
        }
      }
    }
  }

  removeFile(index: number) {
    if (index !== -1) {
      this.selectedFiles.splice(index, 1);
    }
  }

  deleteDialog(task: any): void {
      this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.selectedTask = task;
          this.deleteTask();
        }
        err => {
          this.toast.error('Can not be Deleted', 'Error!')
        }
      });
    }

  deleteTask() {
    if (!this.selectedTask.project) {
      this.toast.error('Task Cannot be Deleted: Please update Project', 'Error!');
      return;
    }
    this.tasksService.deleteTask(this.selectedTask._id).subscribe(response => {
      const index = this.tasks.findIndex(task => task.id === this.selectedTask._id);
      if (index !== -1) {
        this.tasks.splice(index, 1);
      }
      this.toast.success('New Task Successfully Deleted!', `Task Number: ${this.selectedTask.taskNumber}`);
    }, err => {
      this.toast.error(`Task Cannot be Deleted ${err}`, 'Error!');
    });
  }

  selectTask(selectedTask) {
    this.selectedTask = selectedTask
  }

  onProjectSelectionChange() {
    this.skip = '0'; // Always reset pagination when filter changes

    // Check if "ALL" projects is selected (empty string or null/undefined)
    const isAllProjects = !this.projectId || this.projectId === '';
    // Check if "ALL" users is selected (empty string or null/undefined)
    const isAllUsers = !this.userId || this.userId === '';

    if (isAllProjects) {
      if (isAllUsers) {
        // Both ALL users and ALL projects selected
        this.getTasks();
      } else {
        // Specific user, ALL projects
        this.getTaskByIds();
      }
    } else {
      // Specific project selected
      this.getTasksByProject();
    }
  }

  async getTaskByIds() {
    this.tasksService.getTaskByUser(this.userId, this.skip, this.next).subscribe(response => {
      this.tasks = response && response.data && response.data['taskList'];
      this.totalRecords = response && response.data
      this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
      this.tasks = this.tasks.filter(task => task !== null);
    });
    this.projectService.getProjectByUserId(this.userId).subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
      this.projectList = this.projectList.filter(project => project !== null);
    });
  }

  onMemberSelectionChange(user) {
    this.projectId = null;
    this.userId = user;

    if (!this.userId || this.userId === '') {
      this.skip = '0';
      if (this.view === 'user') {
        this.getTasksbyTeam();
      } else if (this.view === 'admin' || this.role?.toLowerCase() === 'admin') {
        this.listAllTasks();
      }
    } else {
      this.skip = '0';
      this.getTaskByIds();
    }
  }

  getTaskPriorityUrl(currentPriority) {
    const priority = this.priorityList.find(x => x.name?.toLowerCase() === currentPriority?.toLowerCase());
    return priority?.url ? priority?.url : this.unKnownImage;
  }

  updateTaskPriority(selectedTask, priority: string) {
    const payload = {
      "priority": priority,
      taskName: selectedTask.taskName,
      startDate: selectedTask.startDate,
      endDate: selectedTask.endDate,
      startTime: selectedTask.startTime,
      description: selectedTask.description,
      comment: selectedTask.comment,
      project: selectedTask.project,
      title: selectedTask.ttitle,
      parentTask: selectedTask.parentTask,
      estimate: selectedTask.estimate,
      timeTaken: selectedTask.timeTaken,
    }
    selectedTask.priority = priority;
    this.tasksService.updatetaskFlex(selectedTask._id, payload).subscribe(response => {
      this.toast.success('Task priority updated successfully', `Task Number: ${selectedTask.taskNumber}`)
    }, err => {
      this.toast.error('Task could not be updated', 'ERROR!')
    })
  }

  updateTaskStatus(selectedTask, status: string) {
    const payload = {
      "status": status,
      taskName: selectedTask.taskName,
      startDate: selectedTask.startDate,
      endDate: selectedTask.endDate,
      startTime: selectedTask.startTime,
      description: selectedTask.description,
      comment: selectedTask.comment,
      priority: selectedTask.priority,
      project: selectedTask.project,
      title: selectedTask.ttitle,
      parentTask: selectedTask.parentTask,
      estimate: selectedTask.estimate,
      timeTaken: selectedTask.timeTaken,
    }
    payload.status = status
    this.tasksService.updatetaskFlex(selectedTask._id, payload).subscribe((response: any) => {
      const updatedTaskStatus = response && response.data && response.data.data;
      const index = this.tasks.findIndex(task => task._id === updatedTaskStatus._id);
      if (index !== -1) {
        this.tasks[index] = {
          ...updatedTaskStatus,
          TaskUsers: selectedTask.TaskUsers
        };
        selectedTask.status = status;
      }
      this.toast.success('Task status updated successfully', `Task Number: ${selectedTask.taskNumber}`)
    }, err => {
      this.toast.error('Task could not be updated', 'ERROR!')
    })
  }

  getTaskById(id: string): void {
    this.tasksService.getTaskById(id).subscribe(task => {
      this.tasks = task;
    });
  }

  setDefaultViewMode() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.preferenceService.getPreferenceByKey(PreferenceKeys.TaskSelectedTasksView, currentUser?.id)
      .subscribe({
        next: (response: any) => {
          const preferences = response?.data?.preferences || [];
          if (!preferences || preferences.length === 0) {
            const queryParams = this.route.snapshot.queryParamMap;
            this.isListView = queryParams.get('view') !== 'board';
            this.updateViewModeQueryParam(this.isListView);
            return;
          }
          const match = preferences.find((pref: any) =>
            pref?.preferenceOptionId?.preferenceKey === PreferenceKeys.TaskSelectedTasksView
          );
          this.isListView = match?.preferenceOptionId?.preferenceValue === 'List';
          this.updateViewModeQueryParam(this.isListView);
        },
        error: (err) => {
          console.error('Failed to load language preference', err);
          const queryParams = this.route.snapshot.queryParamMap;
          this.isListView = queryParams.get('view') !== 'board';
          this.updateViewModeQueryParam(this.isListView);
        }
      });
  }

  toggleViewMode() {
    this.isListView = !this.isListView;
    this.updateViewModeQueryParam(this.isListView);
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.preferenceService.createOrUpdatePreference(
      currentUser.id,
      PreferenceKeys.TaskSelectedTasksView,
      this.isListView ? 'List' : 'Board'
    ).subscribe();
  }

  updateViewModeQueryParam(isListView: boolean) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: isListView ? 'list' : 'board' },
      queryParamsHandling: 'merge'
    });
  }

  calculateTasksLength(status: string): number {
    this.filteredTasks = this.tasks?.filter(task => task?.status === status);
    return this.filteredTasks?.length;
  }

  toggleToDoTask() {
    this.showToDoTask = !this.showToDoTask;
    this.newTask = {};
  }

  toggleInProgressTask() {
    this.showInProgressTask = !this.showInProgressTask;
    this.newTask = {};
  }

  toggleDoneTask() {
    this.showDoneTask = !this.showDoneTask;
    this.newTask = {};
  }

  toggleClosedTask() {
    this.showClosedTask = !this.showClosedTask;
    this.newTask = {};
  }

  addTaskToDo() {
    const id: '' = this.currentProfile.id
    const taskFromBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      user: this.view === 'admin' ? [] : [id],
      status: 'ToDo',
      project: this.createTask_Board.value.project
    }
    this.tasksService.addTask(taskFromBoard).subscribe(response => {
      this.task = response;
      this.tasks.push(taskFromBoard);
      this.ngOnInit();
      this.createTask_Board.reset();
      this.toggleToDoTask();
    })
  }

  addTaskInProgress() {
    const id: '' = this.currentProfile.id
    const taskFromBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      user: this.view === 'admin' ? [] : [id],
      status: 'In Progress',
      project: this.createTask_Board.value.project
    }
    this.tasksService.addTask(taskFromBoard).subscribe(response => {
      this.task = response;
      this.tasks.push(taskFromBoard);
      this.ngOnInit();
      this.createTask_Board.reset();
      this.toggleInProgressTask();
    })
  }

  addTaskDone() {
    const id: '' = this.currentProfile.id
    const taskFromBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      user: this.view === 'admin' ? [] : [id],
      status: 'Done',
      project: this.createTask_Board.value.project
    }
    this.tasksService.addTask(taskFromBoard).subscribe(response => {
      this.task = response;
      this.tasks.push(taskFromBoard);

      this.ngOnInit();
      this.createTask_Board.reset();
      this.toggleDoneTask();
    })
  }

  addTaskClosed() {
    const id: '' = this.currentProfile.id
    const taskFromBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      user: this.view === 'admin' ? [] : [id],
      status: 'Closed',
      project: this.createTask_Board.value.project
    }
    this.tasksService.addTask(taskFromBoard).subscribe(response => {
      this.task = response;
      this.tasks.push(taskFromBoard);
      this.ngOnInit();
      this.createTask_Board.reset();
      this.toggleClosedTask();
    })
  }

  getProjectNameInitials(taskName: string): string {
    if (taskName) {
      const words = taskName.split(' ');
      return words.map(word => word.charAt(0).toUpperCase()).join('');
    }
    return '';
  }

  setPriority(priority: any) {
    this.newTask.priority = priority;
  }

  removePriority() {
    this.newTask.priority = null;
  }

  getTasks() {
    const isAdmin = (this.view === 'admin') && (this.role?.toLowerCase() === 'admin' || this.role == null) || (this.role?.toLowerCase() === 'admin' && this.view == null);
    const hasStoredFilters = this.storedFilters?.userId || this.storedFilters?.projectId;

    if (!hasStoredFilters && isAdmin) {
      this.listAllTasks();
    } else if (this.view === 'user' || this.role?.toLowerCase() === 'user') {
      this.getTasksbyTeam();
    } else if (this.currentProfile?.id && this.role?.toLowerCase() !== 'admin') {
      this.getCurrentUsersTasks();
    } else {
      // Fallback for admin with no stored filters
      this.listAllTasks();
    }
  }

  getprojects() {
    if (this.view === 'admin') {
      this.commonservice.getProjectList().subscribe(response => {
        this.projectList = response && response.data && response.data['projectList'];
      });
    } else {
      this.projectService.getProjectByUserId(this.currentProfile.id).subscribe(response => {
        this.projectList = response && response.data && response.data['projectList'];
        this.projectList = this.projectList.filter(project => project !== null);
      });
    }
  }

  getColor(status: string): string {
    if (status === 'In Progress') {
      return 'blue';
    } else if (status === 'ToDo') {
      return '#b038fa';
    } else if (status === 'Done') {
      return 'green';
    } else {
      return 'grey';
    }
  }

  onInputClick() {
    this.showEditor = true;
  }

  @HostListener('window:load', ['$event'])

  onLoad(): void {
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (hostname === 'localhost') {
      this.domain = `${hostname}:${port}`;
    } else {
      this.domain = hostname;
    }
  }


  copyTask(task) {
    const hostname = window.location.hostname;
    const port = window.location.port;

    if (hostname === 'localhost')
      this.domain = `${hostname}:${port}`;
    else
      this.domain = hostname;

    const taskID = task.id;
    const p_Id = task.parentTask;
    const url = p_Id
      ? `http://${this.domain}/#/home/SubTask?taskId=${taskID}`
      : `http://${this.domain}/#/home/edit-task?taskId=${taskID}`;

    navigator.clipboard.writeText(url).then(() => {
      this.snackBar.open('Task is copied to clipboard', 'Dismiss', { duration: 4000 });
    }).catch((error) => {
      console.error('Error copying to clipboard:', error);
    });
  }

  getFaclass(status: string): string {
    const statusItem = this.statusList.find(item => item.name === status);
    return statusItem ? statusItem.faclass : '';
}

}
interface priority {
  name: string,
  url: string,
  class: string
}
interface status {
  name: string,
  faclass: string,
  isChecked: boolean
}
