import { UpdateStateComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/pt/eligible-states/configure-state/update-state/update-state.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureStateComponent } from './configure-state.component';

describe('ConfigureStateComponent', () => {
  let component: ConfigureStateComponent;
  let fixture: ComponentFixture<ConfigureStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [UpdateStateComponent, ConfigureStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
