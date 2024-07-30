import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatoryDetailsComponent } from './signatory-details.component';

describe('SignatoryDetailsComponent', () => {
  let component: SignatoryDetailsComponent;
  let fixture: ComponentFixture<SignatoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignatoryDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SignatoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
