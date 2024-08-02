import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  searchText: string = '';
  companyForm: FormGroup;
  isEdit: boolean = false;
  closeResult: string;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
  ) {
    this.companyForm = this.fb.group({

    })
  }

  ngOnInit() {
  }

  onSubmission() {
    console.log(this.companyForm.value);
  }
  clearselectedRequest() {
    this.isEdit = false;
    this.companyForm.reset();
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  open(content: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

}
