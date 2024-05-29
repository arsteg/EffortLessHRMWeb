import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowOnDutyComponent } from './show-on-duty.component';

describe('ShowOnDutyComponent', () => {
  let component: ShowOnDutyComponent;
  let fixture: ComponentFixture<ShowOnDutyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowOnDutyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowOnDutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
