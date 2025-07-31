import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tag } from '../../models/tag'
import { TasksService } from '../../_services/tasks.service';
import { ToastrService } from 'ngx-toastr';
import { taskComment } from 'src/app/models/task/taskComment';
import { ActionVisibility, TableColumn } from 'src/app/models/table-column';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from 'src/app/_helpers/custom-validators';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';


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
  columns: TableColumn[] = [
    { 
      key: 'title', 
      name: this.translate.instant('tags.title') 
    },
    {
      key: 'action',
      name: this.translate.instant('tags.actions'),
      isAction: true,
      options: [
        { 
          label: this.translate.instant('tags.edit'), 
          icon: 'edit', 
          visibility: ActionVisibility.LABEL 
        },
        { 
          label: this.translate.instant('tags.delete'), 
          icon: 'delete', 
          visibility: ActionVisibility.LABEL
        }
      ]
    }
  ];
  
  constructor(
    private fb: FormBuilder, 
    private taskService: TasksService, 
    private toast: ToastrService,
    private dialog: MatDialog,
    private translate: TranslateService) { }

  ngOnInit(): void {
    this.initTagForm();
    this.getTagList();
  }

  initTagForm() {
    this.tagForm = this.fb.group({
      title: ['', [Validators.required, CustomValidators.noLeadingOrTrailingSpaces]]
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
      this.tagForm.markAllAsTouched();
      if (this.tagForm.invalid) {
        return;
      }
      await this.taskService.addTag(this.tagForm.value).toPromise();
      this.toast.success(this.translate.instant('tags.add_success'));
      this.getTagList();
      this.tagForm.reset();
    } catch (err) {
      this.toast.error(this.translate.instant('tags.error_add'), this.translate.instant('tags.error'));
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
      this.tagForm.markAllAsTouched();
      if (this.tagForm.invalid) {
        return;
      }
      const updatedTag = this.tagList.find(tag => tag._id === this.selectedTag._id);
      updatedTag.title = this.tagForm.value.title;
      const response = await this.taskService.updateTag(updatedTag).toPromise();
      this.toast.success(this.translate.instant('tags.update_success'));
      this.getTagList();
      this.isEdit = false;
      this.tagForm.reset();
    } catch (err) {
      this.toast.error(this.translate.instant('tags.error_update'), this.translate.instant('tags.error'));
    }
  }
  // confirmAction(): boolean {
  //   return window.confirm('Are you sure you want to perform this action?');
  // }

  deleteTag(tag: Tag) {
    try {
      //const result = this.confirmAction();
      //if (result) {
        this.taskService.deleteTag(tag._id).subscribe((response: any) => {
          this.toast.success(this.translate.instant('tags.delete_success'))
          this.getTagList();
        })
      //}
    }
    catch (err) {
      this.toast.error(this.translate.instant('tags.error_delete'), this.translate.instant('tags.error'));
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
        this.toast.error(this.translate.instant('tags.error_comments'), this.translate.instant('tags.error'));
      });
  }

  handleAction(event: any) {
    if (event.action.label === this.translate.instant('tags.edit')) {
      this.editTag(event.row);
    } 
    if (event.action.label === this.translate.instant('tags.delete')) {
      this.openDialog(event.row);
    }
  }

  onSearchChange(event: any) {
    this.filteredList = this.filteredList?.filter(row => {
      return row.title?.toString().toLowerCase().includes(event.toLowerCase());
    });
  }

  openDialog(row): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTag(row);
      }
      (err) => {
        this.toast.error(this.translate.instant('tags.error_delete_dialog'), this.translate.instant('tags.error'));
      };
    });
  }
}
