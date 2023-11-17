import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from 'src/app/_services/documents.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
// You might need to import and inject a service that interacts with your backend API, similar to AssetManagementService

@Component({
    selector: 'app-company-policy-document',
    templateUrl: './companyPolicyDocument.component.html',
    styleUrls: ['./companyPolicyDocument.component.css']
})
export class CompanyPolicyDocumentComponent implements OnInit {
    companyPolicyDocument: any;
    documentForm: FormGroup;
    isEdit = false;
    selectedDocument: any;
    searchText: string = '';
    constructor(private fb: FormBuilder,
        private toast: ToastrService,
        private documentService: DocumentsService,
        private dialog: MatDialog) { }

    ngOnInit(): void {
        this.initForm();
        this.getCompanyPolicyDocument();
    }
// Custom URL validator function using a regular expression
urlValidator() {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return (control) => {
        const value = control.value;
        if (!value) {
            return null;  // If empty, validation is successful
        }
        return urlPattern.test(value) ? null : { invalidUrl: true };  // Return validation result
    };
}
    initForm() {
        this.documentForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            url: ['', [Validators.required, this.urlValidator()]] // Basic URL validation
        });
    }

    getCompanyPolicyDocument() {
        this.documentService.getCompanyPolicyDocument().subscribe((res: any) => {
            this.companyPolicyDocument = res.data;
        })
    }

    addDocument(documentForm) {
        this.documentService.addCompanyPolicyDocument(documentForm).subscribe((res: any) => {
            this.companyPolicyDocument = res.data;
            this.toast.success('Company Policy Document Added Successfully!');
            this.getCompanyPolicyDocument();
            this.documentForm.reset();
        })
    }

    editDocument(doc) {
        this.isEdit = true;
        this.selectedDocument = doc;
        this.documentForm.patchValue(doc);
    }

    updateDocument(form) {
        this.documentService.updateCompanyPolicyDocument(this.selectedDocument._id, form).
            subscribe((res: any) => {
                this.companyPolicyDocument = res.data;
                this.toast.success('Company Policy Document Updated Successfully!');
                this.getCompanyPolicyDocument();
                this.isEdit = false;
                this.documentForm.reset();
            })
    }

    deleteDocument(id: string) {
        this.documentService.deleteCompanyPolicyDocument(id).subscribe((res: any)=>{
            this.toast.success('Company Policy Document Deleted Successfully!');
            this.getCompanyPolicyDocument();
        })
    }
    openDialog(id: string): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',

        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'delete') {
                this.deleteDocument(id);
            }
            err => {
                this.toast.error('Can not be Deleted', 'Error!')
            }
        });
    }
    onCancel() {
        this.isEdit = false;
        this.documentForm.reset();
    }
}
