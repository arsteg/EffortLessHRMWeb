import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TasksService } from '../../_services/tasks.service';
import { Toast, ToastrService } from 'ngx-toastr';
import { project } from 'src/app/Project/model/project';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/common/common.service';
import { DatePipe } from '@angular/common';
import { taskComment } from 'src/app/models/task/taskComment';
import { taskAttachments, TaskAttachment, attachments, Task, SubTask, updateSubTask, updateTask } from '../task';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';


@Component({
  providers: [DatePipe],
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  selectedTask: any;
  updateForm: FormGroup;
  projectList: project[] = [];
  tasks: any = [];
  task: any = [];
  subTask: any = [];
  priorityList: priority[] = [{ name: 'Urgent', url: "assets/images/icon-urgent.svg" },
  { name: 'High', url: "assets/images/icon-high.svg" },
  { name: 'Normal', url: "assets/images/icon-normal.svg" }];
  unKnownImage = "assets/images/icon-unknown.svg";
  firstLetter: string;
  taskList: any = [];
  statusList: status[] = [{ name: 'ToDo', faclass: "" },
  { name: 'In Progress', faclass: "" },
  { name: 'Done', faclass: "" },
  { name: 'Closed', faclass: "" },
  { name: 'ACtive', faclass: "" }];

  selectedStatus: string = '';
  selectedPriority: any;
  activeTaskId: string = '';
  searchText = '';
  date = new Date();
  index: number;
  newComment: taskComment;
  comments: taskComment[] = [];
  commentsList: taskComment[] = [];
  fileProperties: any = {};
  taskAttachment: any = [];
  public selectedAttachment: any;
  selectedFiles: File[] = [];
  selectedFile: File[] = [];
  isEditMode: boolean;
  addForm: FormGroup;
  updateSubTasks: FormGroup;
  view = localStorage.getItem('adminView');
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  currentTaskProject: any;
  taskId: string;
  skip = '0';
  next = '10';
  newTask: string= '';
  id: string;
  selectedSubtask: any;

  constructor(private fb: FormBuilder,
    private tasksService: TasksService,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    public commonService: CommonService) {
    this.updateForm = this.fb.group({
      taskName: ['', Validators.required],
      startDate: [this.tasks?.data?.task?.startDate, Validators.required],
      endDate: [this.tasks?.data?.task?.endDate, Validators.required],
      description: [this.tasks?.data?.task?.description, Validators.required],
      comment: [this.tasks?.data?.task?.comment, Validators.required],
      priority: [this.tasks?.data?.task?.priority, Validators.required],
      TaskUser: ['', Validators.required],
      project: [this.tasks?.data?.task?.project?.id, Validators.required],
      status: [this.tasks?.data?.task?.status, Validators.required]

    });
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
    this.updateSubTasks = this.fb.group({
      taskName: [this.selectedSubtask?.taskName],
      title: [this.selectedSubtask?.title],
      priority: [this.selectedSubtask?.priority],
      status: [this.selectedSubtask?.status],
      description: [this.selectedSubtask?.description],
      project: [this.currentTaskProject.project.id]
    })
  }

  ngOnInit(): void {

    this.getprojects();
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.tasksService.getTaskById(this.id).subscribe(task => {
        this.tasks = task;
        this.task = task.data.newTaskUserList;
        this.currentTaskProject = this.tasks.data.task;
      });

    }
    this.firstLetter = this.commonService.firstletter;

    const storedActiveTaskId = localStorage.getItem('activeTaskId');
    this.activeTaskId = storedActiveTaskId;
    this.getTaskAttachments();

    this.tasksService.getSubTask(this.id).subscribe((response: any) => {
      this.subTask = response && response.data && response.data['taskList']
   
    })
    this.getTasks();
  }
  getCurrentUserTasks() {
    this.tasksService.getTaskByUser(this.currentUser.id).subscribe(response => {
      this.taskList = response && response.data && response.data['taskList'];
      this.taskList = this.taskList.filter(taskList => taskList !== null);
    })
  }
  getTasks() {
    this.view = localStorage.getItem('adminView');
    if (this.view === 'admin') {
      this.listAllTasks();
    } else {
      this.getCurrentUserTasks()

    }
  }

  onCommentAdd(event: taskComment) {
    this.comments.push(event);
    this.newComment = event;
  }
  onCommentDeleted(commentId: string) {
    this.comments = this.comments.filter(comment => comment.id !== commentId);
  }

 

listAllTasks() {
  this.tasksService.getAllTasks(this.skip, this.next).subscribe((response: any) => {
    this.taskList = response && response.data && response.data['taskList'];
  });
}
  nextPagination() {
    const newSkip = (parseInt(this.skip) + parseInt(this.next)).toString();
    this.skip = newSkip;
    this.listAllTasks();
  }
  previousPagination() {
    const newSkip = (parseInt(this.next) - parseInt(this.skip)).toString();
    this.skip = newSkip;
    this.listAllTasks();
  }

  onTaskChange(taskId: string) {
    this.tasksService.getTaskById(taskId).subscribe((task: any) => {
      this.router.navigate(['/edit-task', taskId]);
      this.tasks = task;
      this.activeTaskId = taskId;
      this.getTaskAttachments();
      localStorage.setItem('activeTaskId', taskId.toString());
    });
  }

  updateTask() {
    const updateTask: updateTask ={
      taskName: this.updateForm.value.taskName,
      description: this.updateForm.value.description, 
      priority: this.currentTaskProject.priority,
      project: this.currentTaskProject.project.id,
      title: this.updateForm.value.taskName,      
      status:  this.currentTaskProject.status
    }
    this.tasksService.updateTask(this.tasks.data.task.id, updateTask).subscribe(response => {
      console.log(response)
      this.ngOnInit();
      this.toast.success('Existing Task Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  getprojects() {
    this.commonService.getProjectList().subscribe(response => {
      this.projectList = response && response.data && response.data['projectList'];
    });
  }

  getTaskPriorityUrl(currentPriority) {
    const priority = this.priorityList.find(x => x.name.toLowerCase() === currentPriority?.toLowerCase());
    return priority?.url ? priority?.url : this.unKnownImage;
  }

  updateTaskPriority(selectedTask: Task, priority: string) {
    const payload = { "priority": priority }
    this.tasks.data.task.priority = priority;
    this.tasksService.updatetaskFlex(this.tasks.data.task.id, payload).subscribe(response => {
      this.toast.success('Task priority updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  updateTaskStatus(selectedTask: Task, status: string) {
    const payload = { "status": status }
    this.tasks.data.task.status = status;
    this.tasksService.updatetaskFlex(this.tasks.data.task.id, payload).subscribe(response => {
      this.toast.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  deleteTask() {
    this.tasksService.deleteTask(this.activeTaskId).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Task Can not be Deleted', 'Error!');
      })
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
    // --------------------------
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
            taskId: this.activeTaskId,
            // comment: null,
            taskAttachments: attachments
          };

          this.tasksService.addTaskAttachment(taskAttachment).subscribe(
            (response) => {
              this.selectedFiles = [];
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

  openDownloadedFile() {
    setTimeout(() => {
      const anchors = document.getElementsByTagName('a');
      for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        if (anchor.getAttribute('download') !== null) {
          anchor.click();
        }
      }
    }, 1000);
  }


  getTaskAttachments(): void {

    this.tasksService.getTaskAttachment(this.activeTaskId).subscribe(result => {
      this.taskAttachment = result.data.newTaskAttachmentList;
    });
  }

  // Define a function to open the modal and set the selectedAttachment variable
  public openTaskAttachmentModal(attachment: any): void {
    this.selectedAttachment = attachment;
  }

  deleteTaskAttachment(taskAttachmentId: string): void {
    this.tasksService.deleteTaskAttachment(taskAttachmentId).subscribe(
      (response) => {
        // remove the attachment from the taskAttachment array
        this.taskAttachment = this.taskAttachment.filter(attachment => attachment.id !== taskAttachmentId);
      },
      (error) => {
        console.error('Error deleting task attachment:', error);
      }
    );
  }
  // Function to convert bytes to kilobytes
  convertBytesToKB(bytes: number): string {
    const kilobytes = bytes / 1024;
    return kilobytes.toFixed(2) + ' KB';
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
 
  onSub(){
    const id: '' = this.currentUser.id
    const newTask: SubTask = {
      _id: '',
      parentTask: this.activeTaskId,
      taskName: this.addForm.value.taskName,
      title: this.addForm.value.taskName,
      estimate: this.addForm.value.estimate,
      startDate: this.addForm.value.startDate,
      endDate: this.addForm.value.endDate,
      description: this.addForm.value.description,
      comment: this.addForm.value.comment,
      isSubTask: false,
      priority: this.addForm.value.priority,
      taskUsers: this.view === 'admin' ? [] : [id],
      status: "ToDo",
      project: this.currentTaskProject.project.id,
      taskAttachments: []
    };
    const taskAttachments: taskAttachments[] = [];
    newTask.taskAttachments = taskAttachments;
    this.tasksService.addTask(newTask).subscribe((response: any) => {
      this.task = response;
      this.newTask = '';
      this.ngOnInit();
      if (taskAttachments) {
        const attachments: attachments[] = [];

        for (let i = 0; i < this.selectedFile.length; i++) {
          const file: File = this.selectedFile[i];
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

            if (i === this.selectedFile.length - 1) {
              const taskAttachment: taskAttachments = {
                taskId: this.task.data.newTask.id,
                taskAttachments: attachments
              };

              this.tasksService.addTaskAttachment(taskAttachment).subscribe((response) => {
                this.taskAttachment = response.data['taskAttachmentList']
                console.log(this.taskAttachment)
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
  
})
  }
  onFileSelects(event) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files.item(i);
        if (file) {
          this.selectedFile.push(file);
        }
      }
    }
  }


 

  deleteSubTask(taskId: string) {
    this.tasksService.deleteTask(taskId).subscribe(
      response => {
        this.ngOnInit();
        this.toast.success('Successfully Deleted!');
      },
      err => {
        this.toast.error('Task Cannot be Deleted', 'Error!');
      }
    );
  }
  // updateSubTask(selectedSubTask, updateForm) {
  //   // let selectedSubTask: any;
  //   console.log(selectedSubTask.id)
  //   console.log(this.subTask.id)
  //   // const updateForm: updateSubTask = {
  //   //   taskName: this.updateSubTasks.value.taskName,
  //   //   title: this.updateSubTasks.value.taskName,
  //   //   priority: this.updateSubTasks.value.priority,
  //   //   status: this.updateSubTasks.value.status,
  //   //   parentTask: this.activeTaskId,
  //   //   description: this.updateSubTasks.value.description,
  //   //    project: this.currentTaskProject.project.id
  //   // }
  //   this.tasksService.updateTask(selectedSubTask.id, updateForm).subscribe(response => {
  //     console.log(response)
  //     this.ngOnInit();
  //     this.toast.success('Existing Task Updated', 'Successfully Updated!')
  //   },
  //     err => {
  //       this.toast.error('Task could not be updated', 'ERROR!')
  //     })
  // }

  updateSubTask(selectedTask: any, updateFormData) {
    // const updateForm : updateTask = {
    //   taskName: this.updateSubTasks.value.taskName,
    //   description: this.updateSubTasks.value.description,
    //   priority: this.updateSubTasks.value.priority,
    //   status: this.updateSubTasks.value.status,
    //   project: this.currentTaskProject.project.id,
    //   title: this.updateSubTasks.value.taskName
    // }

    // Perform the logic for updating the subtask
    console.log(this.updateSubTasks);
    console.log(selectedTask.id)
    this.tasksService.updateTask(selectedTask.id, updateFormData).subscribe(
      (response) => {
        console.log(response);
        this.ngOnInit();
        this.toast.success('Existing Task Updated', 'Successfully Updated!');
      },
      (err) => {
        this.toast.error('Task could not be updated', 'ERROR!');
      }
    );
  }
  
  subTaskDetail(subTask) {
    this.router.navigate(['/SubTask', subTask.id]);

  }
  currentSubtaskId: string;

  onSubtaskIdChanged(subtaskId: string) {
    this.currentSubtaskId = subtaskId;
  }
  updatesubTaskPriority(selectedTask: any, priority: string) {
    const payload = { "priority": priority }
    selectedTask.priority = priority;
    this.tasksService.updatetaskFlex(selectedTask.id, payload).subscribe(response => {
      this.toast.success('Task priority updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
  }
  updatesubTaskStatus(selectedTask: any, status: string) {
    const payload = { "status": status }
    selectedTask.status = status;
    this.tasksService.updatetaskFlex(selectedTask.id, payload).subscribe(response => {
      this.toast.success('Task status updated successfully', 'Success')
    },
      err => {
        this.toast.error('Task could not be updated', 'ERROR!')
      })
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