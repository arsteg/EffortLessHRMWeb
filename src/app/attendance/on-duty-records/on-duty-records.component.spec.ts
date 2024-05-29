import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnDutyRecordsComponent } from './on-duty-records.component';

describe('OnDutyRecordsComponent', () => {
  let component: OnDutyRecordsComponent;
  let fixture: ComponentFixture<OnDutyRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnDutyRecordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnDutyRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
