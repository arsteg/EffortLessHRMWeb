import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateOnDutyComponent } from './update-on-duty.component';

describe('UpdateOnDutyComponent', () => {
  let component: UpdateOnDutyComponent;
  let fixture: ComponentFixture<UpdateOnDutyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateOnDutyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateOnDutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
