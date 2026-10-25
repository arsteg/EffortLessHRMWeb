import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommonComponentsModule } from '../app/common/commonComponents.module';
import { UserService } from '../app/_services/users.service';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { WebSocketService } from '../app/_services/web-socket.service';
import { Subject, filter } from 'rxjs';

function createTestSocket() {
  const messages = new Subject<any>();
  let userId: string | null = null;
  return {
    connect: (id: string) => { userId = id; },
    disconnect: () => { userId = null; },
    isConnected: () => userId !== null,
    getUserId: () => userId,
    getMessagesByType: (type: string) => messages.pipe(filter(message => message.notificationType === type)),
    sendMessage: jasmine.createSpy('sendMessage'),
    ngOnDestroy: () => messages.complete()
  };
}

// Real UI dependencies, with HTTP intercepted by Angular's testing backend.
// Feature-specific inputs, dialog data and service responses belong in each spec.
// No schemas or template overrides: malformed bindings must remain visible.
@NgModule({
  imports: [
    HttpClientTestingModule, NoopAnimationsModule, RouterTestingModule,
    TranslateModule.forRoot(), CommonComponentsModule, MatIconTestingModule
  ],
  exports: [
    HttpClientTestingModule, NoopAnimationsModule, RouterTestingModule,
    TranslateModule, CommonComponentsModule
  ],
  providers: [UserService, DatePipe, { provide: WebSocketService, useFactory: createTestSocket }]
})
export class UiTestingModule {}
