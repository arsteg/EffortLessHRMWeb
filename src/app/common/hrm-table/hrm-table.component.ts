import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ExportService } from 'src/app/_services/export.service';

@Component({
  selector: 'hrm-table',
  templateUrl: './hrm-table.component.html',
  styleUrl: './hrm-table.component.css'
})
export class HrmTableComponent {
  private readonly exportService = inject(ExportService);
  @Input() data = [];
  @Input() columns = [];
  @Input() pageTitle = 'Report'; // To be displayed on export files
  @Input() isServerSide = false; // pass this flag when sever side pagination is there
  @Input() pageSizeOptions = [5, 10, 25];
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() showRefresh: boolean = false; // refresh icon
  @Input() showExport: string = 'none'; //none, all, excel, csv or pdf
  @Input() showFilters: boolean = false; // filters icon
  @Input() showSearch = false; // global table search
  @Input() showUserfilter = false;
  @Input() userFilterOptions = [];
  @Input() mdColumns: number = 5;

  @Output() actionClicked = new EventEmitter();
  @Output() selectionChanged = new EventEmitter<any[]>(); // for checkbox row selection
  @Output() refreshClicked = new EventEmitter();
  @Output() exportClicked = new EventEmitter();
  @Output() filtersClicked = new EventEmitter();
  @Output() searchChanged = new EventEmitter();
  @Output() pageChanged = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() sortChanged = new EventEmitter<{ active: string; direction: string }>();
  @Output() userChanged = new EventEmitter();

  displayedColumns = [];
  selection = new SelectionModel<any>(true, []); // multiple selection allowed
  searchText = '';
  filteredData: any[] = [];
  currentPageIndex = 0;
  currentPageSize = this.pageSize;


  ngOnInit() {
    this.displayedColumns = this.columns.map(column => column.key);
  }

  ngOnChanges() {
    if (!this.isServerSide) {
      this.applyClientSideFilter();
    } else {
      this.filteredData = this.data;
    }
  }

  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  onAction(action: string, row: any) {
    this.actionClicked.emit({ action, row });
  }

  isAllSelected() {
    return this.selection?.selected?.length === this.data?.length;
  }

  isPartialSelected() {
    return this.selection?.selected?.length > 0 && !this.isAllSelected();
  }

  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.data.forEach(row => this.selection.select(row));

    this.selectionChanged.emit(this.selection.selected);
  }

  toggleRow(row: any) {
    this.selection.toggle(row);
    this.selectionChanged.emit(this.selection.selected);
  }

  refreshClick() {
    this.refreshClicked.emit(true);
  }

  onUserChange(event) {
    this.userChanged.emit(event);
  }

  onSort(sort: Sort) {
    if (this.isServerSide) {
      this.sortChanged.emit({ active: sort.active, direction: sort.direction });
    } else {
      const sorted = this.data.slice().sort((a, b) => {
        const aVal = this.getValueByPath(a, sort.active);
        const bVal = this.getValueByPath(b, sort.active);
        return sort.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
      });
      this.filteredData = sorted;
    }
  }

  onPageChange(event: PageEvent) {
  this.currentPageIndex = event.pageIndex;
  this.currentPageSize = event.pageSize;

  if (this.isServerSide) {
    this.pageChanged.emit({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }
}


  get pagedData(): any[] {
    if (this.isServerSide) return this.filteredData;
    const start = this.currentPageIndex * this.currentPageSize;
    const end = start + this.currentPageSize;
    return this.filteredData?.slice(start, end);
  }


  onSearch(element: any) {
    const value = element.value;
    this.searchText = value;

    if (this.isServerSide) {
      this.searchChanged.emit(value);
    } else {
      this.applyClientSideFilter();
    }
  }

  applyClientSideFilter() {
    const filter = this.searchText.trim().toLowerCase();
    this.filteredData = this.data?.filter(row =>
      this.columns.some(col => {
        let val = this.getValueByPath(row, col.key);
        if (col.valueFn) {
          val = col.valueFn(row);
        }
        return val?.toString().toLowerCase().includes(filter);
      })
    );
  }

  get showPaginator(): boolean {
    return this.isServerSide || this.data?.length > this.pageSize;
  }

  exportToExcel() {
    const data = this.filteredData.map(item => {
      const row = {};
      this.columns.forEach((col) => {
        if (col.key != 'actions' && col.name != '' && col.key != 'action') {
          if (col.valueFn) {
            row[col.name] = col.valueFn(item);
          } else {
            row[col.name] = this.getValueByPath(item, col.key)
          }
        }
      });
      return row
    })
    this.exportService.exportToExcel(this.pageTitle, this.pageTitle, data);
  }

  exportToCsv() {
    const data = this.filteredData.map(item => {
      const row = {};
      this.columns.forEach((col) => {
        if (col.key != 'actions' && col.name != '' && col.key != 'action') {
          if (col.valueFn) {
            row[col.name] = col.valueFn(item);
          } else {
            row[col.name] = this.getValueByPath(item, col.key)
          }
        }
      });
      return row
    })
    this.exportService.exportToCSV(this.pageTitle, this.pageTitle, data);
  }

  @ViewChild('table') content!: ElementRef;
  exportToPdf() {
    this.exportService.exportToPdf(this.pageTitle, this.pageTitle, this.content.nativeElement);
  }

}
