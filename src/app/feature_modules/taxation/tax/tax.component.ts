import { Component, ComponentFactoryResolver, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { TaxCalculatorComponent } from './tax-calculator/tax-calculator.component';
import { UserService } from 'src/app/_services/users.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.css']
})
export class TaxComponent {
  searchText: string = '';
  selectedRecord: any;
  taxList: any;
  offcanvasData = 'Initial data';
  showOffcanvas: boolean = false;
  isEdit: boolean = false;
  @ViewChild(TaxCalculatorComponent) taxCalculator: TaxCalculatorComponent;
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
  userTaxRegime: any;
  userStatutoryDetails: any;
  taxDeclarations: any;

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private taxService: TaxationService,
    private toastr: ToastrService
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
      this.taxDeclarations = res.data;
      this.totalRecords = res.total;
    });
    this.userService.getStatutoryByUserId(this.user.id).subscribe((res: any) => {
      this.userTaxRegime = res?.data?.taxRegime;
      this.userStatutoryDetails = res?.data;
    });
  }

  goBackToMainView() {
    this.taxView = false;
    this.taxEditView = false;
    this.isEdit = false;
    this.selectedRecord = null;
    this.taxViewChange.emit(false);
  }

  goBackToSalaryDetails() {
    this.taxView = false;
    this.taxEditView = false;
    this.isEdit = false;
    this.selectedRecord = null;
  }

  openEditView(tax: any) {
    this.selectedRecord = tax;
    this.isEdit = true;
    this.taxView = false;
    this.taxEditView = true;
  }

  openCalculatorView(tax: any) {
    this.selectedRecord = tax;
    this.isEdit = false;
    this.taxView = true;
    this.taxViewChange.emit(true);
  }

  getSections() {
    this.taxService?.getAllTaxSections().subscribe((res: any) => {
      this.sections = res.data;
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
    this.taxView = true;
    this.taxEditView = false;
    this.taxViewChange.emit(true);

    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };

    this.userService.getTaxDeclarationByUserId(this.user?.id, pagination).subscribe((res: any) => {
      this.taxList = res.data && res.data.length > 0 ? res.data[res.data.length - 1] : null;
      console.log('getTaxDeclaration taxList:', this.taxList); // Debug: Verify taxList
      this.selectedRecord = this.taxList; // Ensure selectedRecord is set
      console.log('selectedRecord set:', this.selectedRecord); // Debug: Verify selectedRecord

      if (!this.taxList) {
        this.totalRecords = 0;
        return;
      }

      const sectionIds = this.taxList?.incomeTaxDeclarationComponent?.map((component: any) =>
        component?.incomeTaxComponent?.section?._id || component?.section?._id
      ).filter(id => id) || [];

      const sectionRequests = sectionIds.map((sectionId: any) =>
        this.taxService.getTaxSectionById(sectionId).toPromise()
      );

      forkJoin(sectionRequests).subscribe({
        next: (sections: any[]) => {
          const allSections = sections.map(section => section.data);

          const incomeTaxComponents = this.taxList.incomeTaxDeclarationComponent || [];
          const mappedIncomeTaxComponents = incomeTaxComponents.map((component: any) => {
            const sectionId = component?.incomeTaxComponent?.section?._id || component?.section?._id;
            const section = allSections.find((s: any) => s._id === sectionId);
            return {
              ...component,
              section: section ? section.section : 'Unnamed Section'
            };
          });

          const componentSums = this.calculateComponentSums(mappedIncomeTaxComponents);
          this.taxList.totalRentDeclared = this.getTotalRentDeclared(this.taxList.incomeTaxDeclarationHRA || []);
          const hra = this.taxList.totalRentDeclared;
          this.taxList.componentSums = { componentSums, hra };

          this.taxService.taxByUser.next(this.taxList);

          this.totalRecords = res.total || 0;
        },
        error: (err) => {
          console.error('Error fetching sections:', err);
        }
      });
    }, (err) => {
      console.error('Error fetching tax declaration:', err);
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
    if (!this.taxCalculator) {
      console.error('taxCalculator not available');
      this.toastr.error('Tax calculator component not loaded');
      return;
    }

    const payload = {
      financialYear: this.taxDeclarationForm.value.financialYear,
      user: this.user.id,
      employeeIncomeTaxDeclarationComponent: Object.keys(this.taxCalculator.componentControls).map(componentId => ({
        incomeTaxComponent: componentId,
        approvedAmount: this.taxCalculator.componentControls[componentId].value || 0
      })),
      employeeIncomeTaxDeclarationHRA: this.taxCalculator.hraControls.map((control, index) => ({
        month: this.taxCalculator.getAllMonths()[index],
        verifiedAmount: control.value || 0
      }))
    };

    console.log('taxDeclaration payload:', payload); // Debug: Verify payload

    this.userService.getStatutoryByUserId(this.user.id).subscribe((res: any) => {
      if (res.data[0].taxRegime === 'Old Regime') {
        this.taxService.addIncomeTax(payload).subscribe({
          next: (res: any) => {
            this.taxList.push(res.data);
            this.toastr.success('Tax Declaration Added Successfully');
            this.modalService.dismissAll();
          },
          error: (err) => {
            console.error('Error saving tax declaration:', err);
            this.toastr.error('Something went wrong');
          }
        });
      } else if (res.data[0].taxRegime === 'New Regime') {
        this.toastr.error('Tax Declaration is not allowed in New Regime');
        this.modalService.dismissAll();
      }
    });
  }

  getComponentCountForSection(tax: any, section: any): number {
    let componentCount = tax.incomeTaxDeclarationComponent?.filter(
      (comp: any) => comp?.incomeTaxComponent?.section?._id === section._id
    ).length || 0;

    if (section.isHRA === true) {
      componentCount += tax.incomeTaxDeclarationHRA?.length || 0;
    }

    return componentCount;
  }
}