import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
@Component({
  selector: 'app-advance-categories',
  templateUrl: './advance-categories.component.html',
  styleUrl: './advance-categories.component.css'
})
export class AdvanceCategoriesComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  searchText: '';
  isEdit = false;
  field: any = [];
  selectedCategory: any;
  updatedCategory: any;
  originalFields: any[] = [];
  changeMode: 'Add' | 'Update' = 'Add';
  addCategory: FormGroup;
  closeResult: string = '';
  advanceCategories: MatTableDataSource<any>;
  changesMade: boolean = false;
  initialLabelValue: string;
  public sortOrder: string = '';
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  displayedColumns: string[] = ['label', 'actions'];
  dialogRef: MatDialogRef<any>;
  isSubmitted: boolean = false;
  allData: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  columns: TableColumn[] = [
    { key: 'label', name: this.translate.instant('expenses.category_name') },
    {
      key: 'action',
      name: this.translate.instant('expenses.actions'),
      isAction: true,
      options: [
        { label: 'Edit', icon: 'edit', visibility: ActionVisibility.LABEL },
        { label: 'Delete', icon: 'delete', visibility: ActionVisibility.LABEL }
      ]
    }
  ];

  constructor(private fb: FormBuilder,
    private dialog: MatDialog,
    private expenseService: ExpensesService,
    private toast: ToastrService) {
    this.addCategory = this.fb.group({
      label: ['', [Validators.required, Validators.maxLength(30), CustomValidators.labelValidator, CustomValidators.noLeadingOrTrailingSpaces.bind(this)]]
    });
  }

  ngOnInit() {
    this.addCategory.get('label').valueChanges.subscribe(value => {
      this.isSubmitted = false;
    });
    this.getAllAdvanceCategories();
  }


  open(content: any) {
    this.isSubmitted = false;
    this.dialogRef = this.dialog.open(content, {
      width: '600px',
      disableClose: true
    });

    this.dialogRef.afterClosed().subscribe(result => {
      this.closeResult = `Closed with: ${result}`;
    });
  }

  clearselectedRequest() {
    this.addCategory.reset();
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
    this.getAllAdvanceCategories();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.advanceCategories.filter = filterValue.trim().toLowerCase();
  }

  getAllAdvanceCategories() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getAdvanceCatgories(pagination).subscribe((res: any) => {
      this.advanceCategories = new MatTableDataSource(res.data);
      this.totalRecords = res.total;
      this.allData = res.data;
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.addCategory.invalid) {
      this.addCategory.markAllAsTouched();
      this.toast.warning(this.translate.instant('expenses.requiredFields'));
      this.isSubmitted = false;
    }
    else {
      if (!this.isEdit) {
        let payload = {
          label: this.addCategory.value['label'],
        };

        this.expenseService.addAdvanceCategory(payload).subscribe((res: any) => {
          const newCategory = res.data;
          this.toast.success(this.translate.instant('expenses.category_added_success'));
          this.advanceCategories.data.push(newCategory);
          this.advanceCategories._updateChangeSubscription();
          this.addCategory.reset();
          this.dialogRef.close();
        },
          err => {
            this.toast.error(err || this.translate.instant('expenses.category_added_error'));
          });
      }
      if (this.isEdit) {
        let categoryPayload = {
          label: this.addCategory.value['label']
        };

        if (this.addCategory.get('label').dirty) {
          this.expenseService.updateAdvanceCategory(this.selectedCategory?._id, categoryPayload).subscribe((res: any) => {
            this.updatedCategory = res.data._id;
            this.toast.success(this.translate.instant('expenses.category_updated_success'));
            this.addCategory.reset();
            this.isEdit = false;
            this.getAllAdvanceCategories();
            this.dialogRef.close();
          },
            (err) => {
              this.toast.error(err || this.translate.instant('expenses.category_updated_error'));
            });
        }
      }
    }
  }

  editAdvanceCategory() {
    if (this.isEdit) {
      this.addCategory.patchValue({
        label: this.selectedCategory.label,
        expenseCategory: this.selectedCategory._id,
      });
    }
    if (!this.isEdit) {
      this.addCategory.reset();
    }
  }

  deleteAdvancecate(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAdvanceCategory(id);
      }
      err => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      }
    });
  }

  deleteAdvanceCategory(id: string) {
    this.expenseService.deleteAdvanceCategory(id).subscribe((res: any) => {
      this.getAllAdvanceCategories();
      this.toast.success(this.translate.instant('expenses.delete_success'));
    },
      (err) => {
        this.toast.error(err || this.translate.instant('expenses.delete_error'));
      });
  }

  handleAction(event: any, addModal: any) {
    if (event.action.label === 'Edit') {
      this.isEdit = true;
      this.selectedCategory = event.row;
      this.editAdvanceCategory();
      this.open(addModal);
    }
    if (event.action.label === 'Delete') {
      this.deleteAdvancecate(event.row._id);
    }
  }

  onSortChange(event: any) {
    const sorted = this.advanceCategories.data.slice().sort((a, b) => {
      const key = event.active;
      const valueA = a[key];
      const valueB = b[key];
      return event.direction === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
    });
    this.advanceCategories.data = sorted;
  }

  onSearchChange(event: any) {
    this.advanceCategories.data = this.allData?.filter(row => {
      const found = this.columns.some(col => {
        return row[col.key]?.toString().toLowerCase().includes(event.toLowerCase());
      });
      return found;
    });
  }
}