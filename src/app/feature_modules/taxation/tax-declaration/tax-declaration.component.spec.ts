import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxDeclarationComponent } from './tax-declaration.component';
import { TaxSectionComponent } from '../tax-section/tax-section.component';
import { TaxComponentBySectionComponent } from '../tax-component-by-section/tax-component-by-section.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';

describe('TaxDeclarationComponent', () => {
  let component: TaxDeclarationComponent;
  let fixture: ComponentFixture<TaxDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTestingModule],
      declarations: [TaxDeclarationComponent, TaxSectionComponent, TaxComponentBySectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaxDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
