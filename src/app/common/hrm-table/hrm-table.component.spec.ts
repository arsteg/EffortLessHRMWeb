import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrmTableComponent } from './hrm-table.component';

describe('HrmTableComponent', () => {
  let component: HrmTableComponent;
  let fixture: ComponentFixture<HrmTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrmTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HrmTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
