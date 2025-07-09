import { Component, OnInit } from '@angular/core';
import { PermissionModelService } from 'src/app/_services/permission-model.service';

@Component({
  selector: 'app-permission-model',
  templateUrl: './permission-model.component.html',
  styleUrls: ['./permission-model.component.css']
})
export class PermissionModelComponent implements OnInit {
  permissionObj:any;
  form:any;
  name: string;
  userPermissions:any = [];
  dummy:any = [];

  constructor(private permSrv:PermissionModelService) {
    // this.permissionObj = {
    //   permissionName:'',
    //   permissionDetails:'',
    //   parentPermission:''
    // }
      this.permissionObj = {

      }
    
    this.dummy= [];
   }

  ngOnInit(): void {
    this.getRolePermissions();
  }
  getRolePermissions(){
    this.permSrv.getRolePermissions().subscribe((result:any) => {
      this.userPermissions = result['data'];
      console.log("Result", this.userPermissions);
    })
  }

  sortByAsc(val:string){
    let filteredData;

    switch(val){
      case 'PermissionName':
         filteredData = this.dummy.sort((a:any, b:any)=>
        a.permissionName.localeCompare(b.permissionName));
        this.dummy = filteredData;
        break;

        case 'PermissionDetails':
          filteredData = this.dummy.sort((a:any, b:any)=>
         a.permissionDetails.localeCompare(b.permissionDetails));
         this.dummy = filteredData;
         break;

         case 'ParentPermission':
          filteredData = this.dummy.sort((a:any, b:any)=>
         a.parentPermission.localeCompare(b.parentPermission));
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
