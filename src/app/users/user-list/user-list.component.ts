import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { UserService } from '../users.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [UserService]
})

export class UserListComponent implements OnInit {
  teamOfUsers: User[] = [];
  allUsers: User[] = [];

  searchText = '';
  p: number = 1;
  public users: Array<User> = [];
  date = new Date('MMM d, y, h:mm:ss a');
  constructor(private UserService: UserService, private manageTeamService: ManageTeamService) {}
  
  ngOnInit() {
    this.populateTeamOfUsers();
  }

  populateTeamOfUsers() {
    this.manageTeamService.getAllUsers().subscribe({
      next: result => {
        this.teamOfUsers = result.data.data;
        this.allUsers = result.data.data;
      },
      error: error => { }
    })
  }
}

  // addData() {
  //   this.teamOfUsers.push(this.newAttribute)
  //   this.newAttribute = {};
  // }

  // deleteRow(index) {

  //   this.teamOfUsers.splice(index, 1);
  //   this.toastr.warning('Row deleted successfully', 'Delete row');
  //   return true;

  // }

  // columnDefs = [
  //     { headerName: 'User Name', field: 'name', sortable: true, filter: true},  
  //     { headerName: 'Email', field: 'email', sortable: true, filter: true,width: 200 },  
  //     { headerName: 'Role', field: 'role.roleName', sortable: true, filter: true,width: 150 }, 
  //     { headerName: 'Company', field: 'company.companyName', sortable: true, filter: true,width: 200 },  
  //     { headerName: 'Status', field: 'status', sortable: true, filter: true ,width: 100},  

  //     { headerName: 'Updated On', field: 'updatedOn', sortable: true, filter: true , valueFormatter: function (params) {
  //       return moment(params.value).format('DD-MM-yyyy');
  //   },}, 
  //     { headerName: 'Updated By', field: 'updatedBy.firstName', sortable: true, filter: true,width: 150},   
  //     {
  //       headerName: 'Edit',
  //       cellRenderer: (params) => {return '<span><i class="fa fa-edit" data-action-type="edit"></i></span>'},width:80

  //     },
  //     {
  //       headerName: 'Delete',
  //       cellRenderer: (params) => {return '<span><i class="fa fa-trash" data-action-type="delete"></i></span>'},width: 80

  //     },
  //   ];  
  //   onCellClicked(result: any): void {
  //    alert(result.data.id)

  //   }

