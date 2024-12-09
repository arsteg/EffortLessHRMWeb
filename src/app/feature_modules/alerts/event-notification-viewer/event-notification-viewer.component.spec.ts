import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventNotificationViewerComponent } from './event-notification-viewer.component';

describe('EventNotificationViewerComponent', () => {
  let component: EventNotificationViewerComponent;
  let fixture: ComponentFixture<EventNotificationViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventNotificationViewerComponent]
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
