import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { tag } from '../../models/tag'
import { TasksService } from '../tasks.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'task-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent implements OnInit {

  tagList: tag[] = [];
  filteredList: tag[] = [];
  tagForm: FormGroup;
  isEdit = false;
  selectedTag: tag;
  p = 1;

  constructor(private fb: FormBuilder,private tasksService: TasksService,private toast: ToastrService) { }

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
    this.tasksService.getAllTags().subscribe((response: any) => {
      this.tagList = response && response.data;
      this.filteredList= this.tagList;
    })
  }

  async addTag() {
    try {
      await this.tasksService.AddTag(this.tagForm.value).toPromise();
      this.getTagList();
      this.toast.success('Tag added successfully!');
      this.getTagList();
    } catch (err) {
      this.toast.error('Error adding tag', 'Error!');
    }
  }


  editTag(tag: tag) {
    this.isEdit = true;
    this.selectedTag = tag;
    this.tagForm.patchValue({
      title: tag.title
    });
  }

  async  updateTag() {
    try {
      const updatedTag = this.tagList.find(tag => tag._id === this.selectedTag._id);
      updatedTag.title = this.tagForm.value.title;
      const response = await this.tasksService.UpdateTag(updatedTag).toPromise();
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

  deleteTag(tag: tag) {
    try{
    const result = this.confirmAction();
    if(result){
    this.tasksService.DeleteTag(tag._id).subscribe((response: any) => {
      this.toast.success('Tag has been deleted successfully!')
      this.getTagList();
    })}
  }
  catch(err){
    this.toast.error('Error deleting tag', 'Error!');
  }
  }

  filteredTags(searchControl) {
    const searchQuery = searchControl.value.toLowerCase();
    this.filteredList = this.tagList.filter(tag => tag.title.toLowerCase().includes(searchQuery));
  }

  onTagEdittFocus(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    input.select();
  }
}
