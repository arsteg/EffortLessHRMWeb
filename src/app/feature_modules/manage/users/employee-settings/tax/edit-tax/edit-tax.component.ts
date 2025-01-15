import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';
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

  constructor(private taxService: TaxationService,
              private router: Router,
              private userService: UserService) { }

  ngOnInit() {
    this.logUrlSegmentsForUser();
  }

  logUrlSegmentsForUser() {
    const urlPath = this.router.url;
    const segments = urlPath.split('/').filter(segment => segment);
    if (segments.length >= 3) {
      const employee = segments[segments.length - 3];
      forkJoin([
        this.userService.getUserByEmpCode(employee),
        this.taxService.getAllTaxSections()
      ]).subscribe((results: any[]) => {
        this.selectedUser = results[0].data;
        this.taxSections = results[1].data;
        if (this.taxSections?.length) {
          const sectionId = this.taxSections[0]?._id;
          this.selectTab(sectionId);
        }
      });
    }
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    this.activeTabName = this.taxSections.find((section: any) => section._id === tabId)?.section;
  }
}
