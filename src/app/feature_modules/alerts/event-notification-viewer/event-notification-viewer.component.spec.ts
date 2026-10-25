import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventNotificationViewerComponent } from './event-notification-viewer.component';

describe('EventNotificationViewerComponent', () => {
  let component: EventNotificationViewerComponent;
  let fixture: ComponentFixture<EventNotificationViewerComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventNotificationViewerComponent],
      imports: [UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventNotificationViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
