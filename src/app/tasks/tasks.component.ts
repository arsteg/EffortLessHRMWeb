import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Task, TaskAttachment, TaskBoard, attachments, taskAttachments } from './task';
import { TasksService } from '../_services/tasks.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { response } from '../models/response';
import { ToastrService } from 'ngx-toastr';
import { project } from '../Project/model/project';
import { ProjectService } from '../_services/project.service';
import { UserService } from '../_services/users.service';
import { CommonService } from '../common/common.service';
import { NavigationExtras, Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { TimeLogService } from '../_services/timeLogService';
import { GetTaskService } from '../_services/get-task.service';
import * as moment from 'moment';
import { Observable, switchMap } from 'rxjs';

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
  priorityList: priority[] = [{ name: 'Urgent', url: "assets/images/icon-urgent.svg" },
  { name: 'High', url: "assets/images/icon-high.svg" },
  { name: 'Normal', url: "assets/images/icon-normal.svg" }];

  statusList: status[] = [
    { name: 'ToDo', faclass: "", isChecked: true },
    { name: 'In Progress', faclass: "", isChecked: true },
    { name: 'Done', faclass: "", isChecked: true },
    { name: 'Closed', faclass: "", isChecked: true }
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

  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private projectService: ProjectService,
    private tost: ToastrService,
    public commonservice: CommonService,
    private router: Router,
    private authService: AuthenticationService,
    private getTaskId: GetTaskService,
    private timelog: TimeLogService,
    private auth: AuthenticationService
  ) {
    this.addForm = this.fb.group({
      taskName: [''],
      title: [''],
      startDate: [moment().format('YYYY-MM-DD'), Validators.required],
      endDate: [moment().format('YYYY-MM-DD'), Validators.required],
      description: ['', Validators.required],
      estimate: [0],
      comment: ['Task Created', Validators.required],
      priority: ['', Validators.required],
      TaskUser: [''],
      project: ['', Validators.required],
      taskAttachments: [this.attachments]
    });
    this.createTask_Board = this.fb.group({
      taskName: [''],
      title: [''],
      description: [''],
      estimate: [0],
      comment: [''],
      priority: ['', Validators.required],
      TaskUser: [''],
      project: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      title: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: ['', Validators.required],
      status: ['', Validators.required],
      estimate: [0],
      timeTaken: [0],
    });

  }
  ngOnInit(): void {
    this.commonservice.getCurrentUserRole().subscribe((role: any) => {
      this.role = role;
    })
    this.isChecked = true;
    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
    this.getCurrentUser().subscribe(() => {
      // console.log(this.currentProfile.id)
      this.getTasks();
      this.getprojects();
      this.populateUsers();
      this.userId = '';
      
      // if (this.role.toLowerCase() === 'admin' || this.role == null || this.view === 'admin') {
      //   console.log(this.role)
      //   this.listAllTasks();
      // }
      // else (this.role.toLowerCase() !== 'admin')
      // this.getTasksbyTeam();
    });
   
  }
  getCurrentUsersTasks(){
    if(this.currentProfile.id){
      console.log(this.currentProfile.id)
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

  // populateUsers() {
  //   this.members = [];
  //   this.members.push({ id: '', name: 'ALL Users', email: '' },
  //     { id: this.currentProfile.id, name: "Me", email: this.currentProfile.email });
  //   this.member = this.currentProfile;
  //   console.log(this.member)
  //   this.timelog.getTeamMembers(this.member.id).subscribe({
  //     next: (response: { data: any; }) => {
  //       this.timelog.getusers(response.data).subscribe({
  //         next: result => {
  //           result.data.forEach(user => {
  //             if (user.email != this.currentProfile.email) {
  //               this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
  //             }
  //           })
  //         },
  //         error: error => {
  //           console.log('There was an error!', error);
  //         }
  //       });
  //     },
  //     error: error => {
  //       console.log('There was an error!', error);
  //     }
  //   });
  // }
  populateUsers() {
    this.members = [];
    this.member = this.currentProfile;
  
    // Add "Me" by default
    this.members.push({ id: this.member.id, name: "Me", email: this.member.email });
  
    this.timelog.getTeamMembers(this.member.id).subscribe({
      next: (response: { data: any; }) => {
        const hasSubordinates = response.data && response.data.length > 0;
  
        if (hasSubordinates) {
          // Add "ALL Users" only if there are subordinates
          this.members.unshift({ id: '', name: 'ALL Users', email: '' });
        }
  
        this.timelog.getusers(response.data).subscribe({
          next: result => {
            result.data.forEach(user => {
              if (user.email != this.currentProfile.email) {
                this.members.push({ id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email });
              }
            })
          },
          error: error => {
            console.log('There was an error!', error);
          }
        });
      },
      error: error => {
        console.log('There was an error!', error);
      }
    });
  }
  
  navigateToEditPage(task: any) {
    const taskId = task.id.toString();
    const p_Id = task.parentTask;
    if (p_Id) {
      console.log(task.parentTask, p_Id)
      const navigationExtras: NavigationExtras = {
        queryParams: { p_Id: p_Id }
      };
      console.log(p_Id)
      this.router.navigate(['/SubTask', task.taskNumber], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        queryParams: { taskId: taskId }
      };
      this.router.navigate(['/edit-task', task.taskNumber], navigationExtras);
    }
  }

  isStatusChecked(status: string): boolean {
    const statusItem = this.statusList.find(item => item.name === status);
    return statusItem ? statusItem.isChecked : false;
  }

  listAllTasks() {
    this.tasksService.getAllTasks(this.skip, this.next).subscribe((response: any) => {
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

  async paginateTasks() {
    this.currentPage = 1;
    if ((!this.userId || !this.currentProfile.id) && !this.projectId) {
      if ((this.view === 'admin')  && (this.role.toLowerCase() === 'admin' || this.role == null) || (this.role.toLowerCase() === 'admin' && this.view == null)) {
        this.listAllTasks();
      }
      else {
        console.log("from pagination")
        this.getTasksbyTeam();
      }
    }
    else if (this.userId) {
      this.getTaskByIds();
    }
    else if (this.projectId) {
      this.getTasksByProject();
    }
  }

  nextPagination() {
    if (!this.isNextButtonDisabled()) {
      const newSkip = (parseInt(this.skip) + parseInt(this.next)).toString();
      this.skip = newSkip;
      this.paginateTasks();
    }
  }

  previousPagination() {
    if (!this.isPreviousButtonDisabled()) {
      const newSkip = (parseInt(this.skip) >= parseInt(this.next)) ? (parseInt(this.skip) - parseInt(this.next)).toString() : '0';
      this.skip = newSkip;
      this.paginateTasks();
    }
  }
  firstPagePagination() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.skip = '0';
      this.next = this.recordsPerPage.toString();
      this.paginateTasks();
    }
  }
  lastPagePagination() {
    const totalPages = this.getTotalPages();
    if (this.currentPage !== totalPages) {
      this.currentPage = totalPages;
      this.updateSkip();
      this.paginateTasks();
    }
  }
  updateSkip() {
    const newSkip = (this.currentPage - 1) * this.recordsPerPage;
    this.skip = newSkip.toString();
  }

  isNextButtonDisabled(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  isPreviousButtonDisabled(): boolean {
    return this.skip === '0' || this.currentPage === 1;
  }
  updateRecordsPerPage() {
    this.currentPage = 1;
    this.skip = '0';
    this.next = this.recordsPerPage.toString();
    this.paginateTasks();
  }
  getTotalPages(): number {
    if (this.totalRecords && this.totalRecords.taskCount) {
      const totalCount = this.totalRecords.taskCount;
      return Math.ceil(totalCount / this.recordsPerPage);
    }
    return 0;
  }

  async getTasksByProject() {
    const selectedUserId = this.userId && this.currentProfile.id;
    if (!selectedUserId) {
      this.tasksService.getTasksByProjectId(this.projectId, this.skip, this.next).subscribe(
        (response: any) => {
          if (response && response.data && Array.isArray(response.data.taskList)) {
            this.totalRecords = response && response.data
            this.tasks = response.data.taskList;
          }
          this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
          console.log(this.currentPage)
        },
        (error: any) => {
          console.log("Error!!!")
        }
      );
    }
    else {
      this.authService.getUserTaskListByProject(this.userId, this.projectId, this.skip, this.next).subscribe(
        (response: any) => {
          this.totalRecords = response;
          this.tasks = response.taskList;
          this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
        });
    }

    (error: any) => {
      console.log("Error!!!");
    }
  }


  // getUsersAndProject(){
  //   this.authService.getUserTaskListByProject(this.userId, this.projectId, this.skip, this.next).subscribe(
  //     (response: any) => {
  //       this.tasks = response && response.data;
  //       this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
  //     });
  // }
  getUsersByProject() {
    const selectedProject = this.addForm.value.project;
    this.projectService.getprojectUser(selectedProject).subscribe((res: any) => {
      this.usersByProject = res && res.data && res.data['projectUserList'];
    });
  }

  onSubmit() {
    const newTask: Task = {
      _id: '',
      taskName: this.addForm.value.title,
      title: this.addForm.value.title,
      estimate: this.addForm.value.estimate,
      startDate: this.addForm.value.startDate,
      endDate: this.addForm.value.endDate,
      description: this.addForm.value.description,
      comment: this.addForm.value.comment,
      isSubTask: false,
      priority: this.addForm.value.priority,
      user: this.addForm.value.TaskUser || null,
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
          const extension = fileNameParts[fileNameParts.length - 1];

          attachments.push({
            attachmentName: file.name,
            attachmentType: fileType,
            attachmentSize: fileSize,
            extension: extension,
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
                console.log("New Task:", newTask);
                if (this.userId && this.projectId) {
                  this.getTasksByProject()
                }
                else {
                  this.getTaskByIds();
                }
                this.addForm.reset({
                  startDate: moment().format('YYYY-MM-DD'),
                  endDate: moment().format('YYYY-MM-DD')
                });
                this.toast.success('New Task Successfully Created!');
              },
              (err) => {
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
          console.log("New Task:", newTask);
          if (this.userId && this.projectId) {
            this.getTasksByProject()
          }
          else {
            this.getTaskByIds();
          }
          this.addForm.reset({
            startDate: moment().format('YYYY-MM-DD'),
            endDate: moment().format('YYYY-MM-DD')
          });
          this.toast.success('New Task Successfully Created!');
        },
        (err) => {
          this.toast.error('Task Can not be Created', 'Error!');
        }
      );
    }
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


  deleteTask() {
    this.tasksService.deleteTask(this.selectedTask.id).subscribe(response => {
      this.toast.success('Successfully Deleted!');
      const index = this.tasks.findIndex(task => task.id === this.selectedTask.id);
      if (index !== -1) {
        this.tasks.splice(index, 1);
      }
    },
      err => {
        this.toast.error('Task Cannot be Deleted', 'Error!');
      });
  }


  selectTask(selectedTask) {
    this.selectedTask = selectedTask
  }




  onProjectSelectionChange() {
    if (this.view === 'admin' || this.role.toLowerCase === 'admin' && !this.userId && !this.currentProfile.id && this.projectId === 'ALL') {
      this.getTasks();
    } else if (this.projectId !== 'ALL') {
      this.skip = '0';
      this.getTasksByProject();
    }
    else if (this.userId) {
      this.skip = '0';
      this.getTaskByIds();
    }
    else {
      if (this.view !== 'admin') {
        this.projectService.getProjectByUserId(this.currentProfile.id).subscribe(response => {
          this.projectList = response && response.data && response.data['projectList'];
          this.projectList = this.projectList.filter(project => project !== null);
        });
        this.tasksService.getTaskByUser(this.currentProfile.id, this.skip, this.next).subscribe(response => {
          this.tasks = response && response.data && response.data['taskList'];
          this.totalRecords = response && response.data
          this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
          this.tasks = this.tasks.filter(task => task !== null);

        });
      }
      else this.getTasks();
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
      if (this.view === 'admin' || this.role.toLowerCase() === 'admin') {
        this.listAllTasks();
      }
      else {
        this.getTasksbyTeam();
      }
    }
    else {
      this.skip = '0';
      this.getTaskByIds();
    }

  }

  getTaskPriorityUrl(currentPriority) {
    const priority = this.priorityList.find(x => x.name.toLowerCase() === currentPriority?.toLowerCase());
    return priority?.url ? priority?.url : this.unKnownImage;
  }

  updateTaskPriority(selectedTask: Task, priority: string) {
    const payload = { "priority": priority }
    selectedTask.priority = priority;
    this.tasksService.updatetaskFlex(selectedTask._id, payload).subscribe(response => {
      this.toast.success('Task priority updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }

  updateTaskStatus(selectedTask: Task, status: string) {
    const payload = { "status": status }
    selectedTask.status = status;
    this.tasksService.updatetaskFlex(selectedTask._id, payload).subscribe(response => {
      this.toast.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  getTaskById(id: string): void {
    this.tasksService.getTaskById(id).subscribe(task => {
      this.tasks = task;
    });
  }

  toggleViewMode() {
    this.isListView = !this.isListView;
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
    const taskFromBoard: TaskBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      taskUsers: this.view === 'admin' ? [] : [id],
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
    const taskFromBoard: TaskBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      taskUsers: this.view === 'admin' ? [] : [id],
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
    const taskFromBoard: TaskBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      taskUsers: this.view === 'admin' ? [] : [id],
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
    const taskFromBoard: TaskBoard = {
      taskName: this.createTask_Board.value.taskName,
      title: this.createTask_Board.value.taskName,
      description: '',
      comment: '',
      priority: this.createTask_Board.value.priority,
      taskUsers: this.view === 'admin' ? [] : [id],
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
    // if(this.currentProfile.id){
    //   console.log(this.currentProfile.id)
    //   this.tasksService.getTaskByUser(this.currentProfile.id, this.skip, this.next).subscribe(response => {
    //     this.tasks = response && response.data && response.data['taskList'];
    //     this.totalRecords = response && response.data;
    //     this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
    //     this.tasks = this.tasks.filter(task => task !== null);
    //   });
    // }
    // else 
     if ((this.view === 'admin')  && (this.role.toLowerCase() === 'admin' || this.role == null) || (this.role.toLowerCase() === 'admin' && this.view == null)) {
     console.log('task list of all users', this.view, this.role)
      this.listAllTasks();
    } 
   
    else {
      console.log("getTask: ", this.role, this.view);
      this.getTasksbyTeam();
    }
    if (this.currentProfile.id && this.role.toLowerCase() !== 'admin'){
      this.getCurrentUsersTasks();
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
  
}


interface priority {
  name: string,
  url: string
}
interface status {
  name: string,
  faclass: string,
  isChecked: boolean
}
