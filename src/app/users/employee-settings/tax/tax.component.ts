import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { TaxCalculatorComponent } from './tax-calculator/tax-calculator.component';
import { UserService } from 'src/app/_services/users.service';
@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrl: './tax.component.css'
})
export class TaxComponent {
  searchText: string = '';
  selectedRecord: any;
  taxList: any;
  offcanvasData = 'Initial data';
  showOffcanvas: boolean = false;
  isEdit: boolean = false;
  @ViewChild('offcanvasContent', { read: ViewContainerRef }) offcanvasContent: ViewContainerRef;
  @Input() selectedUser: any;
  taxView: boolean;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  uniqueFinancialYears: string[];
  uniqueSections: string[];

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getTaxDeclaration();
  }

  openOffcanvas(isEdit: boolean, record: any = null) {
    this.isEdit = isEdit;
    this.selectedRecord = record;
    this.showOffcanvas = true;

    this.offcanvasContent.clear();

    // Create the component factory
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TaxCalculatorComponent);

    // Create the component and set the inputs
    const componentRef = this.offcanvasContent.createComponent(componentFactory);
    componentRef.instance.selectedRecord = this.selectedRecord;
    componentRef.instance.isEdit = this.isEdit;
  }

  closeOffcanvas() {
    this.showOffcanvas = false;
    this.isEdit = false;
    this.selectedRecord = null;
  }

  getAge(dob: Date) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  goBackToSalaryDetails() {
    this.taxView = false;
    this.taxView = false;

  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getTaxDeclaration();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getTaxDeclaration();
  }


  getTaxDeclaration() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.userService.getTaxDeclarationByUserId(this.selectedUser.id, pagination).subscribe((res: any) => {
      this.taxList = res.data;
      this.uniqueFinancialYears = this.getUniqueFinancialYears(this.taxList);
      this.uniqueSections = this.extractSectionsFromTaxList(this.taxList);
    })
  }
  getUniqueFinancialYears(taxList: any[]): string[] {
    const financialYearsSet = new Set<string>();

    taxList.forEach(item => {
      if (item.financialYear) {
        financialYearsSet.add(item.financialYear);
      }
    });
    return Array.from(financialYearsSet);
  }

  extractSectionsFromTaxList(taxList: any[]): string[] {
    const allSections: string[] = [];

    taxList.forEach(item => {
      if (item.incomeTaxDeclarationComponent) {
        item.incomeTaxDeclarationComponent.forEach(component => {
          if (component.section) {
            allSections.push(component.section);
          }
        });
      }
    });
    console.log(allSections);
    return allSections;
  }
}
