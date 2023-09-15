import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-document',
  templateUrl: './userDocument.component.html'
})
export class UserDocumentComponent implements OnInit {
    userDocuments: any[];
    userDocumentForm: FormGroup;
    isEdit = false;
    selectedDocument: any;
    usersList: string[] = []; // This should be fetched from a service

    // Pagination variables
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 0;
    totalPageArray: number[] = [];

    constructor(private fb: FormBuilder, private toast: ToastrService) {}

    ngOnInit(): void {
        this.initForm();
        this.getUserDocuments();
        this.getUsers(); // Fetch list of users
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
        // Fetch documents and handle pagination logic here
        // For simplicity, we'll assume the service provides paginated results
        // this.documentManagementService.getAllDocuments(this.currentPage, this.itemsPerPage).subscribe(response => {
        //     this.userDocuments = response.data;
        //     this.totalPages = response.totalPages;
        //     this.totalPageArray = Array.from({length: this.totalPages}, (_, i) => i + 1);
        // });
    }

    getUsers() {
        // Fetch list of users
        // this.userService.getAllUsers().subscribe(users => {
        //     this.usersList = users;
        // });
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
