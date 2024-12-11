import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LwfSlabComponent } from './lwf-slab.component';

describe('LwfSlabComponent', () => {
  let component: LwfSlabComponent;
  let fixture: ComponentFixture<LwfSlabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LwfSlabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LwfSlabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
