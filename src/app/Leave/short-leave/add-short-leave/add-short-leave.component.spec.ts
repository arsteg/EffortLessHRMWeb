import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShortLeaveComponent } from './add-short-leave.component';

describe('AddShortLeaveComponent', () => {
  let component: AddShortLeaveComponent;
  let fixture: ComponentFixture<AddShortLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddShortLeaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddShortLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
