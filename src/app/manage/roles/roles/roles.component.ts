import { Component, OnInit } from '@angular/core';
import { userRole } from 'src/app/models/role.model';
import { RoleService } from 'src/app/_services/role.service';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  isSidePanelOpen:boolean=false;
  userRoleObj:any;
  form:any;
  name: string;
  userRoleId :any = [];
  userRoleAll :any = [];
 

  constructor(private roleSrv:RoleService) { 
   this.userRoleObj = {
    _id : '',
    RoleName : '',
    RoleId : null,
    __v : null,
    id : ''
   }
  }

  ngOnInit(): void {
    this.getUserRoleId();
   this.getUserRoleAll();
  }

  getUserRoleId(){
    debugger;
    this.roleSrv.getUserRoleId().subscribe((result:any) => {
      debugger;
      this.userRoleId = result['data'];
      console.log("Result", this.userRoleId);
    })
  }

  getUserRoleAll(){
    debugger
    this.roleSrv.getUserRoleAll().subscribe((result:any) => {
      debugger;
      this.userRoleAll = result['data'];
      console.log("Result", this.userRoleAll);
    })
  }
  createUserRole(){
    debugger;
    this.roleSrv.createUserRole(this.userRoleObj).subscribe((result)=>{
      debugger;
    this.getUserRoleAll();
    })
  }

    updateUserRole(){
     this.roleSrv.updateUserRole(this.userRoleObj).subscribe((result)=>{
      this.getUserRoleAll();
      this.userRoleObj = {
        _id : '',
        RoleName : '',
        RoleId : null,
        __v : null,
        id : ''
       }
     })
    }

    deleteUserRole(obj:any){
      this.roleSrv.deleteUserRole(obj).subscribe((result)=>{
        this.getUserRoleAll();
      })
    }
  }

 



