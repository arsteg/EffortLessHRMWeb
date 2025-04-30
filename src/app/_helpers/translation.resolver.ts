import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { TranslationService } from '../_services/translation.service';

@Injectable({ providedIn: 'root' })
export class TranslationResolver implements Resolve<Promise<void>> {
  constructor(private translationService: TranslationService) {}

  resolve(route: ActivatedRouteSnapshot): Promise<void> {
    const moduleKey = route.data['moduleKey'] || 'shared';
    return this.translationService.loadTranslation(moduleKey);
  }
}
