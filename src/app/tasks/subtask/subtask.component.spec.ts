import { TaskCommentComponent } from 'src/app/tasks/task-comment/task-comment.component';
import { TaskCommentListComponent } from 'src/app/tasks/task-comment-list/task-comment-list.component';
import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtaskComponent } from './subtask.component';

describe('SubtaskComponent', () => {
  let component: SubtaskComponent;
  let fixture: ComponentFixture<SubtaskComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [TaskCommentListComponent, TaskCommentComponent,  SubtaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
