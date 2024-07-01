import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-advance-template-assignment',
  templateUrl: './advance-template-assignment.component.html',
  styleUrl: './advance-template-assignment.component.css'
})

export class AdvanceTemplateAssignmentComponent {
  searchText: '';
  isEdit = false;
  changeMode: 'Add' | 'Update' = 'Add';
  addTemplateAssignmentForm: FormGroup;
  closeResult: string = '';
  advanceTemplates: any;
  templateAssignments: any;
  templateResponse;
  allAssignee: any[];
  selectedTemplateAssignment: any;
  p: number = 1;
  public sortOrder: string = '';
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private expenseService: ExpensesService,
    private authService: AuthenticationService,
    private commonService: CommonService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.addTemplateAssignmentForm = this.fb.group({
      user: ['', Validators.required],
      advanceTemplate: ['', Validators.required],
      secondaryApprover: ['', Validators.required],
      primaryApprover: ['', Validators.required],
      effectiveDate: []
    });
  }

  ngOnInit() {
    this.getAllTemplates();
    // this.getAssignments();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    let payload={
      next: '',
      skip: ''
    }
    this.expenseService.getAdvanceTemplateAssignment(payload).subscribe((res: any) => {
      this.templateAssignments = res.data;
this.totalRecords = res.total

    })
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
  }

  getAdvanceTemplate(templateId: string) {
    const matchingTemplate = this.advanceTemplates?.find(user => user._id === templateId);
    return matchingTemplate ? matchingTemplate.policyLabel : '';
  }

  getAllTemplates() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getAdvanceTemplates(payload).subscribe((res: any) => {
      this.advanceTemplates = res.data;
    })
  }
  onCancel() {
    this.isEdit = false;
    this.addTemplateAssignmentForm.reset();
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
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAssignments();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAssignments();
  }
  getAssignments() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getAdvanceTemplateAssignment(pagination).subscribe((res: any) => {
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
        this.expenseService.getAdvanceTemplateById(assignment.advanceTemplate).toPromise()
      );

      Promise.all([...userRequests, ...templateRequests, ...primaryRequests, ...secondaryRequests]).then(results => {
        for (let i = 0; i < this.templateAssignments.length; i++) {
          const userResponse = results[i];
          this.templateResponse = results[i + this.templateAssignments.length];
          const primaryApproverResponse = results[i + this.templateAssignments.length * 2];
          const secondaryApproverResponse = results[i + this.templateAssignments.length * 3]; // Adjusted index here

          if (userResponse) {
            this.templateAssignments[i].user = userResponse.data.users;
          }

          if (primaryApproverResponse) {
            this.templateAssignments[i].primaryApprover = primaryApproverResponse.data.users;
          }

          if (secondaryApproverResponse) {
            this.templateAssignments[i].secondaryApprover = secondaryApproverResponse.data.users;
          }

          if (this.templateResponse.data) {
            this.templateAssignments[i].advanceTemplate = this.templateResponse.data;
          }
        }
      });
    });
  }


  onSubmit() {
    let payload = {
      user: this.addTemplateAssignmentForm.value.user,
      primaryApprover: this.addTemplateAssignmentForm.value.primaryApprover,
      secondaryApprover: this.addTemplateAssignmentForm.value.secondaryApprover,
      advanceTemplate: this.addTemplateAssignmentForm.value.advanceTemplate,
      effectiveDate: this.addTemplateAssignmentForm.value.effectiveDate,
    }
    if (this.addTemplateAssignmentForm.valid) {

      if (this.isEdit == false) {
        const existingAssignment = this.templateAssignments.find(assignment => assignment.user === payload.user);
        if (existingAssignment) {
          this.expenseService.addAdvanceTemplateAssignment(payload).subscribe((res: any) => {
            const updatedTemplateAssignment = res.data;
            this.toast.success('Advance Template already assigned to the selected user, it is updated successfully!', 'Successfully')
            const index = this.templateAssignments.findIndex(templateAssign => templateAssign.user === updatedTemplateAssignment.user);
            if (index!== -1) {
              this.templateAssignments[index] = updatedTemplateAssignment;
            }
          },
            (err) => {
              this.toast.error('Advance Template Cannot be updated!', 'Error')
            });
        } else {
          this.expenseService.addAdvanceTemplateAssignment(payload).subscribe((res: any) => {
            const newTemplateAssignment = res.data;
            this.templateAssignments.push(newTemplateAssignment);
            this.toast.success('Advance Template Assigned!', 'Successfully')
            this.addTemplateAssignmentForm.reset();
          },
            (err) => {
              this.toast.error('Advance Template Cannot be created!', 'Error')
            });
        }
      }
      else if (this.isEdit == true) {
        let user = this.selectedTemplateAssignment.user;
        let advanceTemplate = this.selectedTemplateAssignment.advanceTemplate._id;
        payload.user = user;
        payload.advanceTemplate = advanceTemplate;
        this.expenseService.addAdvanceTemplateAssignment(payload).subscribe((res: any) => {
          const updatedTemplateAssign = res.data;
          // this.getAssignments();
          this.toast.success('Advance Template Assignment Updated!', 'Successfully')

          const index = this.templateAssignments.findIndex(templateAssign => templateAssign._id === updatedTemplateAssign._id);
          if (index !== -1) {
            this.templateAssignments[index] = updatedTemplateAssign;
          }
        },
          (err) => {
            this.toast.error('Advance Template Cannot be Updated!', 'Error')
          })
      }
    }
    else {
      this.markFormGroupTouched(this.addTemplateAssignmentForm);
    }
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  edit(templateAssignment, index) {
    this.isEdit = true;
    this.changeMode = 'Update';
    this.addTemplateAssignmentForm.patchValue({
      user: templateAssignment.user,
      advanceTemplate: templateAssignment.advanceTemplate,
      secondaryApprover: templateAssignment.secondaryApprover,
      primaryApprover: templateAssignment.primaryApprover,
      effectiveDate: templateAssignment.effectiveDate
    });
    console.log(this.addTemplateAssignmentForm.value);
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.addTemplateAssignmentForm.reset();
  }

  deleteAdvanceTemplateAssignment(id, index: number) {
    let _id = id._id;
    this.expenseService.deleteAdvanceTemplateAssignment(_id).subscribe((res: any) => {
      this.templateAssignments.splice(index)
      this.toast.success('Successfully Deleted!!!', 'Advance Template Assgnment')
    },
      (err) => {
        this.toast.error('Can not be deleted!')
      })
  }

  deleteDialog(id: string, index: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAdvanceTemplateAssignment(id, index);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
}
