import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralComponent } from './general.component';
import { SupervisorsComponent } from '../supervisors/supervisors.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { useEmployeeSessionFixture } from 'src/testing/session-fixture';

describe('GeneralComponent', () => {
  let component: GeneralComponent;
  let fixture: ComponentFixture<GeneralComponent>;

  beforeEach(useEmployeeSessionFixture);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTestingModule],
      declarations: [GeneralComponent, SupervisorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
