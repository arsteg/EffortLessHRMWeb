import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { TaxCalculatorComponent } from './tax-calculator/tax-calculator.component';
import { UserService } from 'src/app/_services/users.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ToastrService } from 'ngx-toastr';
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
  closeResult: string = '';
  taxDeclarationForm: FormGroup;
  years: string[] = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
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
      this.totalRecords = res.total;
      this.uniqueFinancialYears = this.getUniqueFinancialYears(this.taxList);
      this.uniqueSections = this.extractSectionsFromTaxList(this.taxList);
      this.taxService.taxByUser.next(res.data);
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
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  taxDeclaration() {
    let payload = {
      financialYear: this.taxDeclarationForm.value.financialYear,
      user: this.selectedUser.id,
      employeeIncomeTaxDeclarationComponent: [],
      employeeIncomeTaxDeclarationHRA: []
    }
    this.taxService.addIncomeTax(payload).subscribe((res: any) => {
      this.taxList.push(res.data);
      this.toastr.success('Tax Declaration Added Successfully');
    },
      err => {
        this.toastr.error('Something went wrong');
      })
  }

}
