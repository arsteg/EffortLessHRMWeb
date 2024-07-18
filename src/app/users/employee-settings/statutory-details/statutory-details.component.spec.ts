import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryDetailsComponent } from './statutory-details.component';

describe('StatutoryDetailsComponent', () => {
  let component: StatutoryDetailsComponent;
  let fixture: ComponentFixture<StatutoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatutoryDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StatutoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
