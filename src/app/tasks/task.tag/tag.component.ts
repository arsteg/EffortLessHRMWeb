import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tag } from '../../models/tag'
import { TasksService } from '../../_services/tasks.service';
import { ToastrService } from 'ngx-toastr';
import { taskComment } from 'src/app/models/task/taskComment';


@Component({
  selector: 'task-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit {
  tagList: Tag[] = [];
  filteredList: Tag[] = [];
  tagForm: FormGroup;
  isEdit = false;
  selectedTag: Tag;
  p = 1;
  comments: taskComment[];
  searchText: string = '';
  
  constructor(private fb: FormBuilder, private taskService: TasksService, private toast: ToastrService) { }

  ngOnInit(): void {
    this.initTagForm();
    this.getTagList();
  }

  initTagForm() {
    this.tagForm = this.fb.group({
      title: ['', Validators.required]
    });
  }

  getTagList() {
    this.tagList = [
    ];
    this.taskService.getAllTags().subscribe((response: any) => {
      this.tagList = response && response.data;
      this.filteredList = this.tagList;
    })
  }

  async addTag() {
    try {
      await this.taskService.addTag(this.tagForm.value).toPromise();
      this.getTagList();
      this.toast.success('Tag added successfully!');
      this.getTagList();
    } catch (err) {
      this.toast.error('Error adding tag', 'Error!');
    }
  }


  editTag(tag: Tag) {
    this.isEdit = true;
    this.selectedTag = tag;
    this.tagForm.patchValue({
      title: tag.title
    });
  }

  async updateTag() {
    try {
      const updatedTag = this.tagList.find(tag => tag._id === this.selectedTag._id);
      updatedTag.title = this.tagForm.value.title;
      const response = await this.taskService.updateTag(updatedTag).toPromise();
      this.toast.success('Tag updated successfully!');
      this.getTagList();
      this.isEdit = false;
    } catch (err) {
      this.toast.error('Error adding tag', 'Error!');
    }
  }
  confirmAction(): boolean {
    return window.confirm('Are you sure you want to perform this action?');
  }

  deleteTag(tag: Tag) {
    try {
      const result = this.confirmAction();
      if (result) {
        this.taskService.deleteTag(tag._id).subscribe((response: any) => {
          this.toast.success('Tag has been deleted successfully!')
          this.getTagList();
        })
      }
    }
    catch (err) {
      this.toast.error('Error deleting tag', 'Error!');
    }
  }

  filteredTags(searchControl) {
    const searchQuery = searchControl.value?.toLowerCase();
    this.filteredList = this.tagList.filter(tag => tag.title?.toLowerCase().includes(searchQuery));
  }

  onTagEdittFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  getComments(taskId) {
    this.taskService.getComments(taskId).toPromise()
      .then(response => {
        this.comments = response.data;
        this.comments.forEach(e => { console.log(e.content) });
      })
      .catch(error => {
        this.toast.error('Something went wrong, Please try again.', 'Error!');
      });
  }
}
