import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { CompanyService } from 'src/app/_services/company.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { CustomValidators } from 'src/app/_helpers/custom-validators';

@Component({
  selector: 'app-lwf-slab',
  templateUrl: './lwf-slab.component.html',
  styleUrl: './lwf-slab.component.css'
})
export class LwfSlabComponent {
  states: any;
  lwfSlabs: any;
  allData: any;
  selectedData: any;
  isEdit: boolean = false;
  lwfSLabForm: FormGroup;
  closeResult: string = '';
  recordsPerPage: number = 10;
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';
  selectedState: string = '';
  stateTouched: boolean = false;
  @Input() selectedRecord: any;
  eligibleStates: any;
  route: any;
  isSubmitting: boolean = false;
  dialogRef: MatDialogRef<any>;
  columns: TableColumn[] = [
    { key: 'employeeAmount', name: this.translate.instant('payroll._lwf.slab.table.employee_amount') },
    { key: 'employerAmount', name: this.translate.instant('payroll._lwf.slab.table.employer_amount') },
    { key: 'employeePercentage', name: this.translate.instant('payroll._lwf.slab.table.employee_percentage') },
    { key: 'employerPercentage', name: this.translate.instant('payroll._lwf.slab.table.employer_percentage') },
    { key: 'maxContribution', name: this.translate.instant('payroll._lwf.slab.table.max_contribution') },
    { key: 'minAmount', name: this.translate.instant('payroll._lwf.slab.table.min_amount') },
    { key: 'maxAmount', name: this.translate.instant('payroll._lwf.slab.table.max_amount') },
    { key: 'isActive', name: this.translate.instant('payroll._lwf.slab.table.active') },
    {
      key: 'action',
      name: this.translate.instant('payroll._lwf.slab.table.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn" },
      ]
    },
  ]

  constructor(
    private payrollService: PayrollService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.lwfSLabForm = this.fb.group({
      fixedContribution:['', Validators.required],
      employeeAmount: ['', [Validators.required, CustomValidators.greaterThanOneValidator()]],
      employerAmount:['', [Validators.required, CustomValidators.greaterThanOneValidator()]],
      employeePercentage:['', [CustomValidators.OnlyPostiveNumberValidator()]],
      employerPercentage: ['', [CustomValidators.OnlyPostiveNumberValidator()]],
      maxContribution: ['', [CustomValidators.OnlyPostiveNumberValidator()]],
      minAmount: ['', [CustomValidators.OnlyPostiveNumberValidator()]],
      maxAmount:['', [CustomValidators.OnlyPostiveNumberValidator()]],
    });
  }

  ngOnInit() {
    this.payrollService.getAllStates().subscribe((res: any) => {
      this.eligibleStates = res.data;
    });
    this.getCompanyState();
    this.getLwfSlab();
  }

  onSearch(search: any) {
    this.lwfSlabs = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
  }

  onAction(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedData = event.row;
        this.open(modal);
        this.isEdit = true;
        this.editRecord();
        break;
      case 'Delete': this.deleteDialog(event.row?._id); break;
    }
  }


  onPageChange(page: any) {
    this.currentPage = page.pageIndex;
    this.recordsPerPage = page.pageSize;
    this.getLwfSlab();
  }

  clearForm() {
    this.isEdit = false;
    this.lwfSLabForm.patchValue({
      fixedContribution: this.selectedRecord?._id,
      employeeAmount: 0,
      employerAmount: 0,
      employeePercentage: 0,
      employerPercentage: 0,
      maxContribution: 0,
      minAmount: 0,
      maxAmount: 0
    });
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLwfSlab();
  }

  getLwfSlab() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      state: this.selectedState
    };
    this.payrollService.getLWFByState(pagination).subscribe((res: any) => {
      this.lwfSlabs = res.data;
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  getCompanyState() {
    this.companyService.getCompany().subscribe((res: any) => {
      this.selectedState = res.data.company.state;
      this.getLwfSlab();
    });
  }

  editRecord() {
    console.log(this.selectedData);
    this.lwfSLabForm.patchValue(this.selectedData);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    this.isSubmitting = true;
    if (this.lwfSLabForm.invalid) {            
      this.lwfSLabForm.markAllAsTouched();  // This triggers validation errors
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmitting = false;
      return;
    }
    const payload = {
      ...this.lwfSLabForm.value,
      state: this.selectedState
    };

    if (!this.isEdit) {
      this.payrollService.addLWF(payload).subscribe(
        (res) => {
          this.getLwfSlab();
          this.translate.get(['payroll._lwf.slab.success_added', 'payroll.lwf_title']).subscribe(translations => {
            this.toast.success(translations['payroll._lwf.slab.success_added'], translations['payroll.lwf_title']);
          });
          this.isSubmitting = false;
          this.dialogRef.close();
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll._lwf.slab.error_add');
          this.translate.get('payroll.lwf_title').subscribe(title => {
            this.toast.error(errorMessage, title);
          });
          this.isSubmitting = false;
        }
      );
    } else {
      this.payrollService.updateLWF(this.selectedData._id, payload).subscribe(
        (res) => {
          this.getLwfSlab();
          this.lwfSLabForm.reset();
          this.translate.get(['payroll._lwf.slab.success_updated', 'payroll.lwf_title']).subscribe(translations => {
            this.toast.success(translations['payroll._lwf.slab.success_updated'], translations['payroll.lwf_title']);
          });
          this.isSubmitting = false;
          this.dialogRef.close();
        },
        (err) => {
          const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll._lwf.slab.error_update');
          this.translate.get('payroll.lwf_title').subscribe(title => {
            this.toast.error(errorMessage, title);
          });
          this.isSubmitting = false;
        }
      );
    }
    this.closeModal();
  }

  deleteRecord(_id: string) {
    this.payrollService.deleteLWF(_id).subscribe(
      (res: any) => {
        this.getLwfSlab();
        this.translate.get(['payroll._lwf.slab.success_deleted', 'payroll.lwf_title']).subscribe(translations => {
          this.toast.success(translations['payroll._lwf.slab.success_deleted'], translations['payroll.lwf_title']);
        });
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant('payroll._lwf.slab.error_delete');
        this.translate.get('payroll.lwf_title').subscribe(title => {
          this.toast.error(errorMessage, title);
        });
      }
    );
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }

  handleAdd(modal: any) {
    this.stateTouched = true;
    if (!this.selectedState) {
      this.translate.get('payroll._lwf.slab.warning_state').subscribe(message => {
        this.toast.warning(message);
      });
      return;
    }
    const isStateEligible = this.eligibleStates?.some((state: any) => state === this.selectedState);

    if (!isStateEligible) {
      this.translate.get('payroll._lwf.slab.invalid_company_state').subscribe(message => {
        this.toast.warning(message);
      });
      return;
    } 

    this.isEdit = false;
    this.clearForm();
    this.open(modal);
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '500px'
    })
  }
}