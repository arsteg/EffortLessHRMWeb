import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { CommonService } from 'src/app/_services/common.Service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-expenses-template-assignment',
  templateUrl: './expenses-template-assignment.component.html',
  styleUrls: ['./expenses-template-assignment.component.css']
})
export class ExpensesTemplateAssignmentComponent implements OnInit {
  searchText: string = '';
  isEdit: boolean = false;
  changeMode: 'Add' | 'View' | 'Update' = 'Add';
  closeResult: string = '';
  templates: any[] = [];
  userId: string;
  approverId: string
  templateAssignments: any;
  templateAssignmentForm: FormGroup;
  templateResponse;
  selectedTemplateAssignment: any;
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
    private commonService: CommonService,
    private toast: ToastrService,
    private datePipe: DatePipe) {
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
    this.commonService.populateUsers().subscribe(result => {
      this.allAssignee = result && result.data && result.data.data;
    });
    setTimeout(() => {
      this.getAssignments();
    }, 1000)
  }

  setFormValues() {
    this.showApproverFields = true;
    const data = this.selectedTemplateAssignment;
    this.expenseService.getTemplateAssignmentById(data.user).subscribe((res: any) => {
      const templateAssignment = res.data[0];
      console.log(templateAssignment)
      this.templateAssignmentForm.patchValue({
        user: templateAssignment.user,
        primaryApprover: templateAssignment.primaryApprover,
        expenseTemplate: templateAssignment.expenseTemplate,
        effectiveDate: templateAssignment.effectiveDate,
        secondaryApprover: templateAssignment.secondaryApprover
      });
      this.expenseService.getTemplateById(templateAssignment.expenseTemplate).subscribe((res: any) => {
        this.templateById = res.data;
        if (this.templateById.approvalType === 'template-wise') {
          if (this.templateById.approvalLevel === '1') {
            this.templateAssignmentForm.patchValue({
              primaryApprover: templateAssignment?.primaryApprover,
              secondaryApprover: null,
              user: templateAssignment.user,
              expenseTemplate: templateAssignment.expenseTemplate,
              effectiveDate: data.effectiveDate
            });
            console.log(this.templateAssignmentForm.value)
            this.templateAssignmentForm.get('user').disable();
            this.templateAssignmentForm.get('effectiveDate').disable();
            this.templateAssignmentForm.get('expenseTemplate').disable();
            this.templateAssignmentForm.get('primaryApprover').disable();
          } else if (this.templateById.approvalLevel === '2') {
            this.templateAssignmentForm.patchValue({
              primaryApprover: templateAssignment.primaryApprover,
              secondaryApprover: templateAssignment.secondaryApprover,
              user: templateAssignment.user,
              expenseTemplate: templateAssignment.expenseTemplate,
              effectiveDate: templateAssignment.effectiveDate
            });
          }
          this.templateAssignmentForm.get('user').disable();
          this.templateAssignmentForm.get('effectiveDate').disable();
          this.templateAssignmentForm.get('expenseTemplate').disable();
          this.templateAssignmentForm.get('primaryApprover').disable();
          this.templateAssignmentForm.get('secondaryApprover').disable();
        }

        else if (this.templateById.approvalType === 'employee-wise') {
          this.templateAssignmentForm.patchValue({
            primaryApprover: templateAssignment.primaryApprover,
            secondaryApprover: templateAssignment.secondaryApprover,
            user: templateAssignment.user,
            expenseTemplate: templateAssignment.expenseTemplate,
            effectiveDate: templateAssignment.effectiveDate
          });
          this.templateAssignmentForm.get('user').disable();
          this.templateAssignmentForm.get('effectiveDate').disable();
          this.templateAssignmentForm.get('expenseTemplate').disable();
          this.templateAssignmentForm.get('primaryApprover').enable();
          this.templateAssignmentForm.get('secondaryApprover').enable();
        }
      });
    });
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
    return matchingUser ? `${matchingUser.firstName} ${matchingUser.lastName}` : 'N/A';
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  clearSelection() {
    if (this.changeMode == 'Add') {
      this.templateAssignmentForm.get('user')?.enable();
      this.templateAssignmentForm.get('expenseTemplate')?.enable();
      this.templateAssignmentForm.reset();
    }
    if (this.changeMode == 'Update') {
      this.setFormValues();
    }
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
    const template = this.templates?.find(template => template?._id === templateId);
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
      this.templateAssignments = res.data.map((report) => {
        const expenseTemplateDetails = this.getTemplateDetails(report?.expenseTemplate);
        return {
          ...report,
          employeeName: this.getUser(report?.user),
          expenseTemplate: this.getTemplate(report?.expenseTemplate),
          primaryApprover: this.getUser(report?.primaryApprover),
          secondaryApprover: this.getUser(report?.secondaryApprover),
          approvalType: expenseTemplateDetails?.approvalType
        };
      });
      this.totalRecords = res.total;
    });
  }

  getTemplateDetails(templateId: string) {
    return this.templates?.find(template => template?._id === templateId);
  }

  addOrUpdateAssignment() {
    this.templateAssignmentForm.get('user').enable();
    this.templateAssignmentForm.get('expenseTemplate').enable();
    this.templateAssignmentForm.get('effectiveDate').enable();

    let payload = {
      user: this.templateAssignmentForm.value.user || null,
      primaryApprover: this.templateAssignmentForm.value.primaryApprover,
      secondaryApprover: this.templateAssignmentForm.value.secondaryApprover,
      expenseTemplate: this.templateAssignmentForm.value.expenseTemplate || null,
      effectiveDate: this.templateAssignmentForm.value.effectiveDate
    }
    this.expenseService.addTemplateAssignment(payload).subscribe((res: any) => {
      const newTemplateAssignment = res.data;
      if (this.changeMode == 'Add') {
        this.toast.success('Advance Template Assigned!', 'Successfully')
        this.templateAssignments.push(newTemplateAssignment);
      }
      if (this.changeMode == 'Update') {
        this.toast.success('Advance Template Assignment Updated!', 'Successfully')
        this.changeMode = 'Add';
        this.templateAssignmentForm.get('user').enable();
        this.templateAssignmentForm.get('expenseTemplate').enable();
        this.templateAssignmentForm.get('effectiveDate').enable();
      }
      this.getAssignments();
      this.templateAssignmentForm.reset();
      this.showApproverFields = false;
    },
      (err) => {
        if (this.changeMode == 'Add') { this.toast.error('Advance Template Cannot be created!', 'Error') }
        if (this.changeMode == 'Update') { this.toast.error('Advance Template Cannot be Updated!', 'Error') }
      });

    this.templateAssignmentForm.get('user').disable();
    this.templateAssignmentForm.get('expenseTemplate').disable();
    this.templateAssignmentForm.get('effectiveDate').disable();
  }




  editTemplateAssignment(templateAssignments, index: number) {
    this.changeMode = 'View';
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
