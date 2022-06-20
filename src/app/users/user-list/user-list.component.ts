import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from '../users.service';
import * as moment from 'moment';
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers:  [UserService]
})

export class UserListComponent implements OnInit {
  public users: Array<User>=[];
  constructor( private UserService: UserService) {     
    this.UserService.getUserList()
      .subscribe(data => {        
       this.users=data.data.data;
      })}
  ngOnInit() {
    
  }
  columnDefs = [
      { headerName: 'User Name', field: 'name', sortable: true, filter: true},  
      { headerName: 'Email', field: 'email', sortable: true, filter: true,width: 200 },  
      { headerName: 'Role', field: 'role.roleName', sortable: true, filter: true,width: 150 }, 
      { headerName: 'Company', field: 'company.companyName', sortable: true, filter: true,width: 200 },  
      { headerName: 'Status', field: 'status', sortable: true, filter: true ,width: 100},  
      
      { headerName: 'Updated On', field: 'updatedOn', sortable: true, filter: true , valueFormatter: function (params) {
        return moment(params.value).format('DD-MM-yyyy');
    },}, 
      { headerName: 'Updated By', field: 'updatedBy.firstName', sortable: true, filter: true,width: 150},   
      {
        headerName: 'Edit',
        cellRenderer: (params) => {return '<span><i class="fa fa-edit" data-action-type="edit"></i></span>'},width:80
       
      },
      {
        headerName: 'Delete',
        cellRenderer: (params) => {return '<span><i class="fa fa-trash" data-action-type="delete"></i></span>'},width: 80
       
      },
    ];  
    onCellClicked(result: any): void {
     alert(result.data.id)
   
    }
    
}
