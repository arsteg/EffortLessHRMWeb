import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSettingsComponent } from './generic-settings.component';

describe('GenericSettingsComponent', () => {
  let component: GenericSettingsComponent;
  let fixture: ComponentFixture<GenericSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ GenericSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
