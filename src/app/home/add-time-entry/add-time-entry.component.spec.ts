import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTimeEntryComponent } from './add-time-entry.component';

describe('AddTimeEntryComponent', () => {
  let component: AddTimeEntryComponent;
  let fixture: ComponentFixture<AddTimeEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTimeEntryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTimeEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
