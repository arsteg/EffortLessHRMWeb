import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateHelpdeskTaskComponent } from './update-helpdesk-task.component';

describe('UpdateHelpdeskTaskComponent', () => {
  let component: UpdateHelpdeskTaskComponent;
  let fixture: ComponentFixture<UpdateHelpdeskTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateHelpdeskTaskComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateHelpdeskTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
