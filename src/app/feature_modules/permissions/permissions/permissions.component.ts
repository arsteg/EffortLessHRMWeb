import { Component, OnInit } from '@angular/core';
import { PermissionsService } from '../../../_services/permissions.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Validators, FormGroup, FormBuilder, FormControl, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css']
})
export class PermissionsComponent implements OnInit {
  searchText = '';
  p: number = 1;
  allPermissions: any[];
  addPermissions: FormGroup;
  updatePermissions: FormGroup;
selectedPermission: any;
public sortOrder: string = ''; // 'asc' or 'desc'

  constructor(private permissionService: PermissionsService,
    private fb: FormBuilder,
    private toastPerm: ToastrService) {
      this.addPermissions = this.fb.group({
        permissionName: ['', Validators.required],
        permissionDetails: ['', Validators.required]
      });
      this.updatePermissions = this.fb.group({
        permissionName: ['', Validators.required],
        permissionDetails: ['', Validators.required]
      })
     }

  ngOnInit() {
    this.getPermissions();
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.allPermissions, event.previousIndex, event.currentIndex);
  }
  getPermissions() {
    let index=0;
    this.permissionService.getPermissions().subscribe(result => {
      this.allPermissions = result && result.data && result.data['permissionList'];
      return result;
    })
  }
 selectedPermissions(selectedPermission){
    this.selectedPermission = selectedPermission
  }
  addPermission(form) {
    this.permissionService.addPermission(form).subscribe(result => {
      this.getPermissions();
      this.toastPerm.success('New Permission', 'Successfully Added!')
    },
      err => {
        this.toastPerm.error('Can not be Added', 'ERROR!')
      })
  }
updatePermission(form){
this.permissionService.updatePermission(this.selectedPermission.id, form).subscribe(result=> {
this.getPermissions();
this.toastPerm.success('Permission', 'Successfully Updated!')
},
  err => {
    this.toastPerm.error('Can not be Added', 'ERROR!')
  })
}

 deletePermission(){
  this.permissionService.deletePermission(this.selectedPermission.id).subscribe(result=> {
    this.getPermissions();
    this.toastPerm.success('Permission', 'Successfully Deleted!')
  },
    err => {
      this.toastPerm.error('Can not be Added', 'ERROR!')
    })
 }
}


