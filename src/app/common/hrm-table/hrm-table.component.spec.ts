import { TestBed } from '@angular/core/testing';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { HrmTableComponent } from './hrm-table.component';
import { ExportService } from 'src/app/_services/export.service';

describe('HrmTableComponent', () => {
  const rows = [{ name: 'Test Alpha', hours: 3 }, { name: 'Test Beta', hours: 8 }];
  let exportService: any;
  beforeEach(async () => {
    exportService = jasmine.createSpyObj('ExportService', ['exportToCSV', 'exportToExcel', 'exportToPdf']);
    await TestBed.configureTestingModule({
      imports: [UiTestingModule],
      providers: [{ provide: ExportService, useValue: exportService }],
      errorOnUnknownElements: true, errorOnUnknownProperties: true
    }).compileComponents();
  });
  function render(serverSide = false) {
    const fixture = TestBed.createComponent(HrmTableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'name', name: 'Name' }, { key: 'hours', name: 'Hours' }]);
    fixture.componentRef.setInput('data', rows);
    fixture.componentRef.setInput('showSearch', true);
    fixture.componentRef.setInput('isServerSide', serverSide);
    fixture.detectChanges();
    return fixture;
  }
  it('filters through the named search input and displays the existing empty state', () => {
    const fixture = render();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('input[aria-label="Search table"]');
    search.value = 'beta';
    search.dispatchEvent(new KeyboardEvent('keyup'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Test Beta');
    expect(fixture.nativeElement.textContent).not.toContain('Test Alpha');
    search.value = 'no matching fixture';
    search.dispatchEvent(new KeyboardEvent('keyup'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('No records to display');
  });
  it('emits server search and pagination without filtering server results locally', () => {
    const fixture = render(true);
    const component = fixture.componentInstance;
    spyOn(component.searchChanged, 'emit');
    spyOn(component.pageChanged, 'emit');
    component.onSearch({ value: 'beta' });
    component.onPageChange({ pageIndex: 2, pageSize: 25, length: 100 });
    expect(component.searchChanged.emit).toHaveBeenCalledWith('beta');
    expect(component.pageChanged.emit).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 25 });
    expect(component.pagedData).toEqual(rows);
  });
  it('preserves selection and sort output contracts', () => {
    const component = render(true).componentInstance;
    spyOn(component.selectionChanged, 'emit');
    spyOn(component.sortChanged, 'emit');
    component.toggleRow(rows[0]);
    expect(component.selectionChanged.emit).toHaveBeenCalledWith([rows[0]]);
    component.onSort({ active: 'hours', direction: 'desc' });
    expect(component.sortChanged.emit).toHaveBeenCalledWith({ active: 'hours', direction: 'desc' });
  });
  it('exports displayed data with existing column labels without downloading a file', () => {
    const component = render().componentInstance;
    component.onSearch({ value: 'beta' });
    component.exportToCsv();
    expect(exportService.exportToCSV).toHaveBeenCalledWith('Report', 'Report', [{ Name: 'Test Beta', Hours: 8 }]);
  });
  it('honors the paginator input used by payroll while preserving the automatic default', () => {
    const fixture = render();
    expect(fixture.nativeElement.querySelector('mat-paginator')).toBeNull();
    fixture.componentRef.setInput('showPaginator', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-paginator')).not.toBeNull();
  });
});
