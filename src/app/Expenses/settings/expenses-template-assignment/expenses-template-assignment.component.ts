import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import * as moment from 'moment';
import { UserService } from 'src/app/_services/users.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/common/common.service';
import { ToastrService } from 'ngx-toastr';

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
  templateResponse;
  selectedTemplateAssignmentId: any;
  allAssignee: any[];


  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private toast: ToastrService) {
    this.templateAssignmentForm = this.fb.group({
      user: [''],
      primaryApprover: [''],
      secondaryApprover: [''],
      expenseTemplate: [''],
      effectiveDate: []
    })
  }

  ngOnInit(): void {
    this.getAllTemplates();
    this.getAssignments();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
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
  clearSelection() {
    this.templateAssignmentForm.reset();
  }

  deleteTemplateAssignment(_id: string) {
    this.expenseService.deleteTemplateAssignment(_id).subscribe((res: any) => {
      const index = this.templateAssignments.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.templateAssignments.splice(index, 1);
      }
    })
  }

  openDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplateAssignment(id);
        this.toast.success('Deleted Successfully!');
      }
      (err) => {
        this.toast.error('Can not be Deleted', 'Error!');
      };
    });
  }

  getAllTemplates() {
    this.expenseService.getAllTemplates().subscribe((res: any) => {
      this.templates = res.data;
    })
  }


  getAssignments() {
    this.expenseService.getTemplateAssignment().subscribe((res: any) => {
      this.templateAssignments = res.data;

      const userRequests = this.templateAssignments.map(assignment =>
        this.authService.GetMe(assignment.user).toPromise()
      );

      const primaryRequests = this.templateAssignments.map(assignment =>
        this.authService.GetMe(assignment.primaryApprover).toPromise()
      );

      const secondaryRequests = this.templateAssignments.map(assignment =>
        this.authService.GetMe(assignment.secondaryApprover).toPromise()
      );

      const templateRequests = this.templateAssignments.map(assignment =>
        this.expenseService.getTemplateById(assignment.expenseTemplate).toPromise()
      );

      Promise.all([...userRequests, ...templateRequests, ...primaryRequests, ...secondaryRequests]).then(results => {
        for (let i = 0; i < this.templateAssignments.length; i++) {
          const userResponse = results[i];
          this.templateResponse = results[i + this.templateAssignments.length];
          const primaryApproverResponse = results[i + this.templateAssignments.length * 2];
          const secondaryApproverResponse = results[i + this.templateAssignments.length * 2];

          if (userResponse) {
            this.templateAssignments[i].user = userResponse.data.users;
          }

          if (primaryApproverResponse) {
            this.templateAssignments[i].primaryApprover = primaryApproverResponse.data.users;
          }

          if (secondaryApproverResponse) {
            this.templateAssignments[i].secondaryApprover = secondaryApproverResponse.data.users;
          }

          if (this.templateResponse.data != null) {
            this.templateAssignments[i].expenseTemplate = this.templateResponse.data;
          }
        }
      });
    });
  }


  addOrUpdateAssignment() {
    let payload = {
      user: this.templateAssignmentForm.value.user,
      primaryApprover: this.templateAssignmentForm.value.primaryApprover,
      secondaryApprover: this.templateAssignmentForm.value.secondaryApprover,
      expenseTemplate: this.templateAssignmentForm.value.expenseTemplate,
      effectiveDate: this.templateAssignmentForm.value.effectiveDate
    }
    if (this.changeMode == 'Add') {
      this.expenseService.addTemplateAssignment(payload).subscribe((res: any) => {
        const newTemplateAssignment = res.data;
        this.templateAssignments.push(newTemplateAssignment);
        this.templateAssignmentForm.reset();
      });
    }
    else {
      console.log(this.selectedTemplateAssignmentId, payload)
      this.expenseService.updateTemplateAssignment(this.selectedTemplateAssignmentId, payload).subscribe((res: any) => {
        const updatedTemplateAssign = res.data;
        const index = this.templateAssignments.findIndex(templateAssign => templateAssign._id === updatedTemplateAssign._id);
        if (index !== -1) {
          this.templateAssignments[index] = updatedTemplateAssign;
        }
      })
    }
  }

  updateTemplateAssignment(templateId: any) {
    this.selectedTemplateAssignmentId = templateId;
    this.changeMode = 'Update';
    this.expenseService.getTemplateAssignmentById(templateId).subscribe((res: any) => {
      console.log(res.data)
      this.setFormValues(res.data);
    });
  }

  setFormValues(templateAssignment: any) {
    this.templateAssignmentForm.patchValue({
      user: templateAssignment.user._id,
      approver: templateAssignment.approver._id,
      expenseTemplate: templateAssignment.expenseTemplate._id,
      effectiveDate: templateAssignment.effectiveDate
    });
  }
}
