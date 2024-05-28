import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/common/common.service';
import { UploadRosterRecordComponent } from './upload-roster-record/upload-roster-record.component';

@Component({
  selector: 'app-roster-records',
  templateUrl: './roster-records.component.html',
  styleUrl: './roster-records.component.css'
})
export class RosterRecordsComponent {
  searchText: string = '';
  weekDates: { day: string, date: string }[] = [];
  isMultiSelectEnabled: boolean = false;

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private toast: ToastrService,
    private commonService: CommonService) {
  }


  ngOnInit() {
    this.commonService.weekDates$.subscribe(dates => {
      this.weekDates = dates;
    });
  }
 

  uploadRosterRecord() {
    const dialogRef = this.dialog.open(UploadRosterRecordComponent, {
      width: '600px',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  allowMultipleSelction(){}
}
