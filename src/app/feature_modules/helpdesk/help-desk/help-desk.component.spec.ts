import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDeskComponent } from './help-desk.component';

describe('HelpDeskComponent', () => {
  let component: HelpDeskComponent;
  let fixture: ComponentFixture<HelpDeskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }, { provide: MAT_DIALOG_DATA, useValue: {} }],
      declarations: [HelpDeskComponent],
      imports: [UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HelpDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
