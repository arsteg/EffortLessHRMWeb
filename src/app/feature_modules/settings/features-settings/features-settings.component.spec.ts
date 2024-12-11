import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesSettingsComponent } from './features-settings.component';

describe('FeaturesSettingsComponent', () => {
  let component: FeaturesSettingsComponent;
  let fixture: ComponentFixture<FeaturesSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
