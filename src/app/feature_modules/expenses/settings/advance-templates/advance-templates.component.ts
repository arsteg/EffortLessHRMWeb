import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ManageTeamService } from 'src/app/_services/manage-team.service';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-advance-templates',
  templateUrl: './advance-templates.component.html',
  styleUrl: './advance-templates.component.css'
})
export class AdvanceTemplatesComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  searchText: '';
  isEdit = false;
  changeMode: 'Add' | 'Update' = 'Add';
  addAdvanceTempForm: FormGroup;
  closeResult: string = '';
  selectedTemplate: any;
  updatedCategory: any;
  list: any;
  advanceCategories: any = [];
  advanceCategoriesall: any;
  templates: any[] = [];
  categoryList: any;
  matchingCategories: any;
  noofadvancecat: any;
  users: any;
  public sortOrder: string = '';
  p: number = 1;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  displayedColumns: string[] = ['policyLabel', 'advanceCategories', 'actions'];
  dataSource: MatTableDataSource<any>;
  dialogRef: MatDialogRef<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  isSubmitted: boolean = false;
  columns: TableColumn[] = [
    { key: 'policyLabel', name: this.translate.instant('expenses.advance_template_label') },
    { 
      key: 'advanceCategories', 
      name: this.translate.instant('expenses.number_of_advance_categories'),
      valueFn: (row: any) => row?.advanceCategories?.length || 0
    },
    {
      key: 'action',
      name: this.translate.instant('expenses.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH }
      ]
    }
  ];

  constructor(private fb: FormBuilder,
    private expenseService: ExpensesService,
    private toast: ToastrService,
    private dialog: MatDialog,
    private manageService: ManageTeamService) {
    this.addAdvanceTempForm = this.fb.group({
      policyLabel: ['', [Validators.required, Validators.maxLength(30), CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]],
      approvalType: ['employee-wise', Validators.required],
      advanceCategories: [[]],
      firstApprovalEmployee: [''],
    });
  }

  ngOnInit(): void {
    this.getManagers();
    this.getAllTemplates();
    this.getAlladvanceCategories();
    this.addAdvanceTempForm.get('approvalType').valueChanges.subscribe((value: any) => {
      if (value === 'template-wise') {
        this.addAdvanceTempForm.get('firstApprovalEmployee')?.setValidators([Validators.required]);
      } else {
        this.addAdvanceTempForm.get('firstApprovalEmployee')?.clearValidators();
        this.addAdvanceTempForm.get('firstApprovalEmployee')?.setValue(null);
      }
      this.addAdvanceTempForm.get('firstApprovalEmployee')?.updateValueAndValidity();
    });
    this.dataSource = new MatTableDataSource(this.list);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getManagers() {
    this.manageService?.getManagers().subscribe((res: any) => {
      this.users = res.data;
    })
  }

  onCancel() {
    this.isEdit = false;
    this.changeMode == 'Add';
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.addAdvanceTempForm.reset();
  }

  open(content: any) {
    this.isSubmitted = false;
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAllTemplates();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAllTemplates();
  }
  getAllTemplates() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getAdvanceTemplates(pagination).subscribe((res: any) => {
      this.list = res.data;
      this.totalRecords = res.total;
      this.dataSource.data = this.list;
    })
  }

  getAlladvanceCategories() {
    let payload = {
      next: '',
      skip: ''
    }
    this.expenseService.getAdvanceCatgories(payload).subscribe((res: any) => {
      this.advanceCategoriesall = res.data;
    })
  }

  isSelected(categoryId: string): boolean {
    const selectedCategories = this.addAdvanceTempForm.get('advanceCategories').value;
    console.log(selectedCategories.includes(categoryId))
    return selectedCategories.includes(categoryId);
  }

  addAdvanceTemplate() {
    console.log(this.addAdvanceTempForm.value)
    this.isSubmitted = true;
    if (this.addAdvanceTempForm.valid) {
      if (this.changeMode === 'Add') {
        let payload = {
          policyLabel: this.addAdvanceTempForm.value['policyLabel'],
          approvalType: this.addAdvanceTempForm.value['approvalType'],
          firstApprovalEmployee: this.addAdvanceTempForm.value['firstApprovalEmployee'] || null,
          advanceCategories: this.addAdvanceTempForm.value.advanceCategories.map(category => ({ advanceCategory: category })),
        };
        this.expenseService.addAdvanceTemplates(payload).subscribe(
          (res: any) => {
            const newCategory = res.data;
            this.getAllTemplates();

            if (this.advanceCategories.length > 0) {
              let advanceCategories = {
                advanceCategory: newCategory._id
              };
            }
            this.toast.success(this.translate.instant('expenses.template_created_success'));
            this.addAdvanceTempForm.reset();
            this.dialogRef.close();
          },
          err => {
            this.toast.error(err || this.translate.instant('expenses.template_created_error'));
          }
        );
      }
      else if (this.changeMode === 'Update') {
        let payload = {
          policyLabel: this.addAdvanceTempForm.value['policyLabel'],
          approvalType: this.addAdvanceTempForm.value['approvalType'],
          firstApprovalEmployee: this.addAdvanceTempForm.value['firstApprovalEmployee'] || null,
          advanceCategories: this.addAdvanceTempForm.value.advanceCategories.map(category => ({ advanceCategory: category })),
        };
        this.expenseService.updateAdvanceTemplates(this.selectedTemplate._id, payload).subscribe((res: any) => {
          this.addAdvanceTempForm.reset();
          this.toast.success(this.translate.instant('expenses.template_updated_success'));
          this.isEdit = false;
          this.changeMode == 'Add';
          this.getAllTemplates();
          this.dialogRef.close();
        },
          (err) => {
            this.toast.error(this.translate.instant('expenses.template_updated_error'));
          });
      }
    }
    else {
      this.markFormGroupTouched(this.addAdvanceTempForm);
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

  editadvanceCategory() {
    this.isEdit = true;
    this.changeMode = 'Update';
    if (this.isEdit) {
      this.expenseService.getAdvanceTemplateById(this.selectedTemplate?._id).subscribe((res: any) => {
        this.addAdvanceTempForm.patchValue({
          policyLabel: res.data.policyLabel,
          firstApprovalEmployee: res.data.firstApprovalEmployee,
          secondApprovalEmployee: res.data.secondApprovalEmployee,
          approvalType: res.data.approvalType,
          advanceCategories: res.data.advanceCategories.map((advanceCategory: any) => advanceCategory.advanceCategory)
        });
        console.log(this.addAdvanceTempForm.value)
      })
    }
    if (!this.isEdit) {
      this.addAdvanceTempForm.reset();
    }
  }

  deleteAdvancecate(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAdvanceTemlate(id);
      }
      err => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      }
    });
  }

  deleteAdvanceTemlate(id: string) {
    this.expenseService.deleteAdvanceTemplates(id).subscribe((res: any) => {
      this.getAllTemplates();
      this.toast.success(this.translate.instant('expenses.delete_success'));
    },
      (err) => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  handleAction(event: any, addModal: any) {
    if (event.action.label === 'Edit') {
      this.isEdit = true;
      this.selectedTemplate = event.row;
      this.editadvanceCategory();
      this.open(addModal);
    }
    if (event.action.label === 'Delete') {
      this.deleteAdvancecate(event.row._id);
    }
  }

  onSortChange(event: any) {
    const sorted = this.dataSource.data.slice().sort((a, b) => {
      const key = event.active;
      const valueA = key === 'advanceCategories' ? a[key]?.length : a[key];
      const valueB = key === 'advanceCategories' ? b[key]?.length : b[key];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.dataSource.data = sorted;
  }

  onSearchChange(event: any) {
    this.dataSource.data = this.list?.filter(row => {
      const found = this.columns.some(col => {
        if (col.key === 'advanceCategories') {
          return row[col.key]?.length.toString().toLowerCase().includes(event.toLowerCase());
        }
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    });
  }

}

