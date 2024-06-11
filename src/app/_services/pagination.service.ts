import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  private _currentPage = 1;
  private _itemsPerPage = 10;
  private _totalItems = 0;
  private _data: any[] = [];

  get currentPage(): number {
    return this._currentPage;
  }

  set currentPage(value: number) {
    this._currentPage = value;
  }

  get itemsPerPage(): number {
    return this._itemsPerPage;
  }

  set itemsPerPage(value: number) {
    this._itemsPerPage = value;
  }

  get totalItems(): number {
    return this._totalItems;
  }

  set totalItems(value: number) {
    this._totalItems = value;
  }

  set data(value: any[]) {
    this._data = value;
    this._totalItems = value.length;
  }

  getPageItems(): Observable<any[]> {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return of(this._data.slice(start, end));
  }
}