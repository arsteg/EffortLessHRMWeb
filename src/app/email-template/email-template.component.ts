import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmailtemplateService } from '../_services/emailtemplate.service';
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

    this.getEmailList();
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
    this.emailservice.addEmail(form).subscribe((response: any) => {
      if (response != null && response != 0) {
        this.toast.success('Email Template added successfully!');
        this.ngOnInit();
        this.emailmodel = false;
      }
      else {
        this.toast.error('Error adding Email Template', 'Error!');
      }
    })
  }
  addemail() {
    this.emailmodel = this.emailmodel == false ? true : false;
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