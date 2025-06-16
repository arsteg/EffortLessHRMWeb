import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { EmailtemplateService } from 'src/app/_services/emailtemplate.service';
import { template } from 'src/app/models/documents/documents';
import { DocumentsService } from 'src/app/_services/documents.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';


@Component({
  selector: 'app-document-template',
  templateUrl: './documentTemplate.component.html',
  styleUrls: ['./documentTemplate.component.css']
})
export class DocumentTemplateComponent implements OnInit {
  templatesList: template[] = [];
  addDocumentTemplateForm: FormGroup;
  updateForm: FormGroup;
  emailmodel: boolean = false;
  emailupdatemodel: boolean = false;
  selectedTemplate: template;
  searchText: string = "";
  selectedOption: string;
  editorContent: string = '';
  @ViewChild('editor') editor: any;
  isEditMode = false;
  columns: TableColumn[] = [
    { key: 'name', name: 'Name' },
    { key: 'content', name: 'content', isHtml: true },
    { key: 'active', name: 'active' },
    {
      key: 'action',
      name: 'Action',
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'text-danger' },
      ]
    }
  ]

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

  constructor(private documentsService: DocumentsService, private fb: FormBuilder,
    private toast: ToastrService, private dialog: MatDialog) {
    this.addDocumentTemplateForm = this.fb.group({
      name: ['', Validators.required],
      content: [''],
      active: [false]
    });

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      content: [''],
      active: ['']
    });
  }

  ngOnInit(): void {
    this.isFormLoaded = true;
    this.getTemplates();
    this.dropdownOptions;
    setTimeout(() => {
      this.isFormLoaded = true;
    }, 1);

  }
  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        this.editTemplate(event.row)
        break;
      case 'Delete':
        this.openDialog(event.row._id)
        break;
    }
  }
  ngOnDestroy(): void {
  }

  editTemplate(data: any) {
    this.isEditMode = true;
    if (data && data._id) {
      this.selectedTemplate = data;
      this.addDocumentTemplateForm.patchValue({
        name: data.name,
        isActive: data.active,
        content: data.content
      });
    }
  }
  onCancel() {
    this.isEditMode = false;
    this.addDocumentTemplateForm.reset();
  }
  onDropdownChange(event: any) {
    this.selectedOption = event.target.value;
    this.updateEditorContent();
  }

  updateEditorContent() {
    const quillEditor = this.editor.quillEditor;
    const range = quillEditor.getSelection();
    const position = range ? range.index : this.editorContent.length;
    const selectedText = '{' + this.selectedOption + '}';

    quillEditor.insertText(position, selectedText);
  }

  getTemplates() {
    this.templatesList = [
    ];
    this.documentsService.getAllTemplates().subscribe((response: any) => {
      this.templatesList = response.data;
    })
  }
  closemodel() {
    this.emailmodel = false;
  }

  addDocumentTemplate(form) {
    this.documentsService.addTemplate(form).subscribe((response: any) => {
      if (response != null && response != 0) {
        this.templatesList = response.data;
        this.toast.success('Document Template added successfully!');
        this.getTemplates();

        this.addDocumentTemplateForm.reset();
      }
      else {
        this.toast.error('Error adding Document Template', 'Error!');
      }
    })
  }

  deleteTemplate(id: any) {

    this.documentsService.deleteTemplate(id).subscribe((response: any) => {
      this.getTemplates();
      this.toast.success('Document template deleted successfully!');
    },
      err => {
        this.toast.error('Error deleting document template', 'Error!');
      });
  }
  openDialog(id: any): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
  onUpdate(event: any) {
    this.selectedOption = event.target.value;
    this.updateEditor();
  }

  updateEditor() {
    this.selectedTemplate.content = this.selectedTemplate.content + ' {' + this.selectedOption + '}';
  }

  updateEmails() {
    this.emailupdatemodel = true;
  }

  updateTemplate(updateForm) {
    const updatedData = this.addDocumentTemplateForm.value;
    this.documentsService.updateTemplate(this.selectedTemplate._id, updateForm)
      .subscribe(
        response => {
          this.templatesList = response.data;
          this.getTemplates();
          this.addDocumentTemplateForm.reset();

          this.isEditMode = false;
        },
        error => {

          console.error('Error updating data:', error);
        })
  }
}
