import { Component, OnInit } from '@angular/core';
import { Task, taskAttachment, taskAttachments } from './task';
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
  attachments: taskAttachments[]=[];
attachment : taskAttachment[] =[];
task: any
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
      taskAttachments: [this.attachments]
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
  }

  listAllTasks() {
    this.tasksService.getAllTasks().subscribe((response: any) => {
      this.tasks = response && response.data && response.data['taskList'];
    })
  }

  // addTask(form) {
  //   form.taskName = form.description;
  //   this.tasksService.addTask(form).subscribe(response => {
  //     this.listAllTasks();
  //     this.toast.success('New Task', 'Successfully Added!')
  //   },
  //     err => {
  //       this.toast.error('Task Can not be Added', 'Error!')
  //     })
  // }
  // addTask(form) {
  //   // Create new task object
  //   const newTask: Task = {
  //     _id: '',
  //     taskName: form.title,
  //     title: form.title,
  //     estimate: form.estimate,
  //     startDate: form.startDate,
  //     endDate: form.endDate,
  //     description: form.description,
  //     comment: form.comment,
  //     isSubTask: false,
  //     priority: form.priority,
  //     TaskUser: form.TaskUser,
  //     status: "Open",
  //     project: form.project,
  //     taskAttachments: []
  //   };
  
  //   // Add new task to database
  //   this.tasksService.addTask(newTask).subscribe(response => {
  //     // Get the ID of the new task
      
  //     this.task = response;
  //     const newTaskId = this.task.data.newTask.id;
  
  //     // Create an array of task attachments with the new task ID
  //     const taskAttachments = [];
  //     if (form.attachments && form.attachments.length > 0) {
  //       for (const attachment of form.attachments) {
  //         taskAttachments.push({
  //           attachmentType: attachment.attachmentType,
  //           attachmentName: attachment.attachmentName,
  //           attachmentSize: attachment.attachmentSize,
  //           file: attachment.file,
  //           task: newTaskId,
  //           comment: ""
  //         });
  //       }
  //     }
  
  //     // Add the task attachments to the new task
  //     newTask.taskAttachments = taskAttachments;
  //     console.log(taskAttachments);
  
  //     // Add the task attachments to the database
  //     if (taskAttachments.length > 0) {
  //       this.tasksService.addTaskAttachment(taskAttachments).subscribe(attachmentResponse => {
  //         console.log("New task Id : ", taskAttachments)
  //         this.listAllTasks();
  //         this.toast.success('New Task', 'Successfully Added!')
  //       },
  //       err => {
  //         this.toast.error('Task Attachment Cannot be Added', 'Error!')
  //       });
  //     } else {
  //       this.listAllTasks();
  //       this.toast.success('New Task', 'Successfully Added!')
  //     }
  //   },
  //   err => {
  //     this.toast.error('Task Cannot be Added', 'Error!')
  //   });
  // }
  
// Define a variable to hold the selected files
selectedFiles: any[] = [];

addTask(form) {
  // Create new task object
  const newTask: Task = {
    _id: '',
    taskName: form.title,
    title: form.title,
    estimate: form.estimate,
    startDate: form.startDate,
    endDate: form.endDate,
    description: form.description,
    comment: form.comment,
    isSubTask: false,
    priority: form.priority,
    TaskUser: form.TaskUser,
    status: "Open",
    project: form.project,
    taskAttachments: []
  };

  // Add new task to database
  this.tasksService.addTask(newTask).subscribe(response => {
    // Get the ID of the new task
    this.task = response;
    const newTaskId = this.task.data.newTask.id;

    // Create an array of task attachments with the new task ID
    const taskAttachments = [];
    if (form.attachments && form.attachments.length > 0) {
      for (const attachment of form.attachments) {
        taskAttachments.push({
          attachmentType: attachment.attachmentType,
          attachmentName: attachment.attachmentName,
          attachmentSize: attachment.attachmentSize,
          file: attachment.file,
          task: newTaskId,
          comment: ""
        });

        // Add the selected files to the selectedFiles variable
        this.selectedFiles.push(attachment.file.name);
      }
    }

    // Add the task attachments to the new task
    newTask.taskAttachments = taskAttachments;
    console.log(taskAttachments);

    // Add the task attachments to the database
    if (taskAttachments.length > 0) {
      this.tasksService.addTaskAttachment(taskAttachments).subscribe(attachmentResponse => {
        console.log("New task Id : ", taskAttachments)
        this.listAllTasks();
        this.toast.success('New Task', 'Successfully Added!')
      },
      err => {
        this.toast.error('Task Attachment Cannot be Added', 'Error!')
      });
    } else {
      this.listAllTasks();
      this.toast.success('New Task', 'Successfully Added!')
    }
  },
  err => {
    this.toast.error('Task Cannot be Added', 'Error!')
  });
}

 
  
  

  // onFileSelected(event) {
  //   const files = event.target.files;
  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];
  //     const reader = new FileReader();
  //     reader.onload = (e: any) => {
  //       const attachment: TaskAttachment = {
  //         attachmentType: file.type,
  //         attachmentName: file.name,
  //         attachmentSize: file.size.toString(),
  //         filePath: e.target.result
  //       };
  //       this.attachmentsList.push(attachment);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  deleteTask() {
    this.tasksService.deleteTask(this.selectedTask.id).subscribe(response => {

      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
  }

  updateTask(updateForm) {
    updateForm.taskName = updateForm.description;
    this.tasksService.updateTask(this.selectedTask._id, updateForm).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
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
}


interface priority {
  name: string,
  url: string
}
interface status {
  name: string,
  faclass: string
}
