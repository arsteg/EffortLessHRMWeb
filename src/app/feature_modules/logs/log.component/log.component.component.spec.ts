import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogComponent } from './log.component.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { UserService } from 'src/app/_services/users.service';
import { WebSocketService } from 'src/app/_services/web-socket.service';
import { CommonService } from 'src/app/_services/common.Service';
import { of, Subject } from 'rxjs';

describe('LogComponent', () => {
  let component: LogComponent;
  let fixture: ComponentFixture<LogComponent>;
  let messages: Subject<any>;

  beforeEach(async () => {
    messages = new Subject();
    await TestBed.configureTestingModule({
      imports: [LogComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['success', 'error']) },
        { provide: CompanyService, useValue: { getCompanies: () => of({ data: [] }) } },
        { provide: UserService, useValue: {} },
        { provide: WebSocketService, useValue: { getMessagesByType: () => messages } },
        { provide: CommonService, useValue: { getLogLevels: () => of({ data: [] }) } }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('clears displayed logs and unsubscribes when destroyed', () => {
    messages.next({ message: 'Isolated unit test log' });
    expect(component.messages.data.length).toBe(1);
    component.onClear();
    expect(component.messages.data).toEqual([]);
    fixture.destroy();
    messages.next({ message: 'After destruction' });
    expect(component.messages.data).toEqual([]);
  });
});
