import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiHolidaysComponent } from './flexi-holidays.component';

describe('FlexiHolidaysComponent', () => {
  let component: FlexiHolidaysComponent;
  let fixture: ComponentFixture<FlexiHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlexiHolidaysComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlexiHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
