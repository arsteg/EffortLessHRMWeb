import { Component, Input, SimpleChanges, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { FormControl } from '@angular/forms';
import { CompanyService } from 'src/app/_services/company.service';

@Component({
  selector: 'app-tax-calculator',
  templateUrl: './tax-calculator.component.html',
  styleUrls: ['./tax-calculator.component.css']
})
export class TaxCalculatorComponent implements OnInit {
  @Input() isEdit: boolean;
  @Input() selectedRecord: any = null;

  incomeTaxComponentsTotal: { [key: string]: number } = {};
  salaryDetail: any;
  grossSalary: number = 0;
  taxSections: any[] = [];
  taxComponents: any[] = [];
  cityType: string;
  closeResult: string = '';
  fixedAllowanceSum: number = 0;
  variableAllowanceSum: number = 0;
  hraVerifiedTotal: number = 0;
  taxableSalary: number = 0;
  taxPayableOldRegime: number = 0;
  taxSlabs: any;
  user = JSON.parse(localStorage.getItem('currentUser') || '{}');

  // List of all months for HRA
  private allMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Form controls
  grossSalaryControl = new FormControl({ value: 0, disabled: true });
  hraControl = new FormControl({ value: 0, disabled: true });
  sectionControls: { [key: string]: FormControl } = {};

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private taxService: TaxationService,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedRecord'] && this.selectedRecord) {
      this.calculateIncomeTaxComponentsTotal();
      this.calculateHraVerifiedTotal();
      this.updateFormControls();
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.getTaxSections();
    this.getTaxComponents();
    this.getSalaryByUser();
    this.getTaxSlabs();
  }

  calculateIncomeTaxComponentsTotal() {
    this.incomeTaxComponentsTotal = {};
    if (this.selectedRecord?.incomeTaxDeclarationComponent?.length) {
      this.selectedRecord.incomeTaxDeclarationComponent.forEach(declaration => {
        let sectionId = declaration.incomeTaxComponent?.section?._id;
        if (typeof declaration.incomeTaxComponent?.section === 'string') {
          try {
            sectionId = JSON.parse(declaration.incomeTaxComponent.section)._id;
          } catch (e) {
            console.error('Error parsing section:', e);
          }
        }
        const approvedAmount = declaration.approvedAmount || 0;
        if (sectionId) {
          this.incomeTaxComponentsTotal[sectionId] = (this.incomeTaxComponentsTotal[sectionId] || 0) + approvedAmount;
        }
      });
    }
    this.updateFormControls();
  }

  calculateHraVerifiedTotal() {
    this.hraVerifiedTotal = this.selectedRecord?.incomeTaxDeclarationHRA?.reduce((sum, hra) => {
      return sum + (hra.verifiedAmount || 0);
    }, 0) || 0;
    this.hraControl.setValue(this.hraVerifiedTotal);
  }

  getTaxSections() {
    this.taxService.getAllTaxSections().subscribe({
      next: (res: any) => {
        this.taxSections = res.data?.map(section => {
          if (typeof section === 'string') {
            try {
              return JSON.parse(section);
            } catch (e) {
              console.error('Error parsing tax section:', e);
              return null;
            }
          }
          return section;
        }).filter(section => section) || [];
        this.initializeSectionControls();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching tax sections:', err)
    });
  }

  getTaxComponents() {
    this.taxService.getAllTaxComponents({ skip: '', next: '' }).subscribe({
      next: (res: any) => {
        this.taxComponents = res.data?.map(component => {
          if (typeof component.section === 'string') {
            try {
              component.section = JSON.parse(component.section);
            } catch (e) {
              console.error('Error parsing component section:', e);
            }
          }
          return component;
        }) || [];
        this.calculateIncomeTaxComponentsTotal();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching tax components:', err)
    });
  }

  getSalaryByUser() {
    this.userService.getSalaryByUserId(this.user?.id).subscribe({
      next: (res: any) => {
        const record = res.data || [];
        this.salaryDetail = record[record.length - 1];
        if (this.salaryDetail?.enteringAmount === 'Yearly') {
          this.grossSalary = this.salaryDetail?.Amount || 0;
        } else {
          this.grossSalary = (this.salaryDetail?.Amount || 0) * 12;
        }
        this.grossSalaryControl.setValue(this.grossSalary);
        this.calculateSum();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching salary:', err)
    });
  }

  calculateSum() {
    this.fixedAllowanceSum = this.salaryDetail?.fixedAllowanceList?.reduce((sum, allowance) => {
      return sum + (allowance.monthlyAmount || 0);
    }, 0) || 0;
    this.variableAllowanceSum = this.salaryDetail?.variableAllowanceList?.reduce((sum, allowance) => {
      return sum + (allowance.monthlyAmount || 0);
    }, 0) || 0;
  }

  calculateTax() {
    if (this.salaryDetail?.Amount) {
      this.calculateHraVerifiedTotal();
      this.calculateIncomeTaxComponentsTotal();
      const componentDeductions = Object.values(this.incomeTaxComponentsTotal).reduce((sum, amount) => sum + (amount || 0), 0);
      const totalDeductions = (this.hraVerifiedTotal || 0) + componentDeductions;
      this.taxableSalary = this.grossSalary - totalDeductions;
      this.taxPayableOldRegime = this.calculateOldRegimeTax(this.taxableSalary);
      this.cdr.detectChanges();
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

  getTaxSlabs() {
    const payload = { companyId: this.user?.companyId };
    this.companyService.getTaxSlabByCompany(payload).subscribe({
      next: (res: any) => {
        this.taxSlabs = res.data?.find((slab: any) => slab?.regime === 'New Regime');
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching tax slabs:', err)
    });
  }

  initializeSectionControls() {
    this.taxSections.forEach(section => {
      this.sectionControls[section._id] = new FormControl({
        value: this.incomeTaxComponentsTotal[section._id] || 0,
        disabled: true
      });
    });
  }

  updateFormControls() {
    this.hraControl.setValue(this.hraVerifiedTotal || 0);
    Object.keys(this.sectionControls).forEach(sectionId => {
      this.sectionControls[sectionId].setValue(this.incomeTaxComponentsTotal[sectionId] || 0);
    });
    this.cdr.detectChanges();
  }

  getAllComponentsForSection(sectionId: string) {
    const sectionComponents = this.taxComponents.filter(
      component => {
        let componentSectionId = component.section?._id;
        if (typeof component.section === 'string') {
          try {
            componentSectionId = JSON.parse(component.section)._id;
          } catch (e) {
            console.error('Error parsing component section:', e);
            return false;
          }
        }
        return componentSectionId === sectionId;
      }
    ) || [];

    const declaredComponents = this.selectedRecord?.incomeTaxDeclarationComponent?.filter(
      component => {
        let componentSectionId = component.incomeTaxComponent?.section?._id;
        if (typeof component.incomeTaxComponent?.section === 'string') {
          try {
            componentSectionId = JSON.parse(component.incomeTaxComponent.section)._id;
          } catch (e) {
            console.error('Error parsing declared component section:', e);
            return false;
          }
        }
        return componentSectionId === sectionId;
      }
    ) || [];

    const allComponents = sectionComponents.map(component => {
      const declared = declaredComponents.find(
        dc => dc.incomeTaxComponent?._id === component._id
      );
      return {
        _id: component._id,
        componantName: component.componantName || 'Unnamed Component',
        section: component.section,
        approvedAmount: declared ? (declared.approvedAmount || 0) : 0
      };
    });

    const additionalDeclared = declaredComponents.filter(
      dc => !sectionComponents.some(sc => sc._id === dc.incomeTaxComponent?._id)
    ).map(dc => ({
      _id: dc.incomeTaxComponent?._id,
      componantName: dc.incomeTaxComponent?.componantName || 'Unnamed Component',
      section: dc.incomeTaxComponent?.section,
      approvedAmount: dc.approvedAmount || 0
    }));

    return [...allComponents, ...additionalDeclared];
  }

  getAllHraMonths() {
    return this.allMonths.map(month => {
      const hra = this.selectedRecord?.incomeTaxDeclarationHRA?.find(
        h => h.month === month
      );
      return {
        month,
        verifiedAmount: hra ? (hra.verifiedAmount || 0) : 0
      };
    });
  }

  trackBySection(index: number, section: any): string {
    return section._id || index;
  }

  trackByHra(index: number, hra: any): string {
    return hra.month || index;
  }

  trackByComponent(index: number, component: any): string {
    return component._id || index;
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