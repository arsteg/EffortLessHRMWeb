import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog'; // Update import statement
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from 'src/app/_services/documents.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-document-Category',
    templateUrl: './documentCategory.component.html',
    styleUrls: ['./documentCategory.component.css']
})
export class DocumentCategoryComponent implements OnInit {
    categories: any;
    filteredCategories = [];  // <-- Add this line
    categoryForm: FormGroup;
    isEdit = false;
    selectedCategory: any;

    constructor(private fb: FormBuilder, private toast: ToastrService,
        private documentService: DocumentsService, private dialog: MatDialog) { }

    ngOnInit(): void {
        this.initForm();
        this.getAllCategories();
    }

    initForm() {
        this.categoryForm = this.fb.group({
            name: ['', Validators.required]
        });
    }

    getAllCategories() {
        this.documentService.getDocumentCategories().subscribe((res: any) => {
            this.categories = res.data;
            this.filteredCategories =this.categories;
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
      this.documentService.deleteCategory(id).subscribe(res=>{
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

    onCancel(){
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
