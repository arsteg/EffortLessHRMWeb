import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EligibleStatesComponent } from './eligible-states.component';

describe('EligibleStatesComponent', () => {
  let component: EligibleStatesComponent;
  let fixture: ComponentFixture<EligibleStatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EligibleStatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EligibleStatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
