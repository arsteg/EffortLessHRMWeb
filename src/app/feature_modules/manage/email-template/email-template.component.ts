import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmailtemplateService } from 'src/app/_services/emailtemplate.service';
import { EmailTemplateTypeService } from 'src/app/_services/emailtemplatetype.service';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EmailTemplateType } from 'src/app/models/EmailTemplateType';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css']
})
export class EmailTemplateComponent implements OnInit {
  emailList: any = [];
  emailTemplateTypes: EmailTemplateType[] = [];
  form: FormGroup;
  updateForm: FormGroup;
  emailmodel: boolean = false;
  emailupdatemodel: boolean = false;
  selectedEmail: any = [];
  searchText: string = "";
  selectedOption: string;
  editorContent: string = '';
  dialogRef: MatDialogRef<any> | null = null;

  isSubmitting: boolean = false;
  dropdownOptions = [
    { label: 'firstName', value: 'option1' },
    { label: 'lastName', value: 'option2' },
    { label: 'date', value: 'option3' },
    { label: 'task', value: 'option4' },
    { label: 'project', value: 'option4' },
    { label: 'company', value: 'option4' },
    { label: 'taskStartDate', value: 'option4' },
    { label: 'taskEndDate', value: 'option4' },
    { label: 'url', value: 'option4' },
    { label: 'taskPriority', value: 'option4' },
    { label: 'description', value: 'option4' }
  ];

  forms: any;
  showEditor = false;
  isFormLoaded = false;
  
  columns: TableColumn[] = [
    { key: 'templateTypeName', name: this.translate.instant('manage.emails.templateType') },
    { key: 'Name', name: this.translate.instant('manage.emails.templateName') },
    { key: 'subject', name: this.translate.instant('manage.emails.subject') },
    {
      key: 'contentData',
      isHtml: true,
      name: this.translate.instant('manage.emails.content')
    },
    {
      key: 'action',
      name: this.translate.instant('manage.emails.actions'),
      isAction: true,
      options: [
        { label: this.translate.instant('manage.emails.edit'), icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: this.translate.instant('manage.emails.delete'), icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];
  
  constructor(
    private emailservice: EmailtemplateService,
    private emailTemplateTypeService: EmailTemplateTypeService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private dialog: MatDialog,
    private toast: ToastrService) {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      subject: ['', Validators.required],
      templateType: ['', Validators.required],
      contentData: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      Name: [{value:'', disabled: true}],
      subject: ['', Validators.required],
      templateType: ['', Validators.required],
      contentData: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.isFormLoaded = true;
    this.getEmailList();
    this.getEmailTemplateTypes();
    this.dropdownOptions;
    setTimeout(() => {
      this.isFormLoaded = true;
    }, 1);

  }

  getEmailTemplateTypes(): void {
    this.emailTemplateTypeService.getAllEmailTemplateTypes().subscribe({
      next: (data: EmailTemplateType[]) => {
        this.emailTemplateTypes = data;
      },
      error: (error) => {
        console.error('Error fetching email template types:', error);
        this.toast.error(
          this.translate.instant('manage.emailTemplateType.fetchError') || 'Error fetching email template types',
          this.translate.instant('common.error') || 'Error'
        );
      }
    });
  }

  getTemplateTypeName(templateTypeId: number): string {
    const templateType = this.emailTemplateTypes.find(t => t.emailTemplateTypeId === templateTypeId);
    return templateType ? templateType.name : templateTypeId?.toString() || '';
  }
  ngOnDestroy(): void {
  }

  onDropdownChange(event: any) {
    this.selectedOption = event.target.value;
    this.updateEditorContent();
  }
  @ViewChild('editor') editor: any;
  updateEditorContent() {
    const quillEditor = this.editor.quillEditor;
    const range = quillEditor.getSelection();
    const position = range ? range.index : this.editorContent.length;
    const selectedText = '{' + this.selectedOption + '}';

    quillEditor.insertText(position, selectedText);
  }
 
  getEmailList() {
    this.emailList = [];
    this.emailservice.getAllEmails().subscribe((response: any) => {
      this.emailList = response.map((email: any) => ({
        ...email,
        templateTypeName: this.getTemplateTypeName(email.templateType)
      }));
    });
  }
  closemodel() {
    this.emailmodel = false;
  }
  addEmail(form) {
    this.isSubmitting = true;
    this.form.markAllAsTouched();

    // Prevent submission if form is invalid
    if (this.form.invalid) {
      this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error'));
   
      this.isSubmitting = false;
      return;
    }

    this.emailservice.addEmail(form).subscribe((response: any) => {
      if (response != null && response != 0) {
        this.toast.success(this.translate.instant('manage.email-template.email_template_added'), this.translate.instant('common.success'));     
        this.getEmailList();
        this.form.reset();
      }
      else {
        this.toast.success(this.translate.instant('manage.email-template.email_template_add_fail'), this.translate.instant('common.error'));     
        }
    })
  }

  deleteEmail(id: any) {
    this.emailservice.deleteEmail(id).subscribe((response: any) => {
      this.ngOnInit();
      this.toast.success(this.translate.instant('manage.email-template.email_template_deleted'), this.translate.instant('common.success'));     
    },
      err => {
        const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.email-template.email_template_delete_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
      }
    )
  }
  onUpdate(event: any) {
    this.selectedOption = event.target.value;
    this.updateEditor();
  }

  updateEditor() {
    this.selectedEmail.contentData = this.selectedEmail.contentData + ' {' + this.selectedOption + '}';
  }
  updateEmails() {
    this.emailupdatemodel = true;
  }
  updateEmail(updateForm) {
    this.form.markAllAsTouched();

    // Prevent submission if form is invalid
    if (this.updateForm.invalid) {
      this.toast.error(this.translate.instant('common.missing_required_Field'), this.translate.instant('common.validation_error')); 
      return;
    }

    this.emailservice.updateEmail(this.selectedEmail._id, updateForm)
      .subscribe(
        response => {
          this.toast.success(this.translate.instant('manage.email-template.email_template_updated'), this.translate.instant('common.success'));
          //this.ngOnInit();
          this.dialogRef.close(true);
          this.getEmailList();
        },
        err => {
          const errorMessage = err?.error?.message || err?.message || err 
        || this.translate.instant('manage.email-template.email_template_update_fail')
        ;
        this.toast.error(errorMessage, 'Error!'); 
        })
  }

  handleAction(event: any, model: any) {
    if (event.action.label === this.translate.instant('manage.emails.edit')) {
      this.selectedEmail = event.row;
      this.openDialog(model);
    } 
    if (event.action.label === this.translate.instant('manage.emails.delete')) {
      this.deleteDialog(event.row._id);
    }
  }

  openDialog(updatedialog: any): void {
    this.updateForm.patchValue({
      Name: this.selectedEmail.Name,
      subject: this.selectedEmail.subject,
      templateType: this.selectedEmail.templateType,
      contentData: this.selectedEmail.contentData
    });

    this.dialogRef = this.dialog.open(updatedialog, {
      width: '50%',
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.updateForm.reset();
      this.selectedEmail = null;
    });
  }

  deleteDialog(id: string): void {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'delete') {
          this.deleteEmail(id);
        }
        err => {
          this.toast.error('Can not be Deleted', 'Error!')
        }
      });
    }
}
