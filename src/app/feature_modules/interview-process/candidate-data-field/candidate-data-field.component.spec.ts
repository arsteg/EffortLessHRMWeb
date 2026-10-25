import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateDataFieldComponent } from './candidate-data-field.component';

describe('CandidateDataFieldComponent', () => {
  let component: CandidateDataFieldComponent;
  let fixture: ComponentFixture<CandidateDataFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTestingModule, CandidateDataFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CandidateDataFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
