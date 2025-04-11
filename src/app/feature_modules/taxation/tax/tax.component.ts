import { Component, ComponentFactoryResolver, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { TaxCalculatorComponent } from './tax-calculator/tax-calculator.component';
import { UserService } from 'src/app/_services/users.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent {
  searchText: string = '';
  selectedRecord: any;
  taxList: any[];
  offcanvasData = 'Initial data';
  showOffcanvas: boolean = false;
  isEdit: boolean = false;
  @ViewChild('offcanvasContent', { read: ViewContainerRef }) offcanvasContent: ViewContainerRef;
  selectedUser: any;
  taxView: boolean;
  totalRecords: number;
  recordsPerPage: number = 10;
  currentPage: number = 1;
  uniqueFinancialYears: string[] = [];
  uniqueSections: string[] = [];
  closeResult: string = '';
  taxDeclarationForm: FormGroup;
  years: string[] = [];
  totalIncomeTaxComponentsLength: any;
  public sortOrder: string = '';
  user = JSON.parse(localStorage.getItem('currentUser'));
  sections: any;
  sectionComponents: any;
  @Output() taxViewChange = new EventEmitter<boolean>();
  taxEditView: boolean = false;

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private taxService: TaxationService,
    private toastr: ToastrService,
  ) {
    this.taxDeclarationForm = this.fb.group({
      financialYear: [''],
      user: [''],
      employeeIncomeTaxDeclarationComponent: [],
      employeeIncomeTaxDeclarationHRA: []
    });
    const currentYear = new Date().getFullYear();
    for (let i = -1; i <= 1; i++) {
      const year = currentYear + i;
      this.years.push(`${year}-${year + 1}`);
    }
  }

  ngOnInit() {
    this.getSections();
    this.userService.getTaxDeclarationByUserId(this.user.id, { skip: '', next: '' }).subscribe((res: any) => {
      this.taxList = res.data;
      this.totalRecords = res.total;
      this.uniqueFinancialYears = this.getUniqueFinancialYears(this.taxList);
    });
  }
  goBackToMainView() {
    this.taxView = false;
    this.taxEditView = false; // Ensure edit view is also hidden
    this.isEdit = false;
    this.selectedRecord = null;
    this.taxViewChange.emit(false);
  }

  // Handle back from edit view
  goBackToSalaryDetails() {
    this.taxView = false;
    this.taxEditView = false; // Hide edit view
    this.isEdit = false;
    this.selectedRecord = null;
  }

  // When opening edit view
  openEditView(tax: any) {
    this.selectedRecord = tax;
    this.isEdit = true;
    this.taxView = false; // Hide calculator
    this.taxEditView = true; // Show edit view
  }
  // When opening calculator view
  openCalculatorView(tax: any) {
    this.selectedRecord = tax;
    this.isEdit = false;
    this.taxView = true;
    this.taxViewChange.emit(true);
  }

  getSections() {
    this.taxService?.getAllTaxSections().subscribe((res: any) => {
      this.sections = res.data;
      this.taxService.getAllTaxComponents({ skip: '', next: '' }).subscribe((res: any) => {
        this.sectionComponents = res.data;
        this.sections.forEach(section => {
          section.componentCount = this.sectionComponents.filter(comp => comp.section._id === section._id).length;
        });
      });
    });
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
    this.taxView = true; // Show calculator
    this.taxEditView = false; // Hide edit view
    this.taxViewChange.emit(true);

    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.userService.getTaxDeclarationByUserId(this.user?.id, pagination).subscribe((res: any) => {
      this.taxList = res.data;

      const sectionIds = this.taxList.flatMap((tax: any) =>
        tax.incomeTaxDeclarationComponent.map((component: any) => component.section)
      );

      const sectionRequests = sectionIds.map((sectionId: string) =>
        this.taxService.getTaxSectionById(sectionId).toPromise()
      );

      forkJoin(sectionRequests).subscribe((sections: any[]) => {
        const allSections = sections.map(section => section.data);

        this.taxList.forEach((tax: any) => {
          const incomeTaxComponents = tax.incomeTaxDeclarationComponent;

          const mappedIncomeTaxComponents = incomeTaxComponents.map((component: any) => ({
            ...component,
            section: allSections.find((section: any) => section._id === component.section)?.section
          }));
          const componentSums = this.calculateComponentSums(mappedIncomeTaxComponents);
          tax.totalRentDeclared = this.getTotalRentDeclared(tax.incomeTaxDeclarationHRA);
          const hra = tax.totalRentDeclared;
          tax.componentSums = { componentSums, hra };
          this.taxService.taxByUser.next(tax.componentSums);
        });
        this.totalRecords = res.total;
        this.uniqueFinancialYears = this.getUniqueFinancialYears(this.taxList);
      });
    });
  }

  calculateComponentSums(components: any[]): any {
    const sums: any = {};
    components.forEach((component: any) => {
      if (!sums[component.section]) {
        sums[component.section] = 0;
      }
      sums[component.section] += component.approvedAmount;
    });
    return sums || 0;
  }

  getTotalRentDeclared(hraList: any[]): number {
    return hraList.reduce((sum, item) => sum + item.rentDeclared, 0);
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
    return allSections;
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

  taxDeclaration() {
    let payload = {
      financialYear: this.taxDeclarationForm.value.financialYear,
      user: this.user.id,
      employeeIncomeTaxDeclarationComponent: [],
      employeeIncomeTaxDeclarationHRA: []
    };
    // if user selected Old regime
    this.userService.getStatutoryByUserId(this.user.id).subscribe((res: any) => {
      if (res.data[0].taxRegime === 'Old Regime') {
        this.taxService.addIncomeTax(payload).subscribe((res: any) => {
          this.taxList.push(res.data);
          this.toastr.success('Tax Declaration Added Successfully');
          this.modalService.dismissAll();
        }, err => {
          this.toastr.error('Something went wrong');
        });
      }
      else if (res.data[0].taxRegime === 'New Regime'){
        this.toastr.error('Tax Declaration is not allowed in New Regime');
        this.modalService.dismissAll();
      }
    });
  }
}