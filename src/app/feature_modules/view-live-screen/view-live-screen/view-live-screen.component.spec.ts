import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLiveScreenComponent } from './view-live-screen.component';

describe('ViewLiveScreenComponent', () => {
  let component: ViewLiveScreenComponent;
  let fixture: ComponentFixture<ViewLiveScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewLiveScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLiveScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
