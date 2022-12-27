import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { userRole } from 'src/app/models/role.model';
import { Role } from 'src/app/models/role.model';
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
  userRoleAll :userRole[] = [];
  dataSource: any;
  scol:any;
  dummy:any = [];
  searchText = '';
  p: number = 1;

  constructor(private roleSrv:RoleService) { 
   this.userRoleObj = {
    _id : '',
    RoleName : '',
    RoleId : null,
    __v : null,
    id : ''
   }
   this.dummy = [];
  }

  ngOnInit(): void {
    this.getUserRoleId();
   this.getUserRoleAll();
  }

  getUserRoleId(){
    // debugger;
    this.roleSrv.getUserRoleId().subscribe((result:any) => {
      // debugger;
      this.userRoleId = result['data'];
      console.log("Result", this.userRoleId);
    })
  }

  getUserRoleAll(){
    this.roleSrv.getUserRoleAll().subscribe({
      next: result => {
        this.userRoleAll = result['data'];
        console.log('Roles', this.userRoleAll)
      },
      error: error => console.log("ERROR!!!")
    })
  }

  addRole() {
   this.roleSrv.createUserRole(this.userRoleObj).subscribe(data => {
    this.ngOnInit();
    console.log(data);
   })
  }

  deleteUserRole() {
  
      this.roleSrv.deleteUserRole(this.userRoleId.id).subscribe(data => {
      this.ngOnInit();
      console.log(" successfully Deleted!!!", data);
    });
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

    // deleteUserRole(obj:any){
    //   this.roleSrv.deleteUserRole(obj).subscribe((result)=>{
    //     this.getUserRoleAll();
    //   })
   

 
      //  sortByAsc(){
      //   debugger;
      //   let filteredData;
      //       debugger;
      //       filteredData = this.dummy.sort((a:any, b:any)=>
      //       a.RoleName.localeCompare(b.RoleName));
      //       this.dummy = filteredData; 
      //   }
    
      //  sortByDsc(){
      //   const filteredData = this.dummy.sort((a:any, b:any)=>
      //    a._id.localeCompare(b._id));
      //    this.dummy = filteredData.reverse();
      //    console.log(this.dummy);
      //   }
  
    }
 



