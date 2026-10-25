import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventNotificationComponent } from './event-notification.component';

describe('EventNotificationComponent', () => {
  let component: EventNotificationComponent;
  let fixture: ComponentFixture<EventNotificationComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTestingModule, EventNotificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EventNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
