import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLeaveComponent } from './view-leave.component';

describe('ViewLeaveComponent', () => {
  let component: ViewLeaveComponent;
  let fixture: ComponentFixture<ViewLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ViewLeaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
