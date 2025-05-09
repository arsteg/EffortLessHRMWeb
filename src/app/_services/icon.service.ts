import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { ICONS } from '../constants/icons'; // Adjust the import path as necessary
@Injectable({
  providedIn: 'root'
})
export class IconService {
  private icons = ICONS;

  constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    this.registerIcons();
  }

  private registerIcons(): void {
    this.icons.forEach(icon => {
      this.iconRegistry.addSvgIcon(
        icon,
        this.sanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
      );
    });
  }
}
