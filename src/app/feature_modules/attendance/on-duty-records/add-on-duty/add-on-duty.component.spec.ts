import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnDutyComponent } from './add-on-duty.component';

describe('AddOnDutyComponent', () => {
  let component: AddOnDutyComponent;
  let fixture: ComponentFixture<AddOnDutyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddOnDutyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddOnDutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
