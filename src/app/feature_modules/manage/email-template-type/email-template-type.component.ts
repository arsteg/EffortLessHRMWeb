import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmailTemplateTypeService } from 'src/app/_services/emailtemplatetype.service';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmailTemplateType } from 'src/app/models/EmailTemplateType';

@Component({
  selector: 'app-email-template-type',
  templateUrl: './email-template-type.component.html',
  styleUrls: ['./email-template-type.component.css']
})
export class EmailTemplateTypeComponent implements OnInit {
  emailTemplateTypeList: EmailTemplateType[] = [];
  form: FormGroup;
  updateForm: FormGroup;
  selectedEmailTemplateType: EmailTemplateType | null = null;
  searchText: string = "";
  isSubmitting: boolean = false;
  dialogRef: MatDialogRef<any> | null = null;

  columns: TableColumn[] = [
    { key: 'emailTemplateTypeId', name: 'Type ID' },
    { key: 'name', name: 'Name' },
    {
      key: 'action',
      name: 'Actions',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(
    private emailTemplateTypeService: EmailTemplateTypeService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.form = this.fb.group({
      emailTemplateTypeId: ['', [Validators.required, Validators.min(1)]],
      name: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.updateForm = this.fb.group({
      emailTemplateTypeId: [{value: '', disabled: true}],
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.getEmailTemplateTypeList();
  }

  getEmailTemplateTypeList(): void {
    this.emailTemplateTypeService.getAllEmailTemplateTypes().subscribe({
      next: (data: EmailTemplateType[]) => {
        this.emailTemplateTypeList = data;
        console.log('Email Template Types:', data);
      },
      error: (error) => {
        this.toast.error('Error fetching email template types', 'Error');
        console.error('Error fetching email template types:', error);
      }
    });
  }

  openDialog(emailTemplateType: EmailTemplateType, updateDialog: any): void {
    this.selectedEmailTemplateType = emailTemplateType;
    this.updateForm.patchValue({
      emailTemplateTypeId: emailTemplateType.emailTemplateTypeId,
      name: emailTemplateType.name
    });

    this.dialogRef = this.dialog.open(updateDialog, {
      width: '50%',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.updateForm.reset();
      this.selectedEmailTemplateType = null;
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    // Check for duplicate Type ID
    const typeIdExists = this.emailTemplateTypeList.some(
      type => type.emailTemplateTypeId === this.form.value.emailTemplateTypeId
    );

    if (typeIdExists) {
      this.toast.error('Type ID already exists. Please use a different Type ID.', 'Error');
      return;
    }

    this.isSubmitting = true;
    const newEmailTemplateType: EmailTemplateType = {
      emailTemplateTypeId: this.form.value.emailTemplateTypeId,
      name: this.form.value.name
    };

    this.emailTemplateTypeService.addEmailTemplateType(newEmailTemplateType).subscribe({
      next: (data) => {
        this.toast.success('Email template type added successfully', 'Success');
        this.form.reset();
        this.getEmailTemplateTypeList();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || error.message || 'Error adding email template type';
        this.toast.error(errorMessage, 'Error');
        console.error('Error adding email template type:', error);
      }
    });
  }

  onUpdate(): void {
    if (this.updateForm.invalid || this.isSubmitting || !this.selectedEmailTemplateType) {
      return;
    }

    this.isSubmitting = true;
    const updatedEmailTemplateType: EmailTemplateType = {
      ...this.selectedEmailTemplateType,
      name: this.updateForm.value.name
    };

    this.emailTemplateTypeService.updateEmailTemplateType(
      this.selectedEmailTemplateType._id!,
      updatedEmailTemplateType
    ).subscribe({
      next: (data) => {
        this.toast.success('Email template type updated successfully', 'Success');
        if (this.dialogRef) {
          this.dialogRef.close(true);
        }
        this.getEmailTemplateTypeList();
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || error.message || 'Error updating email template type';
        this.toast.error(errorMessage, 'Error');
        console.error('Error updating email template type:', error);
      }
    });
  }

  handleAction(event: any, model: any): void {
    if (event.action.label === 'Edit') {
      this.selectedEmailTemplateType = event.row;
      this.openDialog(event.row, model);
    } else if (event.action.label === 'Delete') {
      this.deleteDialog(event.row._id);
    }
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteEmailTemplateType(id);
      }
    });
  }

  deleteEmailTemplateType(id: string): void {
    this.emailTemplateTypeService.deleteEmailTemplateType(id).subscribe({
      next: () => {
        this.toast.success('Email template type deleted successfully', 'Success');
        this.getEmailTemplateTypeList();
      },
      error: (error) => {
        const errorMessage = error.error?.message || error.error?.data || error.message || 'Error deleting email template type';
        this.toast.error(errorMessage, 'Error');
        console.error('Error deleting email template type:', error);
      }
    });
  }
}
