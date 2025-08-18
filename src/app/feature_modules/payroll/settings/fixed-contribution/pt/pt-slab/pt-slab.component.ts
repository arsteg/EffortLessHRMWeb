import { Component } from '@angular/core';
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
  selector: 'app-pt-slab',
  templateUrl: './pt-slab.component.html',
  styleUrl: './pt-slab.component.css'
})
export class PtSlabComponent {
  ptSlab: any;
  allData: any;
  selectedRecord: any;
  isEdit: boolean = false;
  ptSlabForm: FormGroup;
  closeResult: string = '';
  recordsPerPage: number = 10;
  selectedState: string = '';
  
  isSubmitting: boolean = false;
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';
  states: any;  
  stateTouched: boolean = false;
  frequency: string[] = []; // Initialize as empty, to be populated with translated values
  dialogRef!: MatDialogRef<any>;
  eligibleStates = [];
  columns: TableColumn[] = [
    { key: 'state', name: this.translate.instant('payroll.professional-tax.table.state') },
    { key: 'fromAmount', name: this.translate.instant('payroll.professional-tax.table.from') },
    { key: 'toAmount', name: this.translate.instant('payroll.professional-tax.table.to') },
    { key: 'employeePercentage', name: this.translate.instant('payroll.professional-tax.table.pt_percentage') },
    { key: 'employeeAmount', name: this.translate.instant('payroll.professional-tax.table.pt_amount') },
    { key: 'frequency', name: this.translate.instant('payroll.professional-tax.table.frequency') },
    {
      key: 'action',
      name: this.translate.instant('payroll.professional-tax.table.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn" },
      ]
    },
  ]

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private companyService: CompanyService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.ptSlabForm = this.fb.group({
      state: ['', Validators.required],
      fromAmount: ['', [CustomValidators.OnlyPostiveNumberValidator()]],
      toAmount: ['', [CustomValidators.OnlyPostiveNumberValidator()]],
      employeePercentage: ['', [Validators.required, CustomValidators.OnlyPostiveNumberValidator()]],
      employeeAmount: ['', [Validators.required, CustomValidators.OnlyPostiveNumberValidator()]],
      frequency: ['Monthly', Validators.required],
    });

    // Translate frequency options
    this.translate.get([
      'payroll.professional-tax.frequency.monthly',
      'payroll.professional-tax.frequency.annually',
      'payroll.professional-tax.frequency.semi_annually',
      'payroll.professional-tax.frequency.quarterly'
    ]).subscribe(translations => {
      this.frequency = [
        translations['payroll.professional-tax.frequency.monthly'],
        translations['payroll.professional-tax.frequency.annually'],
        translations['payroll.professional-tax.frequency.semi_annually'],
        translations['payroll.professional-tax.frequency.quarterly']
      ];
    });
  }

  ngOnInit() {
    this.getStates();
    this.getCompanyState();
    this.getPtSlab();
  }

  onAction(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit': this.selectedRecord = event.row; this.openEditModel(modal); break;
      case 'Delete': this.deleteDialog(event.row?._id); break;
    }
  }

  getCompanyState() {
    this.companyService.getCompany().subscribe((res: any) => {
      const companyState = res?.data?.company?.state;     
      if (companyState) {
        this.ptSlabForm.patchValue({ state: companyState });
        this.ptSlabForm.get('state').disable();
      }
      this.selectedState=companyState;
    });
  }

  getStates() {
    this.payrollService.getAllStates().subscribe((res: any) => {
      this.eligibleStates = res.data;
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;

    this.getPtSlab();
  }

  onSearch(search) {
    this.ptSlab = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    }
    );
  }

  clearForm() {
    this.ptSlabForm.patchValue({     
      fromAmount: 0,
      toAmount: 0,
      employeePercentage: 0,
      employeeAmount: 0,
    });
    this.ptSlabForm.get('state')?.disable();
    this.isSubmitting = false;
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getPtSlab();
  }

  getPtSlab() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payrollService.getPTSlab(pagination).subscribe((res: any) => {
      this.ptSlab = res.data;
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  editRecord() {   
    console.log(this.selectedRecord);
    this.ptSlabForm.patchValue(this.selectedRecord);
    this.isEdit = true;
    this.ptSlabForm.get('state')?.disable();
    this.isSubmitting = false;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {

    this.ptSlabForm.get('state')?.enable();
    this.isSubmitting = true;
    if (this.ptSlabForm.invalid) {            
      this.ptSlabForm.markAllAsTouched();  // This triggers validation errors
      this.toast.error(this.translate.instant('payroll.RequiredFieldAreMissing'), 'Error!');
      this.isSubmitting = false;
      return;
    }
    const payload = {
      ...this.ptSlabForm.value
    };
    if (!this.isEdit) {
      this.payrollService.addPTSlab(this.ptSlabForm.value).subscribe(
        (res) => {
          this.getPtSlab();
          this.clearForm();
          this.translate.get(['payroll.professional-tax.toast.success_added', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.success(translations['payroll.professional-tax.toast.success_added'], translations['payroll.professional-tax.title']);
          });
          this.dialogRef.close();
        },
        (err) => {          
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.professional-tax.toast.error_add')
          ;
          this.toast.error(errorMessage);               
          this.dialogRef.close();
          this.ptSlabForm.get('state')?.disable();
          this.isSubmitting = false;
        }
      );
    } else {
      this.payrollService.updatePTSlab(this.selectedRecord._id, payload).subscribe(
        (res) => {
          this.getPtSlab();
          this.clearForm();
          this.translate.get(['payroll.professional-tax.toast.success_updated', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.success(translations['payroll.professional-tax.toast.success_updated'], translations['payroll.professional-tax.title']);
          });
         
        },
        (err) => {          
          const errorMessage = err?.error?.message || err?.message || err 
          ||  this.translate.instant('payroll.professional-tax.toast.error_update')
          ;
          this.toast.error(errorMessage);   
          this.ptSlabForm.get('state')?.disable();
          this.isSubmitting = false;
        }
      );
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deletePTSlab(_id).subscribe(
      (res: any) => {
        this.getPtSlab();
        this.translate.get(['payroll.professional-tax.toast.success_deleted', 'payroll.professional-tax.title']).subscribe(translations => {
          this.toast.success(translations['payroll.professional-tax.toast.success_deleted'], translations['payroll.professional-tax.title']);
        });
      },
      (err) => {        
        const errorMessage = err?.error?.message || err?.message || err 
        ||  this.translate.instant('payroll.professional-tax.toast.error_delete')
        ;
        this.toast.error(errorMessage);  
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

  openEditModel(content: any) {
    this.ptSlabForm.patchValue(this.selectedRecord);
    this.isEdit = true;
    this.ptSlabForm.get('state')?.disable();
    this.isSubmitting = false;
    this.dialogRef = this.dialog.open(content, {
      maxWidth: '600px'
    });
    this.open(content);
  }
  open(content: any) {   
    this.dialogRef = this.dialog.open(content, {
      maxWidth: '600px'
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
}