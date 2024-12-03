import { Component, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-tax-calculator',
  templateUrl: './tax-calculator.component.html',
  styleUrl: './tax-calculator.component.css'
})
export class TaxCalculatorComponent {
  @Input() isEdit: boolean;
  @Input() selectedRecord: any = null;
  closeResult: string = '';
  incomeTaxDeclarationHRA: any;
  cityType: string;
  totalAmount = 0;
  salaryDetail: any;

  constructor(private modalService: NgbModal,
    private userService: UserService
  ) { }

  ngOnInit() {
    console.log(this.selectedRecord);
    this.userService.getSalaryByUserId(this.selectedRecord.user).subscribe((res: any) => {
      const record = res.data;
        this.salaryDetail = record[record.length - 1];
    });
    // if (this.selectedRecord && this.selectedRecord.incomeTaxDeclarationHRA) {
      const hraRecords = this.selectedRecord.incomeTaxDeclarationHRA;
    
      // Use reduce to sum the rentDeclared fields
      this.incomeTaxDeclarationHRA = hraRecords.reduce((sum, record) => {
         const incomeTaxDeclarationHRA = sum + (record.rentDeclared || 0);
         return incomeTaxDeclarationHRA;
      }, 0);
      console.log('Total Rent Declared:', this.incomeTaxDeclarationHRA);
    // } else {
    //   console.log('No HRA records found.');
    // }
  }

  income: number | null = null;
  hraExemption: number | null = null;
  section80C: number | null = null;
  chapterVIa: number | null = null;
  taxableSalary: number | null = null;

  calculateTax() {
    if (this.salaryDetail?.Amount) {
      const deductions = (this.incomeTaxDeclarationHRA || 0) + (this.section80C || 0) + (this.chapterVIa || 0);
      this.taxableSalary = this.salaryDetail?.Amount - deductions;
    }
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
}