import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormGroup, FormBuilder, FormsModule ,ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { EmailtemplateService } from 'src/app/_services/emailtemplate.service';
import { template } from 'src/app/models/documents/documents';
import { DocumentsService } from 'src/app/_services/documents.service';

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
    private toast: ToastrService) {
    this.addDocumentTemplateForm = this.fb.group({
      name: ['', Validators.required],
      content:['', Validators.required],
      isActive: ['', Validators.required]
    });

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      content:['', Validators.required],
      isActive: [true, Validators.required]
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
  ngOnDestroy(): void {
  }

  onDropdownChange(event: any) {
    this.selectedOption = event.target.value;
    this.updateEditorContent();
  }
  @ViewChild('editor') editor: any;

  updateEditorContent() {
    // const quillEditor = this.editor.quillEditor;
    // const range = quillEditor.getSelection();
    // const position = range ? range.index : this.editorContent.length;
    // const selectedText = '{' + this.selectedOption + '}';

    // quillEditor.insertText(position, selectedText);
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
        this.toast.success('Document Template added successfully!');
        this.ngOnInit();
        this.addDocumentTemplateForm.reset();
      }
      else {
        this.toast.error('Error adding Document Template', 'Error!');
      }
    })
  }

  deleteTemplate(id: any) {
    const result = window.confirm('Are you sure you want to delete this document template?');
    if (result) {
      this.documentsService.deleteTemplate(id).subscribe((response: any) => {
        this.ngOnInit();
        this.toast.success('Document template deleted successfully!');
      },
        err => {
          this.toast.error('Error deleting document template', 'Error!');
        }
      )
    }
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

  updateEmail(updateForm) {
    const updatedData = this.updateForm.value;
    this.documentsService.updateTemplate(this.selectedTemplate._id, updateForm)
      .subscribe(
        response => {
          console.log('Data updated successfully:', response);
          this.ngOnInit();
        },
        error => {

          console.error('Error updating data:', error);
        })
  }
}
