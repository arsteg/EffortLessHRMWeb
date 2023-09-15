import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
// You might need to import and inject a service that interacts with your backend API, similar to AssetManagementService

@Component({
  selector: 'app-company-policy-document',
  templateUrl: './companyPolicyDocument.component.html',
  styleUrls: ['./companyPolicyDocument.component.css']
})
export class CompanyPolicyDocumentComponent implements OnInit {
    documents = [];
    documentForm: FormGroup;
    isEdit = false;
    selectedDocument: any;

    constructor(private fb: FormBuilder, private toast: ToastrService /* , private yourService: YourService */) { }

    ngOnInit(): void {
        this.initForm();
        this.getAllDocuments();
    }

    initForm() {
        this.documentForm = this.fb.group({
          name: ['', Validators.required],
          description: ['', Validators.required],
          url: ['', [Validators.required, Validators.pattern('https?://.+')]] // Basic URL validation
        });
    }

    getAllDocuments() {
        // this.yourService.getAllDocuments().subscribe(response => {
        //     this.documents = response.data
        // });
    }

    addDocument() {
        // Implement adding a document to the backend
    }

    editDocument(doc) {
        this.isEdit = true;
        this.selectedDocument = doc;
        this.documentForm.patchValue(doc);
    }

    updateDocument() {
        // Implement updating a document
    }

    deleteDocument(doc) {
        const result = window.confirm('Are you sure you want to delete this document?');
        if (result) {
            // Implement deleting a document
        }
    }
}
