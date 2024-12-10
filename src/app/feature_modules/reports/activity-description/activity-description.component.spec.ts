import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDescriptionComponent } from './activity-description.component';

describe('ActivityDescriptionComponent', () => {
  let component: ActivityDescriptionComponent;
  let fixture: ComponentFixture<ActivityDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivityDescriptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
