import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/_services/common.Service';
import { CompanyService } from 'src/app/_services/company.service';


@Component({
  selector: 'app-flexi-holidays',
  templateUrl: './flexi-holidays.component.html',
  styleUrl: './flexi-holidays.component.css'
})
export class FlexiHolidaysComponent {
  holidays: any;
  holidayForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedRecord: any;
  members: any[] = [];
  currentYear: number;
  selectedYear: number;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;
  public sortOrder: string = '';

  constructor(private companyService: CompanyService,
    private toast: ToastrService,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.getHolidays();
    this.commonService.populateUsers().subscribe((res: any) => {
      this.members = res.data.data;
    });
  }

  getHolidays() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      status: '',
      year: this.currentYear
    };
    this.companyService.getHolidays(pagination).subscribe(res => {
      this.holidays = res.data.filter(holiday => holiday.isMandatoryForFlexiHoliday == false);
    });
  }
  
  onCheckboxChange(holiday: any, event: Event) {
    const selectedCount = this.holidays.filter(h => h.isSelected).length;
  
    if (selectedCount > 2) {
      this.toast.error('You can only select up to 2 holidays.');
      
      // Revert the selection for the new selection (third one)
      (event.target as HTMLInputElement).checked = false;
      holiday.isSelected = false;
    }
  }
  
}