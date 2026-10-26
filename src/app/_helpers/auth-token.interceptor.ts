import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

// TM-023: TasksService (and several other services) built their
// `Authorization: Bearer <token>` header once, in a field initializer
// evaluated when the Angular root-scoped singleton was first constructed —
// not fresh per request. If the stored JWT is ever rotated without a full
// page reload, those services kept sending the stale token for the rest of
// the SPA session. This interceptor reads the token fresh from storage on
// every outgoing request and stamps it onto the Authorization header,
// overriding whatever (possibly stale) value a service already set.
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            return next.handle(request);
        }
        const authorizedRequest = request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(authorizedRequest);
    }
}
