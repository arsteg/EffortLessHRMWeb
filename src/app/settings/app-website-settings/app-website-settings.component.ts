import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AppWebsiteService } from '../../_services/appWebsite.service';

@Component({
  selector: 'app-app-website-settings',
  templateUrl: './app-website-settings.component.html',
  styleUrls: ['./app-website-settings.component.css']
})
export class AppWebsiteSettingsComponent implements OnInit {
  searchText = '';
  p: number = 1;
  applications:any;
  addForm: FormGroup;
  updateForm: FormGroup;
  selectedApplication: any;

  constructor(
    private fb: FormBuilder,
    private toast: ToastrService,
    private appWebsiteService: AppWebsiteService
  ) { 
    this.addForm = this.fb.group({
      key: ['', Validators.required],
      name: ['', Validators.required],
      isProductive: [true, Validators.required],
      icon: ['test']
    });
    this.updateForm = this.fb.group({
      key: ['', Validators.required],
      name: ['', Validators.required],
      isProductive: ['', Validators.required],
      icon: ['test']
    });
  }

  ngOnInit(): void {
    this.listAllApplications();
  }

  listAllApplications() {
    this.appWebsiteService.getAllApplication().subscribe((response: any) => {
      this.applications = response && response.data;
    });
  }

  addApplication(form) {
    this.appWebsiteService.addApplication(form).subscribe(response => {
      this.listAllApplications();
      this.toast.success('New Application', 'Successfully Added!')
      this.addForm.reset();
    },
      err => {
        this.toast.error('Application Can not be Added', 'Error!')
      })
  }

  deleteApplication() {
    this.appWebsiteService.deleteApplication(this.selectedApplication._id).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Successfully Deleted!')
    },
      err => {
        this.toast.error('Application Can not be Deleted', 'Error!');
      })
  }

  updateApplication(updateForm) {
    this.appWebsiteService.updateApplication(this.selectedApplication._id, updateForm).subscribe(response => {
      this.ngOnInit();
      this.toast.success('Existing application Updated', 'Successfully Updated!')
    },
      err => {
        this.toast.error('Application Can not be Updated', 'ERROR!')
      })
  }
  selectApplication(selectedApplication){
      this.selectedApplication = selectedApplication
  }
  
  onFileSelected(event: any) {
    let width =0;
    let height =0;
    if (event.target.files && event.target.files.length > 0) {
      const file: File = event.target.files[0];

      var mimeType = event.target.files[0].type;
		
		// if (mimeType.match(/image\/*/) == null) {
    //   this.toast.error('Only image are supported', 'ERROR!');
		// 	return;
		// }

      let reader = new FileReader();
        const img = new Image();
        img.src = window.URL.createObjectURL(file);
        reader.readAsDataURL(file);
        reader.onload = () => {
        img.onload = function (e) {
          width = img.naturalWidth;
          height = img.naturalHeight;

          if(width > 100 && height > 100) {
            
            //this.toastr.error('photo should be less then 100 x 100 size', 'ERROR!');
            //alert('');
            //return;
          }
          else{
            //this.uploadFile(file);
            //this.previewFile(file);
          }
          window.URL.revokeObjectURL( img.src );
        }
      };
      this.previewFile(file);
    }
  }
  
  imageUrl: string;
  previewFile(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imageUrl = reader.result as string;
    };
  }
}
