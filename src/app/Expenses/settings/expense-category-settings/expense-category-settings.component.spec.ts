import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCategorySettingsComponent } from './expense-category-settings.component';

describe('ExpenseCategorySettingsComponent', () => {
  let component: ExpenseCategorySettingsComponent;
  let fixture: ComponentFixture<ExpenseCategorySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCategorySettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseCategorySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
