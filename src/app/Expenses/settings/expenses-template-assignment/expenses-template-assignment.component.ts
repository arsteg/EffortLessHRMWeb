import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import * as moment from 'moment';
import { UserService } from 'src/app/_services/users.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expenses-template-assignment',
  templateUrl: './expenses-template-assignment.component.html',
  styleUrls: ['./expenses-template-assignment.component.css']
})
export class ExpensesTemplateAssignmentComponent implements OnInit {
  searchText: string = '';
  isEdit: boolean = false;
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
  p: number = 1;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  public sortOrder: string = '';
  templateById: any;
  @ViewChild('primaryApproverField') primaryApproverField: ElementRef;
  @ViewChild('secondaryApproverField') secondaryApproverField: ElementRef;
  showApproverFields = true;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

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
    });

    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];

  }

  ngOnInit(): void {
    this.getAllTemplates();
    this.getAssignments();
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
  }
  setFormValues(data) {
    this.showApproverFields = true;
    this.expenseService.getTemplateById(data.expenseTemplate).subscribe((res: any) => {
      this.templateById = res.data;
      this.expenseService.getTemplateAssignmentById(data.user).subscribe((res: any) => {
        const templateAssignment = res.data;
        if (this.templateById.approvalType === 'template-wise') {
          if (this.templateById.approvalLevel === '1') {
            this.templateAssignmentForm.patchValue({
              primaryApprover: templateAssignment[0].primaryApprover,
              secondaryApprover: null,
              user: data.user,
              expenseTemplate: data.expenseTemplate,
              effectiveDate: data.effectiveDate
            });
            this.templateAssignmentForm.get('user').disable();
            this.templateAssignmentForm.get('expenseTemplate').disable();
            this.templateAssignmentForm.get('primaryApprover').disable();
          } else if (this.templateById.approvalLevel === '2') {
            this.templateAssignmentForm.patchValue({
              primaryApprover: templateAssignment[0].primaryApprover,
              secondaryApprover: templateAssignment[0].secondaryApprover,
              user: data.user,
              expenseTemplate: data.expenseTemplate,
              effectiveDate: data.effectiveDate
            });
          }
          this.templateAssignmentForm.get('user').disable();
          this.templateAssignmentForm.get('expenseTemplate').disable();
          this.templateAssignmentForm.get('primaryApprover').disable();
          this.templateAssignmentForm.get('secondaryApprover').disable();
        }
        else if (this.templateById.approvalType === 'employee-wise') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: templateAssignment[0].primaryApprover,
            secondaryApprover: templateAssignment[0].secondaryApprover,
            user: data.user,
            expenseTemplate: data.expenseTemplate,
            effectiveDate: data.effectiveDate
          });
          this.templateAssignmentForm.get('user').disable();
          this.templateAssignmentForm.get('expenseTemplate').disable();
          this.templateAssignmentForm.get('primaryApprover').enable();
          this.templateAssignmentForm.get('secondaryApprover').enable();
        }
      });

    })
  }

  getTemplateById() {
    this.expenseService.getTemplateById(this.selectedTemplateAssignmentId.expenseTemplate).subscribe((res: any) => {
      this.templateById = res.data;
      if (this.templateById.approvalType === 'template-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: this.templateById.primaryApprover,
            secondaryApprover: null
          });
          this.templateAssignmentForm.get('primaryApprover').disable();
        } else if (this.templateById.approvalLevel === '2') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: this.templateById.primaryApprover,
            secondaryApprover: this.templateById.secondaryApprover
          });
        }
        this.templateAssignmentForm.get('primaryApprover').disable();
        this.templateAssignmentForm.get('secondaryApprover').disable();
      }
      else if (this.templateById.approvalType === 'employee-wise') {
        this.templateAssignmentForm.patchValue({
          primaryApprover: this.templateById.primaryApprover,
          secondaryApprover: this.templateById.secondaryApprover
        });
        this.templateAssignmentForm.get('primaryApprover').enable();
        this.templateAssignmentForm.get('secondaryApprover').enable();
      }
    })
  }


  onTemplateSelectionChange(event: any) {
    this.showApproverFields = true;
    const selectedTemplateId = event.target.value;

    this.expenseService.getTemplateById(selectedTemplateId).subscribe((res: any) => {
      this.templateById = res.data;

      if (this.templateById.approvalType === 'template-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: null
          });
          this.templateAssignmentForm.get('primaryApprover').disable();
          this.templateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.templateAssignmentForm.get('secondaryApprover').disable();
          this.templateAssignmentForm.get('secondaryApprover').updateValueAndValidity();

          // Disable the fields
          this.primaryApproverField.nativeElement.disabled = true;
          this.secondaryApproverField.nativeElement.disabled = true;

        } else if (this.templateById.approvalLevel === '2') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: this.templateById.secondApprovalEmployee
          });
          this.templateAssignmentForm.get('primaryApprover').disable();
          this.templateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.templateAssignmentForm.get('secondaryApprover').disable();
          this.templateAssignmentForm.get('secondaryApprover').updateValueAndValidity();

          // Disable the fields
          this.primaryApproverField.nativeElement.disabled = true;
          this.secondaryApproverField.nativeElement.disabled = true;
        }
      } else if (this.templateById.approvalType === 'employee-wise') {
        if (this.templateById.approvalLevel === '1') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: null
          });
          this.templateAssignmentForm.get('primaryApprover').enable();
          this.templateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.templateAssignmentForm.get('secondaryApprover').enable();
          this.templateAssignmentForm.get('secondaryApprover').updateValueAndValidity();

          // Enable the fields
          this.primaryApproverField.nativeElement.disabled = false;
          this.secondaryApproverField.nativeElement.disabled = false;

        } else if (this.templateById.approvalLevel === '2') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: this.templateById.firstApprovalEmployee,
            secondaryApprover: this.templateById.secondApprovalEmployee
          });
          this.templateAssignmentForm.get('primaryApprover').enable();
          this.templateAssignmentForm.get('primaryApprover').updateValueAndValidity();
          this.templateAssignmentForm.get('secondaryApprover').enable();
          this.templateAssignmentForm.get('secondaryApprover').updateValueAndValidity();
          this.primaryApproverField.nativeElement.disabled = false;
          this.secondaryApproverField.nativeElement.disabled = false;
        }
      }
    });
  }

  getUser(employeeId: string) {
    const matchingUser = this.allAssignee?.find(user => user._id === employeeId);
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : '';
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
    if (this.changeMode == 'Add') {
      this.showApproverFields = false;
    }
    else {
      this.showApproverFields = true;
    }
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  clearSelection() {
    this.changeMode = 'Add';
    this.templateAssignmentForm.get('user')?.enable();
    this.templateAssignmentForm.get('expenseTemplate')?.enable();
    this.templateAssignmentForm.reset();
  }

  deleteTemplateAssignment(_id: string) {
    this.expenseService.deleteTemplateAssignment(_id).subscribe((res: any) => {
      const index = this.templateAssignments.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.templateAssignments.splice(index, 1);
      }
      this.toast.success('Deleted Successfully!');
    })
  }

  openDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplateAssignment(id);

      }
      (err) => {
        this.toast.error('Can not be Deleted', 'Error!');
      };
    });
  }

  getAllTemplates() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getAllTemplates(payload).subscribe((res: any) => {
      this.templates = res.data;
    })
  }

  getTemplate(templateId: string) {
    const template = this.templates?.find(user => user._id === templateId);
    return template ? template.policyLabel : '';
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllTemplates();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAllTemplates();
  }

  getAssignments() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getTemplateAssignment(pagination).subscribe((res: any) => {
      this.templateAssignments = res.data;
      this.totalRecords = res.total;
    });
  }


  addOrUpdateAssignment() {
    let payload = {
      user: this.templateAssignmentForm.value.user || null,
      primaryApprover: this.templateAssignmentForm.value.primaryApprover,
      secondaryApprover: this.templateAssignmentForm.value.secondaryApprover,
      expenseTemplate: this.templateAssignmentForm.value.expenseTemplate || null,
      effectiveDate: this.templateAssignmentForm.value.effectiveDate
    }

    if (this.changeMode == 'Add') {
      console.log(payload)
      this.expenseService.addTemplateAssignment(payload).subscribe((res: any) => {
        const newTemplateAssignment = res.data;
        this.toast.success('Advance Template Assigned!', 'Successfully')
        this.templateAssignments.push(newTemplateAssignment);
        this.getAssignments();
        this.templateAssignmentForm.reset();
        this.showApproverFields = false;
      },
        (err) => {
          this.toast.error('Advance Template Cannot be created!', 'Error')
        });
    }
    else {
      let user = this.selectedTemplateAssignmentId.user;
      let expenseTemplate = this.selectedTemplateAssignmentId.expenseTemplate;
      payload.user = user;
      payload.expenseTemplate = expenseTemplate;
      this.expenseService.addTemplateAssignment(payload).subscribe((res: any) => {
        const updatedTemplateAssign = res.data;
        this.toast.success('Advance Template Assignment Updated!', 'Successfully')
        this.templateAssignmentForm.reset();
        this.showApproverFields = false;

        const index = this.templateAssignments.findIndex(templateAssign => templateAssign._id === updatedTemplateAssign._id);
        if (index !== -1) {
          this.templateAssignments[index] = updatedTemplateAssign;
        }
        this.getAssignments();
      },
        (err) => {
          this.toast.error('Advance Template Cannot be Updated!', 'Error')
        })

    }
  }




  editTemplateAssignment(templateAssignments, index: number) {
    this.changeMode = 'Update';
    let templateAssignment = templateAssignments;
    const formValues = {
      user: templateAssignment.user,
      primaryApprover: templateAssignment.primaryApprover,
      secondaryApprover: templateAssignment.secondaryApprover,
      expenseTemplate: templateAssignment.expenseTemplate,
      effectiveDate: templateAssignment.effectiveDate
    };
    console.log(formValues)
    this.templateAssignmentForm.get('user')?.enable();
    this.templateAssignmentForm.get('expenseTemplate')?.enable();
    this.templateAssignmentForm.patchValue(formValues);
    this.templateAssignmentForm.get('user')?.disable();
    this.templateAssignmentForm.get('expenseTemplate')?.disable();
  }

}
