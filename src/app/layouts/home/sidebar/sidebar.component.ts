import { Component, Input, SimpleChanges } from '@angular/core';
import {  Router } from '@angular/router';
import { SideBarAdminMenu } from '../menu.const';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  searchText: string = '';
  @Input() menuList = [];
  @Input() railMenu = false;
  originalMenuList: any[] = [];

  constructor(private router: Router) { }
  
  ngOnInit() {
    this.originalMenuList = [...this.menuList];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['menuList'] && changes['menuList'].currentValue) {
      this.originalMenuList = [...changes['menuList'].currentValue];
    }
  }

  filteredMenuItems() {
    const searchTerm = this.searchText.trim().toLowerCase();
    if (searchTerm === '') {
      this.menuList = [...this.originalMenuList];
    } else {
      const filtered = this.originalMenuList.filter((item) =>
        item.title.toLowerCase().includes(searchTerm)
      );
      this.menuList = [...filtered];
    }
  }

  isActive(menu: any): boolean {
    const currentUrl = this.router.url;
    const menuBasePath = menu.url.split('/')[0];
    return currentUrl.startsWith(`/home/${menuBasePath}`);
  }
}
