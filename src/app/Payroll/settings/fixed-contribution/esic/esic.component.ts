import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-esic',
  templateUrl: './esic.component.html',
  styleUrl: './esic.component.css'
})
export class EsicComponent {
  activeTab: string = 'tabCeilingAmount';
  @Input() selectedRecord: any;

  ngOnInit(){
    console.log(this.selectedRecord)
  }
  selectTab(tabId: string) {
    this.activeTab = tabId;
  }
}