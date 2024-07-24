import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step9Component } from './step-9.component';

describe('Step9Component', () => {
  let component: Step9Component;
  let fixture: ComponentFixture<Step9Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Step9Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Step9Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
