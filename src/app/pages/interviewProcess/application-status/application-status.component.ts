import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { applicationStatus } from 'src/app/models/interviewProcess/applicationStatus';
import { FormBuilder, FormGroup, Validators,FormsModule,ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ToastrService } from 'ngx-toastr';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { SharedModule } from 'src/app/shared/shared.Module';

@Component({
  selector: 'app-application-status',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './application-status.component.html',
  styleUrl: './application-status.component.css'
})
export class ApplicationStatusComponent implements OnInit {
  statusList: applicationStatus[] = [];
  filteredList: applicationStatus[] = [];
  applicationStatusForm: FormGroup;
  isEdit = false;
  selectedStatus: applicationStatus;
  p = 1;

  searchText: string = '';

  constructor(private fb: FormBuilder, private interviewProcessService: InterviewProcessService, private toast: ToastrService) { }

  ngOnInit(): void {
    this.initTagForm();
    this.getApplicationStatusList();
  }

  initTagForm() {
    this.applicationStatusForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  getApplicationStatusList() {
    this.statusList = [
    ];
    this.interviewProcessService.getAllApplicationStatus().subscribe((response: any) => {
      this.statusList = response && response.data;
      this.filteredList = this.statusList;
    })
  }

  async addApplicationStatus() {
    try {
      await this.interviewProcessService.addApplicationStatus(this.applicationStatusForm.value).toPromise();
      this.toast.success('Application Status added successfully!');
      this.getApplicationStatusList();
    } catch (err) {
      this.toast.error('Error adding status', 'Error!');
    }
  }


  editStatus(status: applicationStatus) {
    this.isEdit = true;
    this.selectedStatus = status;
    this.applicationStatusForm.patchValue({
      name: status.name
    });
  }

  async updateStatus() {
    try {
      const updatedStatus = this.statusList.find(status => status._id === this.selectedStatus._id);
      updatedStatus.name = this.applicationStatusForm.value.name;
      const response = await this.interviewProcessService.updateApplicationStatus(updatedStatus).toPromise();
      this.toast.success('Status updated successfully!');
      this.getApplicationStatusList();
      this.isEdit = false;
    } catch (err) {
      this.toast.error('Error updating status', 'Error!');
    }
  }
  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }

  deleteApplicationStatus(status: applicationStatus) {
    try {
      const result = this.confirmAction();
      if (result) {
        this.interviewProcessService.deleteApplicationStatus(status._id).subscribe((response: any) => {
          this.toast.success('Application status has been deleted successfully!')
          this.getApplicationStatusList();
        })
      }
    }
    catch (err) {
      this.toast.error('Error deleting tag', 'Error!');
    }
  }

  filteredStatusList(searchControl) {
    const searchQuery = searchControl.value?.toLowerCase();
    this.filteredList = this.statusList.filter(item => item .name?.toLowerCase().includes(searchQuery));
  }

  onTagEdittFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }
}
