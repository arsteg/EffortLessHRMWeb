import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateHelpdeskTaskComponent } from './update-helpdesk-task.component';

describe('UpdateHelpdeskTaskComponent', () => {
  let component: UpdateHelpdeskTaskComponent;
  let fixture: ComponentFixture<UpdateHelpdeskTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }, { provide: MAT_DIALOG_DATA, useValue: {} }],
      declarations: [UpdateHelpdeskTaskComponent],
      imports: [UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateHelpdeskTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
