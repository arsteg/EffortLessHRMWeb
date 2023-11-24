import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from 'src/app/_services/documents.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';


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
    categories: any;

    constructor(private fb: FormBuilder,
         private toast: ToastrService,
         private documentService: DocumentsService,
         private dialog: MatDialog) { }

    ngOnInit(): void {
        this.initForm();
        this.getAllDocuments();
        this.getAllCategories();
    }

    initForm() {
        this.documentForm = this.fb.group({
          category: ['', Validators.required],
          description: ['', Validators.required]
        });
    }

    getAllDocuments() {
        this.documentService.getDocument().subscribe(response => {
            this.documents = response.data;
            this.filteredDocuments = this.documents;
        });
    }

    getCategoryName(id: string){
        const categoryName = this.categories?.find((category: any) => category?._id === id);
        return categoryName?.name;
    }

    getAllCategories() {
        this.documentService.getDocumentCategories().subscribe((res: any) => {
            this.categories = res.data;
        });
    }
    searchDocuments(query: string) {
        if (query) {
            this.filteredDocuments = this.documents.filter(doc =>
                doc.description.toLowerCase().includes(query.toLowerCase())
            );
        } else {
            this.filteredDocuments = [...this.documents];
        }
    }

    addDocument() {
        console.log(this.documentForm.value)
        this.documentService.addDocument(this.documentForm.value).subscribe(response => {
            this.toast.success('Document added successfully!');
            this.getAllDocuments();
            this.documentForm.reset();
        });
    }
    onCancel(){
        this.isEdit = false;
        this.documentForm.reset();
    }
    editDocument(doc) {
        this.isEdit = true;
        this.selectedDocument = doc;
        this.documentForm.patchValue(doc);
    }

    updateDocument() {
        this.documentService.updateDocument(this.selectedDocument._id, this.documentForm.value).subscribe(response => {
            this.toast.success('Document updated successfully!');
            this.getAllDocuments();
            this.isEdit = false;
            this.documentForm.reset();
        });
    }

    deleteDocument(id: string) {

            this.documentService.deleteDocument(id).subscribe(response => {
                this.toast.success('Document deleted successfully!');
                this.getAllDocuments();
            });

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
}
