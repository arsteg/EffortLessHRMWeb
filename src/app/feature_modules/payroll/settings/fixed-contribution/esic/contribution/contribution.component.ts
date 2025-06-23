import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core'; // Import TranslateService
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrl: './contribution.component.css'
})
export class ContributionComponent {
  searchText: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  isEdit = false;
  closeResult: string = '';
  selectedRecord: any;
  contribution: any;
  contributionForm: FormGroup;
  allData: any;
  dialogRef: MatDialogRef<any>;
  columns: TableColumn[] = [
    { key: 'employeePercentage', name: this.translate.instant('payroll.employee_percentage') },
    { key: 'employerPercentage', name: this.translate.instant('payroll.employer_percentage') },
    {
      key: 'action',
      name: this.translate.instant('payroll.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: "delete-btn" },
      ]
    },
  ];
  constructor(
    private payroll: PayrollService,
    private modalService: NgbModal,
    private toast: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private translate: TranslateService // Inject TranslateService
  ) {
    this.contributionForm = this.fb.group({
      employeePercentage: [0, Validators.required],
      employerPercentage: [0, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getContribution();
  }

  onSearch(search: any) {
    this.contribution = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(search.toLowerCase());
      });
      return found;
    });
  }


  onPageChange(page: any) {
    this.currentPage = page.pageIndex;
    this.recordsPerPage = page.pageSize
    this.getContribution();
  }

   onAction(event: any, modal: any) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedRecord = event.row;
        this.open(modal);
        this.isEdit = true;
        this.editRecord();
        break;
      case 'Delete': this.deleteDialog(event.row?._id); break;
    }
  }

  getContribution() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.payroll.getContribution(pagination).subscribe(res => {
      this.contribution = res.data;
      this.allData = res.data;
      this.totalRecords = res.total;
    });
  }

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {width: '500px'});
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    if (!this.isEdit) {
      this.payroll.addContribution(this.contributionForm.value).subscribe(
        (res: any) => {
          this.contribution.push(res.data);
          this.translate.get(['esic.toast.success_added', 'esic.title']).subscribe(translations => {
            this.toast.success(translations['esic.toast.success_added'], translations['esic.title']);
          });
          this.clearForm();
          this.dialogRef.close();
        },
        (err) => {
          this.translate.get(['esic.toast.error_add', 'esic.title']).subscribe(translations => {
            this.toast.error(translations['esic.toast.error_add'], translations['esic.title']);
          });
          this.dialogRef.close();
        }
      );
    } else {
      this.payroll.updateContribution(this.selectedRecord._id, this.contributionForm.value).subscribe(
        (res: any) => {
          const index = this.contribution.findIndex(item => item._id === this.selectedRecord._id);
          if (index !== -1) {
            this.contribution[index] = res.data;
          }
          this.translate.get(['esic.toast.success_updated', 'esic.title']).subscribe(translations => {
            this.toast.success(translations['esic.toast.success_updated'], translations['esic.title']);
          });
          this.clearForm();
          this.dialogRef.close();
        },
        (err) => {
          this.translate.get(['esic.toast.error_update', 'esic.title']).subscribe(translations => {
            this.toast.error(translations['esic.toast.error_update'], translations['esic.title']);
          });
          this.dialogRef.close();
        }
      );
    }
  }

  editRecord() {
    this.contributionForm.patchValue(this.selectedRecord);
  }

  clearForm() {
    this.contributionForm.patchValue({
      employeePercentage: 0,
      employerPercentage: 0,
    });
  }

  deleteRecord(_id: string) {
    this.payroll.deleteContribution(_id).subscribe(
      (res: any) => {
        const index = this.contribution.findIndex(res => res._id === _id);
        if (index !== -1) {
          this.contribution.splice(index, 1);
        }
        this.translate.get(['esic.toast.success_deleted', 'esic.title']).subscribe(translations => {
          this.toast.success(translations['esic.toast.success_deleted'], translations['esic.title']);
        });
      },
      (err) => {
        this.translate.get(['esic.toast.error_delete', 'esic.title']).subscribe(translations => {
          this.toast.error(translations['esic.toast.error_delete'], translations['esic.title']);
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
}