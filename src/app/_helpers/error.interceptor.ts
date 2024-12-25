import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../_services/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    isToasterVisible: boolean = false;
    constructor(
        private authenticationService: AuthenticationService,
        private toastr: ToastrService,
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                if(err.error.status === 'fail') {
                    if(!this.isToasterVisible){
                        this.isToasterVisible = true;
                        this.toastr.error(err.error.message, 'Error').onHidden.subscribe(() => {
                            this.isToasterVisible = false;
                        })
                    }
                }
                this.authenticationService.logout();
               // location.reload(true);
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}
