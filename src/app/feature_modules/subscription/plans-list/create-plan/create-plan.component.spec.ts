import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanComponent } from './create-plan.component';

describe('CreatePlanComponent', () => {
  let component: CreatePlanComponent;
  let fixture: ComponentFixture<CreatePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }, { provide: MAT_DIALOG_DATA, useValue: {} }],
      imports: [UiTestingModule, CreatePlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
