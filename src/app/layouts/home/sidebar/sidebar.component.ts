import { Component, Input } from '@angular/core';
import { SideBarAdminMenu, SideBarUserMenu } from '../menu.const';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  searchText: string = '';
  @Input() menuList = [];

  constructor() { }

  filteredMenuItems() {
    const searchTerm = this.searchText.trim().toLowerCase();
    if (searchTerm === '') {
      this.menuList = SideBarAdminMenu;
    } else {
      const filtered = SideBarAdminMenu.filter((item) =>
        item.title.toLowerCase().includes(searchTerm)
      );
      this.menuList = filtered;
    }
  }
}
