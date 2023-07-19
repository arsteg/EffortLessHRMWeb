import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmailtemplateService } from '../_services/emailtemplate.service';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
// import { ToolbarService, LinkService, ImageService, HtmlEditorService, EmojiPickerService } from '@syncfusion/ej2-angular-richtexteditor';
// import { RichTextEditorComponent, TableService, FileManagerService } from '@syncfusion/ej2-angular-richtexteditor';
// import { FileManagerSettingsModel, QuickToolbarSettingsModel } from '@syncfusion/ej2-angular-richtexteditor';
// import { createElement, addClass, removeClass, Browser } from '@syncfusion/ej2-base';
// import { Editor } from 'ngx-editor';
// import { NgxEditorComponent } from 'ngx-editor';
// import { QuillEditorComponent } from 'ngx-quill';
// import Quill from 'quill';
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
  // editor: Editor;
  html: string;
  selectedOption: string;
  originalContent: string = '';
  editorContent: string = '';

  dropdownOptions = [
    { label: 'Tasks', value: 'option1' },
    { label: 'Assignee', value: 'option2' },
    { label: 'Start Date', value: 'option3' },
    { label: 'End Date', value: 'option4' }
  ];
  color = [
    { value: 'transparent' },
    { value: 'black' },
    { value: 'White' },
    { value: 'Grey' },
    { value: 'Pink' },
    { value: 'Red' },
    { value: 'Blue' },
    { value: 'Green' },
    { value: 'Purple' },
    { value: 'yellow' }
  ]
  content = '';
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
      Name: [''],
      subject: [''],
      templateType: [''],
      contentData: ['']
    });
  }

  ngOnInit(): void {
    this.isFormLoaded = true;
    this.getEmailList();
   
    this.form = this.fb.group({
      editor: this.content,
    });
    
    this.dropdownOptions;
    setTimeout(() => {
      this.isFormLoaded = true;
      console.log(this.isFormLoaded)
    }, 1);

  }
  ngOnDestroy(): void {
  }
  
  onDropdownChange(event: any) {
    this.selectedOption = event.target.value
    console.log(this.selectedOption)
  }

  getEmailList() {
    this.emailList = [
    ];
    this.emailservice.getAllEmails().subscribe((response: any) => {
      this.emailList = response;
      console.log(this.emailList)
    })
  }
  closemodel() {
    this.emailmodel = false;
  }
  addEmail(form) {
    console.log(form)
    // form = this.form.value;
    // console.log(form)
    this.emailservice.addEmail(form.value).subscribe((response: any) => {
      if (response != null && response != 0) {
        this.toast.success('Email Template added successfully!');
        this.ngOnInit();
        this.form.reset();
        this.emailmodel = false;
      }
      else {
        this.toast.error('Error adding Email Template', 'Error!');
      }
    })
  }
  addemail() {
    // this.showEditor = true;
    // this.emailmodel = this.emailmodel == false ? true : false;
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
