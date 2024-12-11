import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmailtemplateService } from 'src/app/_services/emailtemplate.service';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css']
})
export class EmailTemplateComponent implements OnInit {
  emailList: any = [];
  form: FormGroup;
  updateForm: FormGroup;
  emailmodel: boolean = false;
  emailupdatemodel: boolean = false;
  selectedEmail: any = [];
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
  
  constructor(private emailservice: EmailtemplateService, private fb: FormBuilder,
    private toast: ToastrService) {
    this.form = this.fb.group({
      Name: ['', Validators.required],
      subject: ['', Validators.required],
      templateType: ['', Validators.required],
      contentData: ['', Validators.required]
    });
    this.updateForm = this.fb.group({
      Name: [{value:'', disabled: true}],
      subject: [''],
      templateType: [''],
      contentData: ['']
    });
  }

  ngOnInit(): void {
    this.isFormLoaded = true;
    this.getEmailList();
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
    const quillEditor = this.editor.quillEditor;
    const range = quillEditor.getSelection();
    const position = range ? range.index : this.editorContent.length;
    const selectedText = '{' + this.selectedOption + '}';

    quillEditor.insertText(position, selectedText);
  }
 
  getEmailList() {
    this.emailList = [
    ];
    this.emailservice.getAllEmails().subscribe((response: any) => {
      this.emailList = response;
    })
  }
  closemodel() {
    this.emailmodel = false;
  }
  addEmail(form) {
    console.log(form.Name)

    this.emailservice.addEmail(form).subscribe((response: any) => {
      if (response != null && response != 0) {
        this.toast.success('Email Template added successfully!');
        this.ngOnInit();
        this.form.reset();
      }
      else {
        this.toast.error('Error adding Email Template', 'Error!');
      }
    })
  }

  deleteEmail(id: any) {
    this.emailservice.deleteEmail(id).subscribe((response: any) => {
      this.ngOnInit();
      this.toast.success('Email Template deleted successfully!');
    },
      err => {
        this.toast.error('Error Email Template not delete', 'Error!');
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
    const updatedData = this.updateForm.value;
    this.emailservice.updateEmail(this.selectedEmail._id, updateForm)
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
