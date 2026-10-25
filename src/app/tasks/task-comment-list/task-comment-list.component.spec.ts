import { TaskCommentComponent } from 'src/app/tasks/task-comment/task-comment.component';
import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCommentListComponent } from './task-comment-list.component';

describe('TaskCommentListComponent', () => {
  let component: TaskCommentListComponent;
  let fixture: ComponentFixture<TaskCommentListComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [TaskCommentComponent,  TaskCommentListComponent ]
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
