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
  dataSource: any;
  scol:any;
  dummy:any = [];
 
 

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
      this.dummy = this.userRoleAll;
      this.dummy.push({
        _id : '627e16f8722cd08ad4875527',
       RoleName : 'student',
       RoleId : '2',
       __v : 10,
        id : '627e16f8722cd08ad4875527'
       });
       this.dummy.push({
        _id : '627e16f8722cd08ad4875524',
       RoleName : 'admin2',
       RoleId : '3',
       __v : 5,
        id : '627e16f8722cd08ad4875524'
       });
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

 
       sortByAsc(val:string){
        debugger;
        let filteredData;
        
        switch(val){
          case 'Id':
             filteredData = this.dummy.sort((a:any, b:any)=>
            a._id.localeCompare(b._id));
            this.dummy = filteredData;
            break;

           case 'RoleName' :
            debugger;
            filteredData = this.dummy.sort((a:any, b:any)=>
            a.RoleName.localeCompare(b.RoleName));
            this.dummy = filteredData;
            break;

            case 'RoleId' :
            filteredData = this.dummy.sort((a:any, b:any)=>
            a.RoleId.localeCompare(b.RoleId));
            this.dummy = filteredData;
            break;

            case 'v' :
              debugger;
            filteredData = this.dummy.sort((a:any, b:any)=>
            (a.__v).localeCompare(b.__v));
            this.dummy = filteredData;
            break;

            case 'Id2' :
            filteredData = this.dummy.sort((a:any, b:any)=>
            a.id.localeCompare(b.id));
            this.dummy = filteredData;
            break;
        }
     
      
       }

       sortByDsc(){
        const filteredData = this.dummy.sort((a:any, b:any)=>
         a._id.localeCompare(b._id));
         this.dummy = filteredData.reverse();
         console.log(this.dummy);
        }
  }

 



