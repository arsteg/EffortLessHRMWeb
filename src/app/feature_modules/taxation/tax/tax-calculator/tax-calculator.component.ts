import { Component, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-tax-calculator',
  templateUrl: './tax-calculator.component.html',
  styleUrl: './tax-calculator.component.css'
})
export class TaxCalculatorComponent {
  @Input() isEdit: boolean;
  @Input() selectedRecord: any = null;

  incomeTaxDeclarationHRA: any;
  incomeTaxComponentsTotal: any;
  salaryDetail: any;
  grossSalary: any;
  taxSections: any;
  taxComponents: any;

  cityType: string;
  closeResult: string = '';

  totalAmount: number = 0;
  fixedAllowanceSum: number = 0;
  variableAllowanceSum: number = 0;
  income: number = 0;
  hraExemption: number = 0;
  section80C: number = 0;
  chapterVIa: number = 0;
  taxableSalary: number = 0;
  taxPayableOldRegime: number = 0;
  taxPayableNewRegime: number = 0;

  constructor(private modalService: NgbModal,
    private userService: UserService,
    private taxService: TaxationService
  ) { }

  ngOnInit() {
    this.getTaxSections();
    this.getTaxComponents();
    this.getSalaryByUser();
  }

  getTaxSections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.taxSections = res.data;
      this.filterComponents();
    });
  }

  getTaxComponents() {
    this.taxService.getAllTaxComponents({ skip: '', next: '' }).subscribe((res: any) => {
      this.taxComponents = res.data;
      this.filterComponents();
    });
  }

  filterComponents() {
    if (this.taxSections && this.taxComponents && this.selectedRecord?.incomeTaxDeclarationComponent) {
      this.taxSections.forEach(section => {
        const items = this.taxComponents
          .filter(component => component.section === section._id && this.selectedRecord.incomeTaxDeclarationComponent.some(declaration => declaration.incomeTaxComponent === component._id))
          .map(component => {
            const declaration = this.selectedRecord.incomeTaxDeclarationComponent.find(declaration => declaration.incomeTaxComponent === component._id);
            return {
              name: component.componantName,
              amount: declaration ? declaration.approvedAmount : 0
            };
          });

        section.items = items;
        section.total = items.reduce((sum, item) => sum + item.amount, 0);
      });
    }
  }

  getSalaryByUser() {
    this.userService.getSalaryByUserId(this.selectedRecord.user).subscribe((res: any) => {
      const record = res.data;
      this.salaryDetail = record[record.length - 1];
      if (this.salaryDetail.enteringAmount == 'Yearly') {
        this.grossSalary = this.salaryDetail?.Amount;
      }
      else {
        this.grossSalary = this.salaryDetail?.Amount * 12;
      }
      this.calculateSum();
    });
  }

  calculateSum() {
    if (this.salaryDetail && this.salaryDetail.fixedAllowanceList) {
      this.fixedAllowanceSum = this.salaryDetail.fixedAllowanceList.reduce((sum, allowance) => {
        return sum + (allowance.monthlyAmount || 0);
      }, 0);
    }
    if (this.salaryDetail && this.salaryDetail.variableAllowanceList) {
      this.variableAllowanceSum = this.salaryDetail.variableAllowanceList.reduce((sum, allowance) => {
        return sum + (allowance.monthlyAmount || 0);
      }, 0);
    }
  }

  calculateTax() {
    if (this.salaryDetail?.Amount) {
      const deductions = (this.incomeTaxDeclarationHRA || 0) + (this.section80C || 0) + (this.chapterVIa || 0);
      this.taxableSalary = this.grossSalary - deductions;

      // Calculate tax for old regime
      this.taxPayableOldRegime = this.calculateOldRegimeTax(this.taxableSalary);

      // Calculate tax for new regime
      this.taxPayableNewRegime = this.calculateNewRegimeTax(this.taxableSalary);
    }
  }

  calculateOldRegimeTax(taxableSalary: number): number {
    let tax = 0;
    if (taxableSalary <= 250000) {
      tax = 0;
    } else if (taxableSalary <= 500000) {
      tax = (taxableSalary - 250000) * 0.05;
    } else if (taxableSalary <= 1000000) {
      tax = 12500 + (taxableSalary - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableSalary - 1000000) * 0.3;
    }
    return tax;
  }

  calculateNewRegimeTax(taxableSalary: number): number {
    let tax = 0;
    if (taxableSalary <= 250000) {
      tax = 0;
    } else if (taxableSalary <= 500000) {
      tax = (taxableSalary - 250000) * 0.05;
    } else if (taxableSalary <= 750000) {
      tax = 12500 + (taxableSalary - 500000) * 0.1;
    } else if (taxableSalary <= 1000000) {
      tax = 37500 + (taxableSalary - 750000) * 0.15;
    } else if (taxableSalary <= 1250000) {
      tax = 75000 + (taxableSalary - 1000000) * 0.2;
    } else if (taxableSalary <= 1500000) {
      tax = 125000 + (taxableSalary - 1250000) * 0.25;
    } else {
      tax = 187500 + (taxableSalary - 1500000) * 0.3;
    }
    return tax;
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