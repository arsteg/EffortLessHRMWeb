import { Component, OnInit } from '@angular/core';
import { FeedbackFieldListComponent } from "./feedback-field-list/feedback-field-list.component";
import { FeedbackViewerComponent } from './feedback-viewer/feedback-viewer.component';
import { CommonModule } from '@angular/common';
import { BarcodeListComponent } from "./barcode-generator/barcode-list.component";
@Component({
  selector: 'app-feedback-settings',
  standalone: true,
  template: `<div class="main-content contentData">
  <div class="container-fluid px-0">
      <div class=" d-flex bg-white subMenu w-100">
          <button class="btn rounded-pill submenuTab" (click)="selectTab(1)"
              [class.active]="selectedTab === 1">Fields</button>
          <button class="btn rounded-pill submenuTab" (click)="selectTab(2)" [class.active]="selectedTab === 2">
          QR Code</button>
          <button class="btn rounded-pill submenuTab" (click)="selectTab(3)" [class.active]="selectedTab === 3">
          Viewer</button>
      </div>

      <div *ngIf="selectedTab === 1" class="tab-content">
        <app-feedback-field-list></app-feedback-field-list>
      </div>
      <div *ngIf="selectedTab === 2" class="tab-content">
      <app-barcode-list></app-barcode-list> 
      </div>
      <div *ngIf="selectedTab === 3" class="tab-content">   
      <app-feedback-viewer></app-feedback-viewer>
      </div>
  </div>
</div>
`,
  styles: '',
  imports: [FeedbackFieldListComponent, FeedbackViewerComponent, CommonModule, BarcodeListComponent]
})
export class FeedbackSettingsComponent implements OnInit {
  selectedTab: number = 1;
  constructor(
    ) { }

  ngOnInit(): void {  
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
