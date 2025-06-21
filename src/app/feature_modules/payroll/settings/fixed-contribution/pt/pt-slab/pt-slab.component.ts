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
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';
  states: any;
  frequency: string[] = []; // Initialize as empty, to be populated with translated values
  dialogRef!: MatDialogRef<any>;
  eligibleStates = [];
  columns: TableColumn[] = [
    { key: 'state', name: this.translate.instant('payroll.professional-tax.table.state') },
    { key: 'fromAmount', name: this.translate.instant('payroll.professional-tax.table.from') },
    { key: 'toAmount', name: this.translate.instant('payroll.professional-tax.table.to') },
    { key: 'employeeAmount', name: this.translate.instant('payroll.professional-tax.table.pt_amount') },
    { key: 'twelfthMonthAmount', name: this.translate.instant('payroll.professional-tax.table.twelfth_month_amount') },
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
      fromAmount: [0],
      toAmount: [0],
      employeePercentage: [0, Validators.required],
      employeeAmount: [0, Validators.required],
      twelfthMonthValue: [0, Validators.required],
      twelfthMonthAmount: [0, Validators.required],
      frequency: ['Monthly', Validators.required],
    });

    // Translate frequency options
    this.translate.get([
      'payroll.professional-tax.frequency.monthly',
      'payroll.professional-tax.frequency.annually',
      'payroll.professional-tax.frequency.semi_annually',
      'payroll.professional-tax.frequency.bi_monthly',
      'payroll.professional-tax.frequency.quarterly'
    ]).subscribe(translations => {
      this.frequency = [
        translations['payroll.professional-tax.frequency.monthly'],
        translations['payroll.professional-tax.frequency.annually'],
        translations['payroll.professional-tax.frequency.semi_annually'],
        translations['payroll.professional-tax.frequency.bi_monthly'],
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
      case 'Edit': this.selectedRecord = event.row; this.open(modal); break;
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
      state: '',
      fromAmount: 0,
      toAmount: 0,
      employeePercentage: 0,
      employeeAmount: 0,
      twelfthMonthValue: 0,
      twelfthMonthAmount: 0
    });
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
    this.isEdit = true;
    this.ptSlabForm.patchValue(this.selectedRecord);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
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
          this.translate.get(['payroll.professional-tax.toast.error_add', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.error(translations['payroll.professional-tax.toast.error_add'], translations['payroll.professional-tax.title']);
            this.dialogRef.close();
          });
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
          this.translate.get(['payroll.professional-tax.toast.error_update', 'payroll.professional-tax.title']).subscribe(translations => {
            this.toast.error(translations['payroll.professional-tax.toast.error_update'], translations['payroll.professional-tax.title']);
          });
        }
      );
    }
  }

  deleteRecord(_id: string) {
    this.payrollService.deletePTSlab(_id).subscribe(
      (res: any) => {
        const index = this.ptSlab.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.ptSlab.splice(index, 1);
        }
        this.translate.get(['payroll.professional-tax.toast.success_deleted', 'payroll.professional-tax.title']).subscribe(translations => {
          this.toast.success(translations['payroll.professional-tax.toast.success_deleted'], translations['payroll.professional-tax.title']);
        });
      },
      (err) => {
        this.translate.get(['payroll.professional-tax.toast.error_delete', 'payroll.professional-tax.title']).subscribe(translations => {
          this.toast.error(translations['payroll.professional-tax.toast.error_delete'], translations['payroll.professional-tax.title']);
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

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      maxWidth: '600px'
    });
  }

}