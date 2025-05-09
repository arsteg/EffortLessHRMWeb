import { Component, Input, SimpleChanges, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tax-calculator',
  templateUrl: './tax-calculator.component.html',
  styleUrls: ['./tax-calculator.component.css']
})
export class TaxCalculatorComponent implements OnInit {
  @Input() isEdit: boolean;
  @Input() selectedRecord: any = null;

  incomeTaxDeclarationHRA: any;
  incomeTaxComponentsTotal: { [key: string]: number } = {};
  salaryDetail: any;
  grossSalary: number = 0;
  taxSections: any[] = [];
  taxComponents: any[] = [];

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
 newRegime: number = 0;
  user = JSON.parse(localStorage.getItem('currentUser'));
  hraVerifiedTotal: number = 0;

  // Form controls
  grossSalaryControl = new FormControl({ value: 0, disabled: true });
  hraControl = new FormControl(0);
  sectionControls: { [key: string]: FormControl } = {};

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private taxService: TaxationService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedRecord'] && this.selectedRecord) {
      this.calculateIncomeTaxComponentsTotal();
      this.calculateHraVerifiedTotal();
      this.updateFormControls();
    }
  }

  ngOnInit() {
    this.getTaxSections();
    this.getTaxComponents();
    this.getSalaryByUser();
  }

  calculateIncomeTaxComponentsTotal() {
    if (this.selectedRecord?.incomeTaxDeclarationComponent?.length) {
      this.incomeTaxComponentsTotal = {};
      this.selectedRecord.incomeTaxDeclarationComponent.forEach(declaration => {
        const sectionId = declaration.incomeTaxComponent?.section?._id;
        const approvedAmount = declaration.approvedAmount || 0;
        if (sectionId) {
          this.incomeTaxComponentsTotal[sectionId] = (this.incomeTaxComponentsTotal[sectionId] || 0) + approvedAmount;
        }
      });
    }
  }

  calculateHraVerifiedTotal() {
    if (this.selectedRecord?.incomeTaxDeclarationHRA?.length) {
      this.hraVerifiedTotal = this.selectedRecord.incomeTaxDeclarationHRA.reduce((sum, hra) => {
        return sum + (hra.verifiedAmount || 0);
      }, 0);
      this.hraControl.setValue(this.hraVerifiedTotal);
    }
  }

  getTaxSections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.taxSections = res.data;
      this.initializeSectionControls();
    });
  }

  getTaxComponents() {
    this.taxService.getAllTaxComponents({ skip: '', next: '' }).subscribe((res: any) => {
      this.taxComponents = res.data;
    });
  }

  getSalaryByUser() {
    this.userService.getSalaryByUserId(this.user?.id).subscribe((res: any) => {
      const record = res.data;
      this.salaryDetail = record[record.length - 1];
      if (this.salaryDetail?.enteringAmount === 'Yearly') {
        this.grossSalary = this.salaryDetail?.Amount || 0;
      } else {
        this.grossSalary = (this.salaryDetail?.Amount || 0) * 12;
      }
      this.grossSalaryControl.setValue(this.grossSalary);
      this.calculateSum();
    });
  }

  calculateSum() {
    if (this.salaryDetail?.fixedAllowanceList) {
      this.fixedAllowanceSum = this.salaryDetail.fixedAllowanceList.reduce((sum, allowance) => {
        return sum + (allowance.monthlyAmount || 0);
      }, 0);
    }
    if (this.salaryDetail?.variableAllowanceList) {
      this.variableAllowanceSum = this.salaryDetail.variableAllowanceList.reduce((sum, allowance) => {
        return sum + (allowance.monthlyAmount || 0);
      }, 0);
    }
  }

  calculateTax() {
    if (this.salaryDetail?.Amount) {
        this.calculateHraVerifiedTotal();
        this.calculateIncomeTaxComponentsTotal();
        const componentDeductions = Object.values(this.incomeTaxComponentsTotal || {}).reduce((sum, amount) => sum + (amount || 0), 0);
        const totalDeductions = (this.hraVerifiedTotal || 0) + componentDeductions;
        this.taxableSalary = this.grossSalary - totalDeductions;
        this.taxPayableOldRegime = this.calculateOldRegimeTax(this.taxableSalary);
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

  initializeSectionControls() {
    this.taxSections.forEach(section => {
      this.sectionControls[section._id] = new FormControl(this.incomeTaxComponentsTotal[section._id] || 0);
    });
  }

  updateFormControls() {
    this.hraControl.setValue(this.hraVerifiedTotal || 0);
    Object.keys(this.incomeTaxComponentsTotal).forEach(sectionId => {
      if (this.sectionControls[sectionId]) {
        this.sectionControls[sectionId].setValue(this.incomeTaxComponentsTotal[sectionId] || 0);
      }
    });
  }

  getComponentsForSection(sectionId: string) {
    return this.selectedRecord?.incomeTaxDeclarationComponent?.filter(
      component => component.incomeTaxComponent?.section?._id === sectionId
    ) || [];
  }

  trackBySection(index: number, section: any): string {
    return section._id;
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
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