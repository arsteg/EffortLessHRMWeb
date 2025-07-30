import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Observable, first, tap } from 'rxjs';
import { ManualTimeRequestService } from 'src/app/_services/manualTimeRequest.Service';
import { UtilsService } from 'src/app/_services/utils.service';
import { CommonService } from 'src/app/_services/common.Service';
import { TasksService } from 'src/app/_services/tasks.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionVisibility } from 'src/app/models/table-column';

@Component({
  selector: 'app-request-manual-time',
  templateUrl: './request-manual-time.component.html',
  styleUrls: ['./request-manual-time.component.css']
})
export class RequestManualTimeComponent implements OnInit {
  fromDate: any;
  toDate: any;
  reason: string = '';
  managers: { id: string, name: string }[] = [];
  projects: { id: string, projectName: string }[] = [];
  tasks: { _id: string, taskName: string }[] = [];
  today: string = new Date().toISOString().split('T')[0];
  id: string;
  projectId: string;
  addRequestForm: FormGroup;
  searchText: string = "";
  p: number = 1;
  manualTimeRequests: any;
  changeMode = 'Add';
  selectedRequest: any;
  selectedProject: string = 'undefined';
  selectedManager: string = 'undefined';
  selectedTask: string = 'undefined';
  public sortOrder: string = '';
  firstLetter: string;
  color: string;
  dateMismatchError: boolean = false;
  filteredManualTimeRequests: any[] = [];
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit: boolean = false;
  view = localStorage.getItem('adminView');
  dialogRef: MatDialogRef<any>;
  @ViewChild('requestModal') requestModal: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  allData: any[] = [];

  // Define columns for hrm-table
  columns = [
    {
      key: 'date',
      name: 'Date',
      valueFn: (row: any) => new Date(row.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    },
    {
      key: 'projectName',
      name: 'Project',
    },
    {
      key: 'manager',
      name: 'Manager',
      isHtml: true,      
      valueFn: (row: any) => `
        <div class="d-flex"> <span class="rounded-circle bg-primary text-white fs-5 avatar">${row?.manager?.firstName?.slice(0, 1)?.toUpperCase()}</span></div>`
    },
    {
      key: 'task',
      name: 'Task',
      valueFn: (row: any) => row?.task?.taskName
    },
    {
      key: 'fromDate',
      name: 'From Date',
      valueFn: (row: any) => new Date(row.fromDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    {
      key: 'toDate',
      name: 'To Date',
      valueFn: (row: any) => new Date(row.toDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    {
      key: 'reason',
      name: 'Reason',
    },
    {
      key: 'status',
      name: 'Status',
      icons: [
        { value: 'approved', name: 'check', class: 'text-success' },
        { value: 'rejected', name: 'close', class: 'text-danger' },
        { value: 'pending', name: 'schedule', class: 'text-primary' }
      ]
    },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Edit', visibility: ActionVisibility.LABEL, icon: 'edit', hideCondition: (row: any) => row.status !== 'pending'  },
        { label: 'Delete', visibility: ActionVisibility.LABEL, icon: 'delete' }
      ]
    }
  ];

  constructor(private formBuilder: FormBuilder,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private toastService: ToastrService,
    private manualTimeRequestService: ManualTimeRequestService,
    private utilsService: UtilsService,
    public commonservice: CommonService,
    public taskService: TasksService) {

    this.addRequestForm = this.formBuilder.group({
      manager: ['', Validators.required],
      project: ['', Validators.required],
      task: ['', Validators.required],
      fromDate: ['', [Validators.required, this.validateStartDate]],
      toDate: ['', [Validators.required, this.validateEndDate]],
      reason: ['', Validators.required]
    },
      (formGroup: FormGroup) => {
        const fromDate = formGroup.controls['fromDate'].value;
        const toDate = formGroup.controls['toDate'].value;
        return fromDate <= toDate ? null : { 'Invalid Dates': true };
      }
    );
    this.fromDate = new Date().toString().slice(0, 15);
    this.toDate = new Date();
    this.toDate.setHours(23, 59, 59, 999);
  }

  ngOnInit(): void {
    this.firstLetter = this.commonservice.firstletter;
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.id = currentUser?.id;
    this.authenticationService.currentUserValue.id
    this.authenticationService.getUserManagers(this.id).pipe(first())
      .subscribe((res: any) => {
        res.data.forEach(element => {
          this.managers.push(element);
        });
      }, err => { });

    this.authenticationService.getUserProjects(this.id).pipe(first())
      .subscribe((res: any) => {
        res.data.forEach(p => {
          if (p) {
            this.projects.push({ id: p?.id, projectName: p?.projectName });
          }
        });
      }, err => { });

    this.fetchManualTimeRequests();
  }

  toggleView() {
    this.view = this.view === 'user' ? 'admin' : 'user';
  }

  onChange(newId: number) {
    console.log(`Selected item with id: ${newId}`);
  }

  onProjectChange(event): void {
    const projectId = event.value;
    if (projectId) {
      this.getUserTaskListByProject(projectId).subscribe();
    } else {
      this.tasks = [];
    }
  }

  getUserTaskListByProject(projectId: string): Observable<any> {
    return this.authenticationService.getUserTaskListByProject(this.id, projectId, '', '')
      .pipe(tap(res => {
        this.tasks = res && res['taskList'];
      }));
  }

  openModal(template,  width="50%") {
    this.dialogRef = this.dialog.open(template, {
      width: width,
      disableClose: true
    })
    this.dialogRef.afterClosed().subscribe((result) => {
      
    });
  }

  validateStartDate(control: FormControl) {
    const fromDate = control.value;
    const toDate = control.parent?.get('toDate').value;
    if (toDate && fromDate && fromDate > toDate) {
      return { 'endDateBeforeStartDate': true };
    }
    return null;
  }

  validateEndDate(control: FormControl) {
    const fromDate = control.parent?.get('fromDate').value;
    const toDate = control.value;
    if (fromDate && toDate && fromDate > toDate) {
      return { 'endDateBeforeStartDate': true };
    }
    return null;
  }


  onSubmit() {
    var currentUser = JSON.parse(localStorage.getItem('currentUser'));

    let request = {
      date: new Date().toString().slice(0, 15),
      manager: this.addRequestForm.value.manager,
      project: this.addRequestForm.value.project,
      task: this.addRequestForm.value.task,
      reason: this.addRequestForm.value.reason,
      user: currentUser?.id,
      requestId: this.selectedRequest?._id,
      fromDate: this.utilsService.convertToUTC(this.addRequestForm.value.fromDate),
      toDate: this.utilsService.convertToUTC(this.addRequestForm.value.toDate)
    }

    const fromDate = new Date(this.addRequestForm.value.fromDate).toLocaleDateString('en-GB');
    const toDate = new Date(this.addRequestForm.value.toDate).toLocaleDateString('en-GB');

    if (fromDate !== toDate) {
      this.dateMismatchError = true;
      return;
    } else {
      this.dateMismatchError = false;
    }

    if (this.changeMode == 'Add') {
      this.manualTimeRequestService.addManualTimeRequest(request).subscribe((res: any) => {
        setTimeout(() => {
          this.toastService.success("Manual time request created successfully", "success");
          this.addRequestForm.reset();
          this.fetchManualTimeRequests();
          this.dialogRef.close();
        }, 30);
      }, err => {
        this.toastService.error(err.message, "Error")
      });
    } else {
      request.requestId = this.selectedRequest._id;
      console.log("selectedRequest..........update", this.selectedRequest._id);
      this.manualTimeRequestService.updateManualTimeRequest(request).subscribe((res: any) => {
        this.changeMode = 'Add';
        this.toastService.success("Manual time request updated successfully", "success");
        this.addRequestForm.reset();
        this.fetchManualTimeRequests();
        this.dialogRef.close();
      }, err => {
        this.toastService.error(err.message, "Error")
      });
    }
  }

  getColor(char: string): string {
    switch (char) {
      case 'A':
        return 'A';
      case 'B':
        return 'B';
      case 'C':
        return 'C';
      case 'D':
        return 'D';
      case 'E':
        return 'E';
      case 'R':
        return 'R';
      default:
        return 'defaults';
    }
  }

  deleteRequest() {
    this.manualTimeRequestService.DeleteManualTimeRequest(this.selectedRequest._id).pipe(first())
      .subscribe((res: any) => {
        this.toastService.success("Manual time request has been deleted successfully!", "success");
        this.fetchManualTimeRequests();
        this.dialogRef.close();
      }, err => {
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchManualTimeRequests();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.fetchManualTimeRequests();
  }

  fetchManualTimeRequests() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.manualTimeRequestService.getManualTimeRequestsByUser(this.id, pagination).subscribe((res: any) => {
      const data = res.data;
      this.transformRecords(data);
      this.totalRecords = res.total;
    });
  }

  transformRecords(rawRecords: any) {
    this.manualTimeRequests = rawRecords.map(record => ({
      ...record,
      projectName: record.project.projectName,
      manager: record.manager,
      task: record?.task
    }));
    this.filteredManualTimeRequests = [...this.manualTimeRequests];
    this.totalRecords = this.filteredManualTimeRequests.length;
    this.allData = this.filteredManualTimeRequests;
  }

  filterRecords() {
    const searchWords = this.searchText.toLowerCase().split(' ').filter(word => word);

    this.filteredManualTimeRequests = this.manualTimeRequests.filter(record => {
      return searchWords.every(word => {
        return Object.keys(record).some(key => {
          if (typeof record[key] === 'string') {
            return record[key].toLowerCase().includes(word);
          } else if (typeof record[key] === 'object' && record[key] !== null) {
            return Object.keys(record[key]).some(subKey => {
              if (typeof record[key][subKey] === 'string') {
                return record[key][subKey].toLowerCase().includes(word);
              }
              return false;
            });
          }
          return false;
        });
      });
    });
    this.totalRecords = this.filteredManualTimeRequests.length;
    this.allData = this.filteredManualTimeRequests;
  }

  clearselectedRequest() {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    this.addRequestForm.reset();
    this.addRequestForm.patchValue({
      project: undefined,
      manager: undefined,
      task: undefined,
      fromDate: localISOTime,
      toDate: localISOTime,
      reason: ''
    });
    this.tasks = [];
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }


  setUpdateMode(record): void {
    console.log(record)
    this.getUserTaskListByProject(record.project.id).subscribe(() => {
      const formattedStartDate = moment(record.fromDate).format('YYYY-MM-DDTHH:mm');
      const formattedEndDate = moment(record.toDate).format('YYYY-MM-DDTHH:mm');
      this.addRequestForm.patchValue({
        manager: record.manager.id,
        project: record.project.id,
        fromDate: formattedStartDate,
        toDate: formattedEndDate,
        reason: record.reason,
        task: record.task.id
      });
      this.selectedTask = record.task.id;
      console.log(this.selectedTask);
      console.log(this.addRequestForm.value);
    });
  }

  getManualById() {
    console.log(this.selectedRequest);
    this.setUpdateMode(this.selectedRequest);
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onActionClick(event: any) {
    const { action, row } = event;
    this.selectedRequest = row;
    if (action.label === 'Edit') {
      this.setUpdateMode(row);
      this.changeMode = 'Update';
      this.isEdit = true;
      this.openModal(this.requestModal, '50%');
    } else if (action.label === 'Delete') {
      this.openModal(this.deleteModal, '300px');
    }
  }

  onPageChangev1(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.fetchManualTimeRequests();
  }

  // onSearchChange(searchText: string) {
  //   this.searchText = searchText;
  //   this.currentPage = 1;
  //   this.fetchManualTimeRequests();
  // }

  onSearchChange(event) {
    this.filteredManualTimeRequests = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    }
    );
  }

  onSortChange(event: any) {
    const sorted = this.allData.slice().sort((a: any, b: any) => {
      var valueA = this.getNestedValue(a, event.active);
      var valueB = this.getNestedValue(b, event.active);

      valueA = valueA ?? '';
      valueB = valueB ?? '';

      if (valueA < valueB) return event.direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return event.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredManualTimeRequests = sorted;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj);
  }
}
