import { Component, Input, SimpleChanges, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { FormControl, Validators } from '@angular/forms';
import { CompanyService } from 'src/app/_services/company.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-tax-calculator',
  templateUrl: './tax-calculator.component.html',
  styleUrls: ['./tax-calculator.component.css']
})
export class TaxCalculatorComponent implements OnInit, OnDestroy {
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
  componentControls: { [key: string]: FormControl } = {};
  hraControls: FormControl[] = [];

  // Subscriptions for value changes
  private controlSubscriptions: Subscription[] = [];

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private taxService: TaxationService,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getTaxSections();
    this.getTaxComponents();
    this.getSalaryByUser();
    this.getTaxSlabs();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedRecord'] && this.selectedRecord) {
      console.log('ngOnChanges selectedRecord:', JSON.stringify(this.selectedRecord, null, 2)); // Debug
      this.calculateIncomeTaxComponentsTotal();
      this.calculateHraVerifiedTotal();
      this.initializeComponentControls();
      this.initializeHraControls();
      this.updateFormControls();
      this.subscribeToControlChanges();
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    this.controlSubscriptions.forEach(sub => sub.unsubscribe());
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
    console.log('calculateIncomeTaxComponentsTotal:', this.incomeTaxComponentsTotal); // Debug
    this.updateFormControls();
  }

  calculateHraVerifiedTotal() {
    this.hraVerifiedTotal = this.selectedRecord?.incomeTaxDeclarationHRA?.reduce((sum, hra) => {
      return sum + (hra.verifiedAmount || 0);
    }, 0) || 0;
    this.hraControl.setValue(this.hraVerifiedTotal, { emitEvent: false });
    console.log('calculateHraVerifiedTotal:', this.hraVerifiedTotal); // Debug
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
        console.log('taxSections:', this.taxSections); // Debug
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
        console.log('taxComponents:', this.taxComponents); // Debug
        this.initializeComponentControls();
        this.subscribeToControlChanges();
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
        this.grossSalaryControl.setValue(this.grossSalary, { emitEvent: false });
        this.calculateSum();
        this.cdr.detectChanges();
        console.log('salaryDetail:', this.salaryDetail); // Debug
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
      this.incomeTaxComponentsTotal = {};
      Object.keys(this.componentControls).forEach(componentId => {
        const component = this.taxComponents.find(c => c._id === componentId);
        if (component) {
          let sectionId = component.section?._id;
          if (typeof component.section === 'string') {
            try {
              sectionId = JSON.parse(component.section)._id;
            } catch (e) {
              console.error('Error parsing section:', e);
            }
          }
          if (sectionId) {
            this.incomeTaxComponentsTotal[sectionId] = (this.incomeTaxComponentsTotal[sectionId] || 0) + (this.componentControls[componentId].value || 0);
          }
        }
      });
      this.updateFormControls();
      const componentDeductions = Object.values(this.incomeTaxComponentsTotal).reduce((sum, amount) => sum + (amount || 0), 0);
      const totalDeductions = (this.hraVerifiedTotal || 0) + componentDeductions;
      this.taxableSalary = this.grossSalary - totalDeductions;
      this.taxPayableOldRegime = this.calculateOldRegimeTax(this.taxableSalary);
      console.log('calculateTax:', { taxableSalary: this.taxableSalary, taxPayableOldRegime: this.taxPayableOldRegime, componentDeductions }); // Debug
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
    console.log('sectionControls:', Object.keys(this.sectionControls)); // Debug
  }

  initializeComponentControls() {
    this.componentControls = {};
    if (this.selectedRecord?.incomeTaxDeclarationComponent?.length) {
      this.selectedRecord.incomeTaxDeclarationComponent.forEach(declaration => {
        const componentId = declaration.incomeTaxComponent?._id;
        if (componentId) {
          this.componentControls[componentId] = new FormControl(
            declaration.approvedAmount || 0,
            [Validators.min(0), Validators.max(declaration.maximumAmount || Infinity)]
          );
        } else {
          console.warn('Missing componentId in declaration:', declaration); // Debug
        }
      });
    }
    this.taxComponents.forEach(component => {
      if (!this.componentControls[component._id]) {
        this.componentControls[component._id] = new FormControl(
          0,
          [Validators.min(0), Validators.max(component.maximumAmount || Infinity)]
        );
      }
    });
    console.log('initializeComponentControls:', Object.keys(this.componentControls).map(id => ({
      id,
      value: this.componentControls[id].value
    }))); // Debug
  }

  initializeHraControls() {
    this.hraControls = this.allMonths.map(month => {
      const hra = this.selectedRecord?.incomeTaxDeclarationHRA?.find(h => h.month === month);
      return new FormControl(hra ? (hra.verifiedAmount || 0) : 0, [Validators.min(0)]);
    });
    console.log('initializeHraControls:', this.hraControls.map(c => c.value)); // Debug
  }

  subscribeToControlChanges() {
    this.controlSubscriptions.forEach(sub => sub.unsubscribe());
    this.controlSubscriptions = [];

    Object.keys(this.componentControls).forEach(componentId => {
      const component = this.taxComponents.find(c => c._id === componentId);
      if (component) {
        let sectionId = component.section?._id;
        if (typeof component.section === 'string') {
          try {
            sectionId = JSON.parse(component.section)._id;
          } catch (e) {
            console.error('Error parsing section:', e);
          }
        }
        if (sectionId) {
          const sub = this.componentControls[componentId].valueChanges.pipe(
            debounceTime(300) // Debounce to reduce rapid updates
          ).subscribe(value => {
            console.log(`componentControl(${componentId}) changed:`, value); // Debug
            this.updateSectionTotal(sectionId);
          });
          this.controlSubscriptions.push(sub);
        } else {
          console.warn(`No sectionId for component ${componentId}`); // Debug
        }
      } else {
        console.warn(`Component ${componentId} not found in taxComponents`); // Debug
      }
    });

    this.hraControls.forEach((control, index) => {
      const sub = control.valueChanges.pipe(
        debounceTime(300)
      ).subscribe(value => {
        console.log(`hraControl(${this.allMonths[index]}) changed:`, value); // Debug
        this.updateHraTotal();
      });
      this.controlSubscriptions.push(sub);
    });
  }

  updateSectionTotal(sectionId: string) {
    const components = this.getAllComponentsForSection(sectionId);
    const total = components.reduce((sum, component) => {
      const value = this.componentControls[component._id]?.value || 0;
      return sum + value;
    }, 0);
    this.incomeTaxComponentsTotal[sectionId] = total;
    if (this.sectionControls[sectionId]) {
      this.sectionControls[sectionId].setValue(total, { emitEvent: false });
    }
    console.log(`updateSectionTotal(${sectionId}):`, total); // Debug
    this.cdr.detectChanges();
  }

  updateHraTotal() {
    const total = this.hraControls.reduce((sum, control) => sum + (control.value || 0), 0);
    this.hraVerifiedTotal = total;
    this.hraControl.setValue(total, { emitEvent: false });
    console.log('updateHraTotal:', total); // Debug
    this.cdr.detectChanges();
  }

  updateFormControls() {
    this.hraControl.setValue(this.hraVerifiedTotal || 0, { emitEvent: false });
    Object.keys(this.sectionControls).forEach(sectionId => {
      this.sectionControls[sectionId].setValue(this.incomeTaxComponentsTotal[sectionId] || 0, { emitEvent: false });
    });
    console.log('updateFormControls:', Object.keys(this.sectionControls).map(id => ({
      id,
      value: this.sectionControls[id].value
    }))); // Debug
    this.cdr.detectChanges();
  }

  getAllComponentsForSection(sectionId: string) {
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

    const allComponents = [...declaredComponents, ...sectionComponents.filter(
      sc => !declaredComponents.some(dc => dc.incomeTaxComponent?._id === sc._id)
    )].map(item => {
      const isDeclared = item.incomeTaxComponent !== undefined;
      const component = isDeclared ? item.incomeTaxComponent : item;
      const approvedAmount = this.componentControls[component._id]?.value ?? (isDeclared ? (item.approvedAmount || 0) : 0);
      return {
        _id: component._id,
        componantName: component.componantName || 'Unnamed Component',
        maximumAmount: isDeclared ? (item.maximumAmount || 0) : (component.maximumAmount || 0),
        section: component.section,
        approvedAmount
      };
    });

    console.log(`getAllComponentsForSection(${sectionId}):`, allComponents); // Debug
    return allComponents;
  }

  getAllHraMonths() {
    const months = this.allMonths.map((month, index) => ({
      month,
      verifiedAmount: this.hraControls[index]?.value || 0
    }));
    console.log('getAllHraMonths:', months); // Debug
    return months;
  }

  getAllMonths(): string[] {
    return this.allMonths;
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