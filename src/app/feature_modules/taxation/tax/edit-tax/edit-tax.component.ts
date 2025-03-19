import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrls: ['./edit-tax.component.css']
})
export class EditTaxComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string;
  activeTabName: string;
  selectedUser: any;
  taxSections: any;
  @Output() backToSalaryDetails = new EventEmitter<void>();
  @Input() selectedRecord: any;

  constructor(private taxService: TaxationService,) { }

  ngOnInit() {
    this.logUrlSegmentsForUser();
  }

  logUrlSegmentsForUser() {
    this.taxService.getAllTaxSections().subscribe((results: any) => {
      this.taxSections = results.data;
      if (this.taxSections?.length) {
        const sectionId = this.taxSections[0]?._id;
        // .log(sectionId)
        this.selectTab(sectionId);
      }
    });
  }

  selectTab(tabId) {
    this.activeTab = tabId;
    this.activeTabName = this.taxSections.find((section: any) => section._id === tabId)?.section;
    this.taxService.activeTab.next(this.activeTabName);
  }
}