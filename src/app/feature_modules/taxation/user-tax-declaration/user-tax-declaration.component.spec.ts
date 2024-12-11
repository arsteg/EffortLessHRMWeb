import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTaxDeclarationComponent } from './user-tax-declaration.component';

describe('UserTaxDeclarationComponent', () => {
  let component: UserTaxDeclarationComponent;
  let fixture: ComponentFixture<UserTaxDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserTaxDeclarationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTaxDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
