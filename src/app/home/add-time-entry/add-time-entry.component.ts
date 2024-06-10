import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ProjectService } from 'src/app/_services/project.service';
import { TasksService } from 'src/app/_services/tasks.service';

@Component({
  selector: 'app-add-time-entry',
  templateUrl: './add-time-entry.component.html',
  styleUrl: './add-time-entry.component.css'
})
export class AddTimeEntryComponent {
  timeEntry: FormGroup;
  bsValue = new Date();
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  projects: any;
  tasks: any;

  constructor(private fb: FormBuilder,
    private project: ProjectService,
    private task: TasksService
  ) {
    this.timeEntry = this.fb.group({
      duration: [''],
      date: [],
      project: [''],
      task: [''],
      user: [''],
      trackTimeEntries: this.fb.array([])
    })
  }

  ngOnInit() {
    this.getProjectOfCurrentUser();
  }

  addField(): void {
    const control = <FormArray>this.timeEntry.get('trackTimeEntries');
    control.push(this.fb.group({
      fromTime: [''],
      toTime: [''],
      totalTime: [''],
      notes: ['']
    }));
  }

  get trackTimeEntries() {
    return this.timeEntry.get('trackTimeEntries') as FormArray;
  }

  removeCatgoryField(index: number) {
    if (this.trackTimeEntries.value[index].id) {
      console.log(this.trackTimeEntries.value[index].id);
      // this.expenses.deleteApplicationField(this.fields.value[index].id).subscribe((res: any) => {
      //   this.fields.removeAt(index);
      //   this.toast.success('Successfully Deleted!!!', 'Expense Category Field');
      // });
    }
    else {
      this.trackTimeEntries.removeAt(index);
    }
  }

  getProjectOfCurrentUser() {
    this.project.getProjectByUserId(this.currentUser.id).subscribe((res: any) => {
      this.projects = res && res.data && res.data['projectList'];
    })
  }

  getTaskByUserAndProject() {
    let payload = {
      userId: this.currentUser.id,
      projectId: this.timeEntry.get('project').value,
      skip: '',
      next: ''
    }
    console.log(payload)
    this.task.getTaskByUserAndProject(payload).subscribe((res: any) => {
      this.tasks = res.data;
    })
  }

  onSubmission() {
    console.log(this.timeEntry.value);
  }
}
