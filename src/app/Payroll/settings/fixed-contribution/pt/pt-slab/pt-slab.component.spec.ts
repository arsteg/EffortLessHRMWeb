import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtSlabComponent } from './pt-slab.component';

describe('PtSlabComponent', () => {
  let component: PtSlabComponent;
  let fixture: ComponentFixture<PtSlabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PtSlabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PtSlabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
