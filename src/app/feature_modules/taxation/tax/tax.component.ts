import { Component, ComponentFactoryResolver, EventEmitter, Output, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TaxCalculatorComponent } from './tax-calculator/tax-calculator.component';
import { UserService } from 'src/app/_services/users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaxationService } from 'src/app/_services/taxation.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

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
  @ViewChild('addModal') addModal!: TemplateRef<any>;
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
  userSalaryDetails: any;
  taxDeclarations: any;
  columns: TableColumn[] = [
    { key: 'financialYear', name: 'Financial Year' },
  ]
  dialogRef: MatDialogRef<any>;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private taxService: TaxationService,  private translate: TranslateService,
    private toast: ToastrService
  ) {
    this.taxDeclarationForm = this.fb.group({
      financialYear: ['', Validators.required],
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
   this.getTaxDeclarationList();
    this.userService.getStatutoryByUserId(this.user.id).subscribe((res: any) => {
      this.userTaxRegime = res?.data?.taxRegime;
      this.userStatutoryDetails = res?.data;
     });
     this.userService.getSalaryByUserId(this.user.id).subscribe((res: any) => {    
      this.userSalaryDetails = res?.data;
     });
     
  }
  getTaxDeclarationList(){
    this.userService.getTaxDeclarationByUserId(this.user.id, { skip: '', next: '' }).subscribe((res: any) => {
      this.taxDeclarations = res.data;
      this.totalRecords = res.total;
    });
  }
  handleAddTaxDeclaration() {
    if (this.userTaxRegime !== 'Old Regime') {
      this.toast.warning(this.translate.instant('taxation.tax_declaration_allow'), this.translate.instant('taxation.toast.warning'));
       return;
    }
    if (!this.userSalaryDetails) {
      this.toast.warning(this.translate.instant('taxation.salary_details_Validation_for_tax_declaration'), this.translate.instant('taxation.toast.warning'));
      return;
    }
  
    if (!this.userStatutoryDetails) {
      this.toast.warning(this.translate.instant('taxation.statutory_Validation_for_tax_declaration'), this.translate.instant('taxation.toast.warning'));
      return;
    }
  
    this.isEdit = false;
    this.open(this.addModal); // or whatever modal reference you're using
  }
  
  
  handleOpenTaxCalculator() {
    if (!this.userStatutoryDetails) {
       this.toast.warning(this.translate.instant('taxation.statutory_Validation_for_tax_calculator'), this.translate.instant('taxation.toast.warning'));
       return;
    }
    else{  
    this.getTaxDeclaration();
    this.taxEditView = false;
    this.taxView = true;
    }
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
      this.sections.forEach((section: any) => {
        const column = {
          key: section?.section,
          name: section?.section,
          valueFn: (row: any) => this.getComponentCountForSection(row, section)
        };

        this.columns.push(column);
      });

      const actionColumn = {
        key: 'actions',
        name: 'Actions',
        isAction: true,
        options: [
          {
            label: 'Edit',
            icon: 'edit',
            visibility: ActionVisibility.LABEL
          },
        ]
      };
      this.columns.push(actionColumn);
    });
  }

  onActionClick(event: any) {
    switch (event.action.label) {
      case 'Edit':
        this.selectedRecord = event.row; 
        this.isEdit = true; 
        this.taxView = false; 
        this.taxEditView = true;
        break;
    }
  }


  onPageChange(page: any) {
    this.currentPage = page.pageIndex + 1;
    this.recordsPerPage = page.pageSize;
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
      this.selectedRecord = this.taxList || {};
  
      if (!this.taxList) {
        this.totalRecords = 0;
        this.toast.warning(this.translate.instant('taxation.tax_declaraton_not_found'), this.translate.instant('taxation.toast.warning'));
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
            const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.failed_to_tax_sections')
          ;
          this.toast.error(errorMessage, 'Error!'); 
        }
      });
    }, (err) => {
      const errorMessage = err?.error?.message || err?.message || err 
      || this.translate.instant('taxation.failed_to_tax_declaration')
      ;
      this.toast.error(errorMessage, 'Error!'); 
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
    return hraList.reduce((sum, item) => sum + (item.rentDeclared || 0), 0);
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

  open(content: any) {
    this.dialogRef = this.dialog.open(content, {
      width: '500px',
    });
  }

  taxDeclaration() {   
    
    this.taxDeclarationForm.markAllAsTouched();
  
    if (this.taxDeclarationForm.invalid) {
      return;
    }
    const payload = {
      financialYear: this.taxDeclarationForm.value.financialYear,
      user: this.user.id,
      employeeIncomeTaxDeclarationComponent: [],
      employeeIncomeTaxDeclarationHRA: []
    };  
    this.userService.getStatutoryByUserId(this.user.id).subscribe((res: any) => {
      if (res.data?.taxRegime === 'Old Regime') {
        this.taxService.addIncomeTax(payload).subscribe((res: any) => {
           this.getTaxDeclarationList();
            this.toast.success(this.translate.instant('taxation.tax_declaraton_added'), this.translate.instant('taxation.toast.success'));
            this.dialogRef.close();
          },
          (err) => {
            const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.failed_tax_declaraton_add')
          ;
          this.toast.error(errorMessage, 'Error!'); 
          }
        );
      } else if (res.data[0].taxRegime === 'New Regime') {
           this.toast.error(this.translate.instant('taxation.tax_declaraton_only_Old_regime'), this.translate.instant('taxation.toast.error'));
           this.dialogRef.close();
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