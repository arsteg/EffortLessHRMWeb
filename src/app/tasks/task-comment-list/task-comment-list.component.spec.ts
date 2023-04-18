import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCommentListComponent } from './task-comment-list.component';

describe('TaskCommentListComponent', () => {
  let component: TaskCommentListComponent;
  let fixture: ComponentFixture<TaskCommentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskCommentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCommentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
