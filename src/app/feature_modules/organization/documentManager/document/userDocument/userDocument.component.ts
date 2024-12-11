import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DocumentsService } from 'src/app/_services/documents.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
    selector: 'app-user-document',
    templateUrl: './userDocument.component.html'
})
export class UserDocumentComponent implements OnInit {
    userDocuments: any;
    userDocumentForm: FormGroup;
    isEdit = false;
    selectedDocument: any;
    usersList; // This should be fetched from a service
    allDocuments: any;
    // Pagination variables
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 0;
    totalPageArray: number[] = [];

    constructor(private fb: FormBuilder,
        private toast: ToastrService,
        private documentService: DocumentsService,
        private userService: UserService) { }

    ngOnInit(): void {
        this.initForm();
        this.getUserDocuments();
        this.getUsers();
        this.getDocument();
    }

    initForm() {
        this.userDocumentForm = this.fb.group({
            user: ['', Validators.required],
            name: ['', Validators.required],
            date: [''],
            URL: ['']
        });
    }

    getUserDocuments() {
        this.documentService.getDocumentUser().subscribe((res: any) => {
            this.userDocuments = res.data;
        })
    }
    getUserName(id: string) {
        const users = this.usersList?.find((name: any) => name?._id === id)
        return `${users?.firstName}  ${users?.lastName}`
    }
    getUsers() {
        this.userService.getUserList().subscribe(users => {
            this.usersList = users?.data?.data;
        });
    }

    getDocument() {
        this.documentService.getDocument().subscribe((res: any) => {
            this.allDocuments = res.data;
        })
    }

    getDocName(id: string){
        const documentName = this.allDocuments?.find((name:any)=> name?._id === id )
        return documentName?.description;
    }
    addDocument() {
        // Add logic here
    }

    editDocument(document) {
        // Edit logic here
    }

    updateDocument() {
        // Update logic here
    }

    deleteDocument(document) {
        // Delete logic here
    }

    searchDocuments(event) {
        const searchTerm = event.target.value;
        // Implement search logic with the service
    }

    changePage(delta: number) {
        // Pagination logic
        this.currentPage += delta;
        this.getUserDocuments();
    }

    changePageTo(page: number) {
        this.currentPage = page;
        this.getUserDocuments();
    }
}
