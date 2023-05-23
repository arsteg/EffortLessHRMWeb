import { Component, OnInit } from '@angular/core';
import { Task, TaskAttachment, attachments, taskAttachments } from './task';
import { TasksService } from '../_services/tasks.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { response } from '../models/response';
import { ToastrService } from 'ngx-toastr';
import { project } from '../Project/model/project';
import { ProjectService } from '../_services/project.service';
import { UserService } from '../_services/users.service';
import { User } from '../models/user';
import { CommonService } from '../common/common.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
  providers: [UserService]
})
export class TasksComponent implements OnInit {
  searchText = '';
  p: number = 1;
  projectList: project[] = [];
  taskList: any;
  tasks: any;
  date = new Date();
  addForm: FormGroup;
  updateForm: FormGroup;
  selectedTask: any;
  allAssignee: any;
  addUserForm: FormGroup;
  firstLetter: string;
  color: string;
  projectId: string;
  taskUserList: any;
  isChecked = true;
  userId: string;
  selectedUser: any;
  selectedUsers = [];
  public sortOrder: string = ''; // 'asc' or 'desc'
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  public allOption: string = "ALL";
  priorityList: priority[] = [{ name: 'Urgent', url: "assets/images/icon-urgent.svg" },
  { name: 'High', url: "assets/images/icon-high.svg" },
  { name: 'Normal', url: "assets/images/icon-normal.svg" }];

  statusList: status[] = [{ name: 'ToDo', faclass: "" },
  { name: 'In Progress', faclass: "" },
  { name: 'Done', faclass: "" },
  { name: 'Closed', faclass: "" }]

  unKnownImage = "assets/images/icon-unknown.svg";

  showPriorityDropdown = false;
  selectedTaskIndex = -1;
  selectedTaskStatusIndex = -1;
  attachments: TaskAttachment[] = [];
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

  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private projectService: ProjectService,
    private tost: ToastrService,
    public commonservice: CommonService,
    private router: Router
  ) {
    this.addForm = this.fb.group({
      taskName: [''],
      title: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.required],
      estimate: [0],
      comment: ['', Validators.required],
      priority: ['', Validators.required],
      TaskUser: ['', Validators.required],
      project: ['', Validators.required],
      taskAttachments: [[]]
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
    this.addUserForm = this.fb.group({
      userName: {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required]
      }
    });
  }

  ngOnInit(): void {
    this.isChecked = true;
    this.listAllTasks();
    this.commonservice.getProjectList().subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
    this.commonservice.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    this.firstLetter = this.commonservice.firstletter;
  }
  navigateToEditPage(task: any) {
    // navigate to the edit page with the task ID as a route parameter
    this.router.navigate(['/edit-task', task.id]);
    localStorage.setItem('activeTaskId', task.id.toString());
  }

  listAllTasks() {
    this.tasksService.getAllTasks().subscribe((response: any) => {
      this.tasks = response && response.data && response.data['taskList'];
    })
  }

  onSubmit() {
    // Create new task object
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
      TaskUser: this.addForm.value.TaskUser,
      status: "Open",
      project: this.addForm.value.project,
      taskAttachments: []
    };
    // Create an array of task attachments with the new task ID
    const taskAttachments: TaskAttachment[] = [];
    newTask.taskAttachments = taskAttachments;

    this.tasksService.addTask(newTask).subscribe(response => {
      this.task = response;
      const newTask = this.task.data.newTask;

      if (taskAttachments) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFiles.length; i++) {
          const file: File = this.selectedFiles[i];
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().split(',')[1];
            const fileSize = file.size; // size of the file in bytes
            const fileType = file.type; // type of the file (e.g. image/png)
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
              // This is the last file, so create the task attachment
              const taskAttachment: taskAttachments = {
                taskId: newTask._id,
                comment: null,
                taskAttachments: attachments
              };

              this.tasksService.addTaskAttachment(taskAttachment).subscribe(
                (response) => {
                  this.ngOnInit();
                },
                (error) => {
                  console.error('Error creating task attachment:', error);
                }
              );
            }
          };
        }

      }
      err => {
        console.log("Error creating task!");
      }
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
      // Remove file from selectedFiles array
      this.selectedFiles.splice(index, 1);
    }
  }


  deleteTask() {
    this.tasksService.deleteTask(this.selectedTask.id).subscribe(response => {

      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
  }

  selectTask(selectedTask) {
    this.selectedTask = selectedTask
  }
  addUserToTask(addUserForm) {
    let selectedUsers = this.addUserForm.get('userName').value;
    let newUsers = selectedUsers.filter(id => !this.taskUserList.find(user => user.user.id === id));
    let task_Users = newUsers.map((id) => { return { user: id } });
    if (task_Users.length > 0) {
      this.tasksService.addUserToTask(this.selectedTask.id, task_Users).subscribe(result => {
        this.ngOnInit();
        this.tost.success('New Member Added', 'Successfully Added!')
      },
        err => {
          this.tost.error('Member Already Exist', 'ERROR!')
        })
    }
    else {
      this.tost.error('All selected users already exist', 'ERROR!')
    }
  }

  getTaskUser(id) {
    this.tasksService.getTaskUsers(id).subscribe(response => {
      this.taskUserList = response && response.data && response.data['taskUserList'];
      this.selectedUser = this.taskUserList.map(user => user.user.id);
    });
  }

  //  Method to Delete assigned User to project
  onModelChange(isChecked, taskUserList) {
    if (isChecked) {
      this.getTaskUser(taskUserList);
    }
    else {
      let index = this.taskUserList.findIndex(user => user.id === taskUserList.id);
      this.tasksService.deleteTaskUser(taskUserList.id).subscribe(response => {
        this.taskUserList.splice(index, 1);

        this.ngOnInit();
        this.isChecked = true;
        this.tost.success(taskUserList.user.firstName.toUpperCase(), 'Successfully Removed!')
      },
        err => {
          this.tost.error(taskUserList.user.firstName.toUpperCase(), 'ERROR! Can not be Removed')
        })
    }
  }

  getTasksByProject() {
    this.tasksService.getTasksByProjectId(this.projectId).subscribe(response => {

      //this.tasks = response && response.da && response.data['taskList'];
    });
  }
  onProjectSelectionChange(project) {
    this.getTasksByProject();
  }

  getTaskByUsers() {
    this.tasksService.getTaskByUser(this.userId).subscribe(response => {
      this.tasks = response && response.data && response.data['taskList'];
    });
  }
  onMemberSelectionChange(project) {
    this.getTaskByUsers();
  }
  getCurrentUserTasks() {
    this.tasksService.getTaskByUser(this.currentUser.id).subscribe(response => {
      this.tasks = response && response.data && response.data['taskList'];
    })
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
    this.newTask.status = 'ToDo'
    this.newTask.title = this.newTask.taskName
    this.tasksService.addTask(this.newTask).subscribe(response => {
      this.task = response;
      this.tasks.push(this.newTask);
      this.newTask = ''
      this.toggleToDoTask();
    }
    )
  }

  addTaskInProgress() {
    this.newTask.status = 'In Progress'
    this.newTask.title = this.newTask.taskName
    this.tasksService.addTask(this.newTask).subscribe(response => {
      this.task = response;
      this.tasks.push(this.newTask);
      this.newTask = ''
      this.toggleInProgressTask();
    }
    )
  }

  addTaskDone() {
    this.newTask.status = 'Done'
    this.newTask.title = this.newTask.taskName
    this.tasksService.addTask(this.newTask).subscribe(response => {
      this.task = response;
      this.tasks.push(this.newTask);
      this.newTask = ''
      this.toggleDoneTask();
    }
    )
  }
  addTaskClosed() {
    this.newTask.status = 'Closed'
    this.newTask.title = this.newTask.taskName
    this.tasksService.addTask(this.newTask).subscribe(response => {
      this.task = response;
      this.tasks.push(this.newTask);
      this.newTask = ''
      this.toggleClosedTask();
    }
    )
  }
  setPriority(priority: any) {
    this.newTask.priority = priority;
  }

  removePriority() {
    this.newTask.priority = null;
  }
}


interface priority {
  name: string,
  url: string
}
interface status {
  name: string,
  faclass: string
}
