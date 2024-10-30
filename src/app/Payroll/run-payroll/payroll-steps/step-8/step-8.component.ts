import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/_services/common.Service';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-step-8',
  templateUrl: './step-8.component.html',
  styleUrl: './step-8.component.css'
})
export class Step8Component {
  searchText: string = '';
  closeResult: string = '';
  taxForm: FormGroup;
  users: any;
  changeMode: 'Add' | 'Update' = 'Add';
  incomeTax: any;

  constructor(private modalService: NgbModal,
    private fb: FormBuilder,
    private commonService: CommonService,
    private payrollService: PayrollService
  ) {
    this.taxForm = this.fb.group({
      PayrollUser: ['', Validators.required],
      TaxCalculatedMethod: ['', Validators.required],
      TaxCalculated: [0, Validators.required],
      TDSCalculated: [0, Validators.required]
    })
  }

  ngOnInit() {
    this.getAllUsers();
    this.getIncomeTax();
  }

  getAllUsers() {
    this.commonService.populateUsers().subscribe((res: any) => {
      this.users = res.data.data;
    })
  }

  onSubmission() {
    if (this.changeMode == 'Add') {
      this.payrollService.addIncomeTax(this.taxForm.value).subscribe((res: any) => {
        this.incomeTax = res.data;
      })
    }
  }

  getIncomeTax() {
    this.payrollService.getIncomeTax().subscribe((res: any) => {
      this.incomeTax = res.data;
    })
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
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


}
