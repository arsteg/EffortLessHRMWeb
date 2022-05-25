import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { first } from 'rxjs';
import { signup } from 'src/app/models/user';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { NotificationService } from 'src/app/_services/notification.service';
import { Base } from '../../../controls/base';
import { ControlService } from '../../../_services/control.service';
import { UserService } from '../../users.service';

@Component({
  selector: 'app-user-form-control',
  templateUrl: './user-form-control.component.html',
  styleUrls: ['./user-form-control.component.css'],  
  providers:  [UserService]
})
export class UserFormCOntrolComponent implements OnInit {
  
  @Input() controls: Base<string>[] | null = [];
  form!: FormGroup;
  payLoad = '';
  id: string; 
  public user: signup=new signup(); 
  constructor(private ControlService: ControlService,private UserService: UserService, private notifyService: NotificationService,private authenticationService:AuthenticationService) {
   }   

  ngOnInit(): void { 
    this.form = this.ControlService.toFormGroup(this.controls as Base<string>[]); 
    this.id=this.authenticationService.currentUserValue["data"].user.id;      
    this.UserService.GetMe(this.id).pipe(first())
    .subscribe((res:any) => {  
       this.user=res.data['users'];
          this.setProfile();
        },
        err => {
        }); 
  }
  setProfile(){
    
    this.form.get("lastName").setValue(this.user.lastName);
    this.form.get("email").setValue(this.user.email); 
    this.form.get("firstName").setValue(this.user.firstName);
    this.form.get("phone").setValue(this.user.phone); 
    this.form.get("city").setValue(this.user.city);
    this.form.get("address").setValue(this.user.address); 
    this.form.get("country").setValue(this.user.country);
    this.form.get("extraDetails").setValue(this.user.extraDetails); 
    this.form.get("jobTitle").setValue(this.user.jobTitle);
    this.form.get("pincode").setValue(this.user.pincode);   
    this.form.get("state").setValue(this.user.state);  

  }
  onSubmit() {  
   
    this.user=this.form.value;  
   this.user.id=this.id;   
      this.UserService.updateMe(this.user)
      .pipe(first())
      .subscribe(        
        data => {        
          // this.resetPasswordForm.reset();
           setTimeout(() => {          
             this.notifyService.showSuccess("update Successfully", "success")          
          }, 30);
        },
        err => {
          if (err.error) {                 
            this.notifyService.showError(err.message, "Error")
          }         
        });
      }       
  
    }


