import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrmFeaturesComponent } from './hrm-features.component';

describe('HrmFeaturesComponent', () => {
  let component: HrmFeaturesComponent;
  let fixture: ComponentFixture<HrmFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      declarations: [HrmFeaturesComponent],
      imports: [UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HrmFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
