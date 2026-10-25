import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateApplicationComponent } from './update-application.component';

describe('UpdateApplicationComponent', () => {
  let component: UpdateApplicationComponent;
  let fixture: ComponentFixture<UpdateApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }, { provide: MAT_DIALOG_DATA, useValue: {} }],
      imports: [UiTestingModule],
      declarations: [UpdateApplicationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
