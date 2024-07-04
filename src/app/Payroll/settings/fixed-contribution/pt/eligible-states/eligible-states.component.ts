import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-eligible-states',
  templateUrl: './eligible-states.component.html',
  styleUrl: './eligible-states.component.css'
})
export class EligibleStatesComponent {
  searchText: string;
  closeResult: string;
  isEdit: boolean = false;
  eligibleStates: any;
  eligibleStateForm: FormGroup;

  constructor(private modalService: NgbModal,
    private payroll: PayrollService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.getEligibleStates();
  }
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {

      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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

  clearForm() {
    this.isEdit = false;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  getEligibleStates() {
    this.payroll.getEligibleStates().subscribe((data: any) => {
      this.eligibleStates = data.data;
    })
  }

  onSubmission(){
    if(this.isEdit){
      this.payroll.updateEligibleState(this.eligibleStates.id, this.eligibleStateForm.value).subscribe((data: any) => {
        this.eligibleStates = data.data;
        this.closeModal();
      });
    }else{
      this.payroll.addEligibleState(this.eligibleStateForm.value).subscribe((data: any) => {
        this.eligibleStates = data.data;
        this.closeModal();
      });
    }
   

  }
}
