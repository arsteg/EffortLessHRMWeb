import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tax-declaration',
  templateUrl: './tax-declaration.component.html',
  styleUrl: './tax-declaration.component.css'
})
export class TaxDeclarationComponent {
  activeTab: string = 'tabSections';
  @Input() selectedUser: any;
  @Input() isEdit: boolean = false;

  ngOnInit() { }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

}
