import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { userRole } from 'src/app/models/role.model';
import { Role } from 'src/app/models/role.model';
import { RoleService } from 'src/app/_services/role.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  isSidePanelOpen: boolean = false;
  roleData: any;
  form: any;
  name: string;
  userRoleId: any = [];
  allRoles: userRole[] = [];
  dataSource: any;
  scol: any;
  dummy: any = [];
  searchText = '';
  p: number = 1;
  createRole: FormGroup;
  updateRole: FormGroup;
  selected_Role: any;
  public sortOrder: string = ''; // 'asc' or 'desc'

  constructor(private roleSrv: RoleService,
    private fb : FormBuilder,
    private toastRole: ToastrService) {
    this.createRole = this.fb.group({
      name : ['', Validators.required]
    });
    this.updateRole = this.fb.group({
      name: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.getallRoles();
  }
  selectedRole(selectedRole){
    this.selected_Role = selectedRole
    console.log(this.selected_Role)
  }

  getallRoles() {
    this.roleSrv.getAllRole().subscribe(result => {
      this.allRoles = result['data'];
    })
  }

  addRole(form) {
    this.roleSrv.addRole(form).subscribe(data => {
      this.getallRoles();
      this.toastRole.success('New Role', 'Successfully Added!')
    },
      err => {
        this.toastRole.error('Can not be Added', 'ERROR!')
      })
  }

  deleteRole() {

    this.roleSrv.deleteRole(this.selected_Role.id).subscribe(data => {
      this.getallRoles();
      this.toastRole.success('Role', 'Successfully Deleted!')
    },
      err => {
        this.toastRole.error('Can not be Deleted', 'ERROR!')
      })
  }

  update_Role(form) {
    this.roleSrv.updateRole(this.selected_Role.id, form.name).subscribe((result) => {
      this.getallRoles();
      this.toastRole.success('Role', 'Successfully Updated!')
    },
      err => {
        this.toastRole.error('Can not be Updated', 'ERROR!')
      })
  }

  // deleteUserRole(obj:any){
  //   this.roleSrv.deleteUserRole(obj).subscribe((result)=>{
  //     this.getallRoles();
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




