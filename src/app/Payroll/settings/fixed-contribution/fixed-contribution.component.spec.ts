import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedContributionComponent } from './fixed-contribution.component';

describe('FixedContributionComponent', () => {
  let component: FixedContributionComponent;
  let fixture: ComponentFixture<FixedContributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedContributionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
