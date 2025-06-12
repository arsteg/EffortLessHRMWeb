import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from 'src/app/_services/documents.service';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-document-Category',
    templateUrl: './documentCategory.component.html',
    styleUrls: ['./documentCategory.component.css']
})
export class DocumentCategoryComponent implements OnInit {
    categories: any;
    filteredCategories = [];
    categoryForm: FormGroup;
    isEdit = false;
    selectedCategory: any;
    columns: TableColumn[] = [
        { key: 'name', name: 'Name' },
        {
            key: 'action',
            name: 'Action',
            isAction: true,
            options: [
                { label: 'Edit', icon: 'edit', visibility: ActionVisibility.BOTH },
                { label: 'Delete', icon: 'delete', visibility: ActionVisibility.BOTH, cssClass: 'text-danger' },
            ]
        }
    ]

    constructor(private fb: FormBuilder, private toast: ToastrService,
        private documentService: DocumentsService, private dialog: MatDialog) { }

    ngOnInit(): void {
        this.initForm();
        this.getAllCategories();
    }

    onActionClick(event) {
        switch (event.action.label) {
            case 'Edit':
                this.editCategory(event.row)
                break;
            case 'Delete':
                this.openDialog(event.row._id)
                break;
        }
    }

    initForm() {
        this.categoryForm = this.fb.group({
            name: ['', Validators.required]
        });
    }

    getAllCategories() {
        this.documentService.getDocumentCategories().subscribe((res: any) => {
            this.categories = res.data;
            this.filteredCategories = this.categories;
        })
    }

    addCategory(form) {
        this.documentService.addDocumentCategories(form).subscribe((res: any) => {
            this.categoryForm.reset();
            this.getAllCategories();
        })
    }

    editCategory(category) {
        this.isEdit = true;
        this.selectedCategory = category;
        this.categoryForm.patchValue(category);
    }

    updateCategory(updateCategory) {
        this.documentService.updateDocumentCategories(this.selectedCategory._id, updateCategory).subscribe((res: any) => {
            this.getAllCategories();
            this.isEdit = false;
            this.categoryForm.reset();
        })
    }

    deleteCategory(id: string) {
        this.documentService.deleteCategory(id).subscribe(res => {
            this.getAllCategories();
        })
    }
    openDialog(id: string): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',

        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'delete') {
                this.deleteCategory(id);
            }
            err => {
                this.toast.error('Deletion failed!', 'Error!')
            }
        });
    }

    onCancel() {
        this.isEdit = false;
        this.categoryForm.reset();
    }


    searchCategories(query: string) {
        if (query) {
            this.filteredCategories = this.categories.filter(category =>
                category.name.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            this.filteredCategories = [...this.categories];
        }
    }
    // ... rest of the methods ...
}
