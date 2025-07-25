import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineManagementComponent } from './timeline-management.component';

describe('TimelineManagementComponent', () => {
  let component: TimelineManagementComponent;
  let fixture: ComponentFixture<TimelineManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineManagementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimelineManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
