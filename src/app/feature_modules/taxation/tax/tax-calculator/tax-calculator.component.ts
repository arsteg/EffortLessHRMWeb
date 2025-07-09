import { Component, Input, SimpleChanges, OnInit, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
import { FormControl, Validators } from '@angular/forms';
import { CompanyService } from 'src/app/_services/company.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PayrollService } from 'src/app/_services/payroll.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tax-calculator',
  templateUrl: './tax-calculator.component.html',
  styleUrls: ['./tax-calculator.component.css']
})
export class TaxCalculatorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() isEdit: boolean;
  @Input() selectedRecord: any = null;

  incomeTaxComponentsTotal: { [key: string]: number } = {};
  userRegime: string;
  grossSalary: number = 0;
  taxSections: any[] = [];
  taxComponents: any[] = [];
  cityType: string;
  closeResult: string = '';
  hraVerifiedTotal: number = 0;
  taxableSalary: number = 0;
  taxPayableOldRegime: number = 0;
  taxSlabs: any[] = []; // Initialize as empty array

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
    private dialog: MatDialog,
    private userService: UserService,
    private taxService: TaxationService,
    private companyService: CompanyService,private translate: TranslateService,
    private payrollService: PayrollService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getStatutorySetting();
    this.getTaxSections();
    this.getTaxComponents();
    this.getSalaryByUser();
  }

  ngAfterViewInit() {
    if (this.selectedRecord && this.taxComponents.length) {
      this.initializeComponentControls();
      this.initializeHraControls();
      this.calculateIncomeTaxComponentsTotal();
      this.calculateHraVerifiedTotal();
      this.updateFormControls();
      this.subscribeToControlChanges();
      this.cdr.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedRecord'] && this.selectedRecord && this.taxComponents.length) {
      this.initializeComponentControls();
      this.initializeHraControls();
      this.calculateIncomeTaxComponentsTotal();
      this.calculateHraVerifiedTotal();
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
    this.updateFormControls();
  }

  calculateHraVerifiedTotal() {
    this.hraVerifiedTotal = this.selectedRecord?.incomeTaxDeclarationHRA?.reduce((sum, hra) => {
      return sum + (hra.verifiedAmount || 0);
    }, 0) || 0;
    this.hraControl.setValue(this.hraVerifiedTotal, { emitEvent: false });
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
      error: (err) => {
        console.error('Error fetching tax sections:', err);
        this.toastr.error(this.translate.instant('taxation.failed_to_fetch_tax_sections'), this.translate.instant('taxation.toast.error'));
     
      }
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
              this.toastr.error(this.translate.instant('taxation.failed_to_fetch_tax_components'), this.translate.instant('taxation.toast.error'));
    
            }
          }
          return component;
        }) || [];
        if (this.selectedRecord) {
          this.initializeComponentControls();
          this.subscribeToControlChanges();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching tax components:', err);
        this.toastr.error(this.translate.instant('taxation.failed_to_fetch_tax_components'), this.translate.instant('taxation.toast.error'));
    
      }
    });
  }

  getSalaryByUser() {
    this.payrollService.getTaxableSalaryAmountByUserId(this.user?.id).subscribe({
      next: (res: any) => {     
        this.grossSalary = res.data * 12;
        this.grossSalaryControl.setValue(this.grossSalary, { emitEvent: false });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching salary:', err);
        this.toastr.error(this.translate.instant('taxation.failed_to_fetch_salary'), this.translate.instant('taxation.toast.error'));
   
      }
    });
  }

  getStatutorySetting() {
    this.userService.getStatutoryByUserId(this.user?.id).subscribe({
      next: (results: any) => {
        this.userRegime = results.data?.taxRegime || 'Old Regime';
        this.getTaxSlabs(); // Fetch tax slabs after userRegime is set
      },
      error: (err) => {
        this.toastr.error(this.translate.instant('taxation.failed_to_fetch_statutory_settings'), this.translate.instant('taxation.toast.error'));
        this.userRegime = 'Old Regime';
        this.getTaxSlabs();
      }
    });
  }
  calculateTax() {
    if (this.grossSalary) {
      this.incomeTaxComponentsTotal = {};
      Object.keys(this.componentControls).forEach(componentId => {
        const component = this.taxComponents.find(c => c._id === componentId);
        const declared = this.selectedRecord?.incomeTaxDeclarationComponent?.find(
          d => d.incomeTaxComponent?._id === componentId
        );
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
            const approvedAmount = this.componentControls[componentId].value || 0;
            const maximumAmount = declared?.maximumAmount || component.maximumAmount || Infinity;
            const effectiveAmount = Math.min(approvedAmount, maximumAmount);
            this.incomeTaxComponentsTotal[sectionId] = (this.incomeTaxComponentsTotal[sectionId] || 0) + effectiveAmount;
          }
        }
      });
      this.updateFormControls();
      const componentDeductions = Object.values(this.incomeTaxComponentsTotal).reduce((sum, amount) => sum + (amount || 0), 0);
      const totalDeductions = (this.hraVerifiedTotal || 0) + componentDeductions;
      this.taxableSalary = this.grossSalary - totalDeductions;
      this.taxPayableOldRegime = this.calculateTaxByRegime(this.taxableSalary);
      this.cdr.detectChanges();
    }
  }

  calculateTaxByRegime(taxableSalary: number): number {
    let tax = 0;
  
    // Handle edge cases
    if (taxableSalary <= 0) {
       return 0;
    }
  
    if (!this.taxSlabs || this.taxSlabs.length === 0) {
      console.warn('No tax slabs available, using default Old Regime calculation');
      // Fallback to default Old Regime slabs
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

    // Progressive tax calculation
    for (const slab of this.taxSlabs) {
      const min = slab.minAmount ?? 0;
      const max = slab.maxAmount === 0 ? Infinity : (slab.maxAmount ?? Infinity); // Treat maxAmount 0 as unlimited
      const rate = (slab.taxPercentage ?? 0) / 100; // Convert percentage to decimal
  
      if (taxableSalary > min) {
        const taxableInSlab = Math.min(taxableSalary, max) - min;
        const slabTax = taxableInSlab * rate;
        tax += slabTax;       
      }
    }
     return tax;
  }

  getTaxSlabs() {
    if (!this.userRegime) {
      console.warn('userRegime not set, skipping getTaxSlabs');
      this.taxSlabs = [];
      return;
    }
    const payload = { companyId: this.user?.companyId };
    this.companyService.getTaxSlabByCompany(payload).subscribe({
      next: (res: any) => {
        if (Array.isArray(res.data)) {
          this.taxSlabs = res.data.filter((slab: any) => slab?.regime === this.userRegime);
          if (this.taxSlabs.length === 0) {
            console.warn(`No tax slabs found for regime: ${this.userRegime}`);
            this.toastr.warning(this.translate.instant('taxation.no_tax_slabs_found'), this.translate.instant('taxation.toast.error'));
   
          }
        } else {
          console.warn('getTaxSlabs: res.data is not an array', res.data);
          this.taxSlabs = [];
          this.toastr.error(this.translate.instant('taxation.invalid_tax_slab_data'), this.translate.instant('taxation.toast.error'));
   
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching tax slabs:', err);
        this.toastr.error(this.translate.instant('taxation.failed_to_fetch_tax_slabs'), this.translate.instant('taxation.toast.error'));
        this.taxSlabs = [];
      }
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

  initializeComponentControls() {
    this.componentControls = {};
    if (this.selectedRecord?.incomeTaxDeclarationComponent?.length) {
      this.selectedRecord.incomeTaxDeclarationComponent.forEach(declaration => {
        const componentId = declaration.incomeTaxComponent?._id;
        if (componentId) {
          const approvedAmount = declaration.approvedAmount || 0;
          const maximumAmount = declaration.maximumAmount || Infinity;
          if (approvedAmount > maximumAmount) {
            this.toastr.warning(
              `Approved Amount (${approvedAmount}) for ${declaration.incomeTaxComponent?.componantName || 'component'} exceeds Maximum Amount (${maximumAmount})`,
              'Amount Exceeded'
            );
          }
          this.componentControls[componentId] = new FormControl(
            approvedAmount,
            [Validators.min(0), Validators.max(maximumAmount)]
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
  }

  initializeHraControls() {
    this.hraControls = this.allMonths.map(month => {
      const hra = this.selectedRecord?.incomeTaxDeclarationHRA?.find(h => h.month === month);
      return new FormControl(hra ? (hra.verifiedAmount || 0) : 0, [Validators.min(0)]);
    });
  }

  subscribeToControlChanges() {
    this.controlSubscriptions.forEach(sub => sub.unsubscribe());
    this.controlSubscriptions = [];

    Object.keys(this.componentControls).forEach(componentId => {
      const component = this.taxComponents.find(c => c._id === componentId);
      const declared = this.selectedRecord?.incomeTaxDeclarationComponent?.find(
        d => d.incomeTaxComponent?._id === componentId
      );
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
          const maximumAmount = declared?.maximumAmount || component.maximumAmount || Infinity;
          const sub = this.componentControls[componentId].valueChanges.pipe(
            debounceTime(300)
          ).subscribe(value => {
            if (value > maximumAmount) {
              this.toastr.warning(
                `Approved Amount (${value}) for ${component.componantName || 'component'} exceeds Maximum Amount (${maximumAmount})`,
                'Amount Exceeded'
              );
            }
            this.updateSectionTotal(sectionId);
            this.cdr.detectChanges();
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
        this.updateHraTotal();
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  updateHraTotal() {
    const total = this.hraControls.reduce((sum, control) => sum + (control.value || 0), 0);
    this.hraVerifiedTotal = total;
    this.hraControl.setValue(total, { emitEvent: false });
    this.cdr.detectChanges();
  }

  updateFormControls() {
    this.hraControl.setValue(this.hraVerifiedTotal || 0, { emitEvent: false });
    Object.keys(this.sectionControls).forEach(sectionId => {
      this.sectionControls[sectionId].setValue(this.incomeTaxComponentsTotal[sectionId] || 0, { emitEvent: false });
    });   
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
     return allComponents;
  }

  getAllHraMonths() {
    const months = this.allMonths.map((month, index) => ({
      month,
      verifiedAmount: this.hraControls[index]?.value || 0
    }));
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
    this.dialog.open(content, { width: '80%' })
  }
}