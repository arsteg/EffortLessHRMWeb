import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateShortLeaveComponent } from './update-short-leave.component';

describe('UpdateShortLeaveComponent', () => {
  let component: UpdateShortLeaveComponent;
  let fixture: ComponentFixture<UpdateShortLeaveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateShortLeaveComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateShortLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
