import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import * as moment from 'moment';
import { UserService } from 'src/app/_services/users.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';

@Component({
  selector: 'app-expenses-template-assignment',
  templateUrl: './expenses-template-assignment.component.html',
  styleUrls: ['./expenses-template-assignment.component.css']
})
export class ExpensesTemplateAssignmentComponent implements OnInit {
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add';
  closeResult: string = '';
  templates: any[] = [];
  userId: string;
  approverId: string
  templateAssignments: any;
  templateAssignmentForm: FormGroup;
  templateName;



  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private fb: FormBuilder,
    private authService: AuthenticationService) {
    this.templateAssignmentForm = this.fb.group({
      user: [''],
      approver: [''],
      expenseTemplate: [''],
      effectiveDate: [moment().format('YYYY-MM-DD')]
    })
  }

  ngOnInit(): void {
    this.getAllTemplates();
    this.getAssignments()
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  clearselectedRequest() {

  }
  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      // data: asset,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
      }
      (err) => {
        // this.toast.error('Can not be Deleted', 'Error!');
      };
    });
  }

  getAllTemplates() {
    this.expenseService.getAllTemplates().subscribe((res: any) => {
      this.templates = res.data;
    })
  }
  name: string
  selectedUsersChanged($event: string): void {
    this.userId = $event;

  }
  selectedUserNameChange($event: string): void {
    this.name = $event;
    console.log(this.name, this.userId)
  }


  selectedApproverChanged($event: string): void {
    this.approverId = $event;

  }
  user;
  // getAssignments() {
  //   this.expenseService.getTemplateAssignment().subscribe((res: any) => {
  //     this.templateAssignments = res.data;

  
  //   });
  // }
  templateResponse;
  getAssignments() {
    this.expenseService.getTemplateAssignment().subscribe((res: any) => {
      this.templateAssignments = res.data;
  
      // Use Promise.all to ensure all API requests are completed before rendering the data
      const userRequests = this.templateAssignments.map(assignment =>
        this.authService.GetMe(assignment.user).toPromise()
      );
  
      const templateRequests = this.templateAssignments.map(assignment =>
        this.expenseService.getTemplateById(assignment.expenseTemplate).toPromise()
      );
  
      Promise.all([...userRequests, ...templateRequests]).then(results => {
        for (let i = 0; i < this.templateAssignments.length; i++) {
          const userResponse = results[i];
          this.templateResponse = results[i + this.templateAssignments.length];
  
          if (userResponse) {
            this.templateAssignments[i].user = userResponse.data.users;
            this.templateAssignments[i].approver = userResponse.data.users;
            console.log(this.templateAssignments[i].user)
          }
  
          if (this.templateResponse.data != null) {
            this.templateAssignments[i].expenseTemplate = this.templateResponse.data.policyLabel;
            console.log(this.templateAssignments[i].expenseTemplate)
          }
        }
      });
    });
  }
  
  // getAssignments() {
  //   this.expenseService.getTemplateAssignment().subscribe((res: any) => {
  //     this.templateAssignments = res.data;

  //     // Create an array to store user and template details for each assignment
  //     const assignmentDetails = [];

  //     for (let index = 0; index < this.templateAssignments.length; index++) {
  //       const assignment = this.templateAssignments[index];

  //       // Fetch user details
  //       this.authService.GetMe(assignment.user).subscribe((userRes: any) => {
  //         this.user = userRes.data.users;
  //         console.log(this.user.firstName)
  //         // Fetch template details
  //         this.expenseService.getTemplateById(assignment.expenseTemplate).subscribe((templateRes: any) => {
  //           if (templateRes.data != null) {
  //             const templateName = templateRes.data.policyLabel;

  //             // Add user and template details to the array
  //             assignmentDetails.push({
  //               user: this.user,
  //               templateName: templateName
  //             });
  //             console.log(assignmentDetails);
  //             // Check if all data has been fetched
  //             if (assignmentDetails.length === this.templateAssignments.length) {
  //               // All data has been fetched, update the UI
  //               this.templateAssignments.forEach((assignment, i) => {
  //                 assignment.user = assignmentDetails[i].user;
  //                 assignment.templateName = assignmentDetails[i].templateName;
  //               });
  //               console.log(this.templateAssignments)
  //             }
  //           }
  //         });
  //       });
  //     }
  //   });
  // }


  getUserFullName(userId: string): string {
    const user = this.templateAssignments.find(assignment => assignment.user === userId);
    if (user) {
      return `${user.user.firstName} ${user.user.lastName}`;
    }
    return '';
  }
  
  getTemplateName(templateId: string): string {
    const template = this.templateAssignments.find(assignment => assignment.expenseTemplate === templateId);
    if (template) {
      return template.templateName.policyLabel;
    }
    return '';
  }
  
  addAssignment() {
    let payload = {
      user: this.userId,
      approver: this.approverId,
      expenseTemplate: this.templateAssignmentForm.value.expenseTemplate,
      effectiveDate: this.templateAssignmentForm.value.effectiveDate
    }
    this.expenseService.addTemplateAssignment(payload).subscribe((res: any) => {
      this.templateAssignments = res.data;
    })
  }

}
