import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
    documents = [];
    filteredDocuments = [];
    documentForm: FormGroup;
    isEdit = false;
    selectedDocument: any;

    // Sample categories. Ideally, fetch this from your backend.
    categories = ['Category1', 'Category2', 'Category3'];

    constructor(private fb: FormBuilder, private toast: ToastrService) { }

    ngOnInit(): void {
        this.initForm();
        this.getAllDocuments();
    }

    initForm() {
        this.documentForm = this.fb.group({
          category: ['', Validators.required],
          description: ['', Validators.required]
        });
    }

    getAllDocuments() {
        // this.documentManagementService.getAllDocuments().subscribe(response => {
        //     this.documents = response.data;
        //     this.filteredDocuments = [...this.documents];
        // });
    }

    searchDocuments(query: any) {
        if (query) {
            this.filteredDocuments = this.documents.filter(doc =>
                doc.description.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            this.filteredDocuments = [...this.documents];
        }
    }

    addDocument() {
        // this.documentManagementService.addDocument(this.documentForm.value).subscribe(response => {
        //     this.toast.success('Document added successfully!');
        //     this.getAllDocuments();
        //     this.documentForm.reset();
        // });
    }

    editDocument(doc) {
        this.isEdit = true;
        this.selectedDocument = doc;
        this.documentForm.patchValue(doc);
    }

    updateDocument() {
        // this.documentManagementService.updateDocument(this.selectedDocument._id, this.documentForm.value).subscribe(response => {
        //     this.toast.success('Document updated successfully!');
        //     this.getAllDocuments();
        //     this.isEdit = false;
        //     this.documentForm.reset();
        // });
    }

    deleteDocument(doc) {
        const result = window.confirm('Are you sure you want to delete this document?');
        if (result) {
            // this.documentManagementService.deleteDocument(doc._id).subscribe(response => {
            //     this.toast.success('Document deleted successfully!');
            //     this.getAllDocuments();
            // });
        }
    }
}
