import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrls: ['./edit-tax.component.css']
})
export class EditTaxComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string;
  activeTabName: string;
  selectedUser =JSON.parse(localStorage.getItem('currentUser'));
  taxSections: any;
  @Output() backToSalaryDetails = new EventEmitter<void>();
  @Input() selectedRecord: any;
  component: any;
  isHRA: any;

  constructor(
    private taxService: TaxationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.component = this.selectedRecord.incomeTaxDeclarationComponent;
    this.getSections();
  }

  fetchUpdatedTaxDeclaration() {
    this.userService.getTaxDeclarationByUserId(this.selectedUser?.id, { skip: '', next: '' }).subscribe(
      (res: any) => {
        this.selectedRecord = res.data && res.data.length > 0 ? res.data[res.data.length - 1] : null;
        this.component = this.selectedRecord?.incomeTaxDeclarationComponent || [];
        console.log('Updated selectedRecord:', this.selectedRecord); // Debug log
        if (!this.selectedRecord) {
          console.error('No tax declaration found');
        }
      },
      (err) => {
        console.error('Failed to refresh tax data', err);
      }
    );
  }

  getSections() {
    this.taxService.getAllTaxSections().subscribe((results: any) => {
      this.taxSections = results.data;
      if (this.taxSections?.length) {
        const sectionId = this.taxSections[0]?._id;
        this.selectTab(sectionId);
      }
    });
  }

  selectTab(tabId) {
    this.activeTab = tabId;
    const selectedSection = this.taxSections.find((section: any) => section._id === tabId);
    this.activeTabName = selectedSection?.section || '';
    this.isHRA = selectedSection?.isHRA || false;
    this.taxService.activeTab.next(this.activeTabName);
    this.fetchUpdatedTaxDeclaration(); // Refresh data on tab switch
  }

  onDataUpdated() {
    this.fetchUpdatedTaxDeclaration(); // Refresh data on update
  }
}