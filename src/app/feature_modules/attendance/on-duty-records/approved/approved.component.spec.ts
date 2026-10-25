import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ApprovedOnDutyComponent } from './approved.component';

@Component({ selector: 'app-show-on-duty', template: '' })
class OnDutyTableStub {
  @Input() status: string;
  @Input() tab: number;
  @Input() actionOptions: any;
}

describe('ApprovedOnDutyComponent', () => {
  it('passes the selected tab, status and allowed actions to the table', async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovedOnDutyComponent, OnDutyTableStub],
      errorOnUnknownElements: true,
      errorOnUnknownProperties: true
    }).compileComponents();
    const fixture = TestBed.createComponent(ApprovedOnDutyComponent);
    fixture.componentInstance.selectedTab = 2;
    fixture.detectChanges();
    const table = fixture.debugElement.query(By.directive(OnDutyTableStub)).componentInstance;
    expect(table.status).toBe('Approved');
    expect(table.tab).toBe(2);
    expect(table.actionOptions).toEqual({ approve: false, reject: false, cancel: true, view: true });
  });
});
