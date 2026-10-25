import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCancelComponent } from './confirm-cancel.component';

describe('ConfirmCancelComponent', () => {
  let component: ConfirmCancelComponent;
  let fixture: ComponentFixture<ConfirmCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }, { provide: MAT_DIALOG_DATA, useValue: {} }],
      imports: [UiTestingModule, ConfirmCancelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
