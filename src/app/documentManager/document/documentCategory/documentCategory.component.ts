import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
// Import your service for DocumentCategory

@Component({
  selector: 'app-document-category',
  templateUrl: './documentcategory.component.html',
  styleUrls: ['./documentcategory.component.css']
})
export class DocumentCategoryComponent implements OnInit {
  categories = [];
  filteredCategories = [];  // <-- Add this line
    categoryForm: FormGroup;
    isEdit = false;
    selectedCategory: any;

    constructor(private fb: FormBuilder, private toast: ToastrService /* , private yourService: YourService */) { }

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
        // Fetch categories from your service
        this.filteredCategories = [...this.categories];
    }

    addCategory() {
        // Implement adding a category to the backend
    }

    editCategory(category) {
        this.isEdit = true;
        this.selectedCategory = category;
        this.categoryForm.patchValue(category);
    }

    updateCategory() {
        // Implement updating a category
    }

    deleteCategory(category) {
        const result = window.confirm('Are you sure you want to delete this category?');
        if (result) {
            // Implement deleting a category
        }
    }


    searchCategories(query: any) {
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
