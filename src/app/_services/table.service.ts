import { Injectable, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Injectable({
  providedIn: 'root'
})
export class TableService<T> {
  dataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  searchText: string = '';
  totalRecords: number = 0;
  recordsPerPage: number = 10;
  currentPage: number = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // initializeDataSource(data: T[], paginator: MatPaginator) {
  //   this.dataSource = new MatTableDataSource<T>(data);
  //   this.dataSource.paginator = paginator;
  //   this.totalRecords = data.length;
  // }
initializeDataSource(data: T[], paginator?: MatPaginator) {
  this.dataSource = new MatTableDataSource<T>(data);
  if (paginator) {
    this.dataSource.paginator = paginator; // ONLY for client-side
  }
  this.totalRecords = data.length;
}

  applyFilter() {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updatePagination(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.recordsPerPage = event.pageSize;
  }

  setData(data: T[]) {
    this.dataSource.data = data;
    this.totalRecords = data.length;
  }

  // Optional: Custom filter predicate for more complex filtering
  setCustomFilterPredicate(predicate: (data: T, filter: string) => boolean) {
    this.dataSource.filterPredicate = predicate;
  }
}