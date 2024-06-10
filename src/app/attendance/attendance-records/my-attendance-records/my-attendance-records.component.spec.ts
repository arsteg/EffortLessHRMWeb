import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAttendanceRecordsComponent } from './my-attendance-records.component';

describe('MyAttendanceRecordsComponent', () => {
  let component: MyAttendanceRecordsComponent;
  let fixture: ComponentFixture<MyAttendanceRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyAttendanceRecordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyAttendanceRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
