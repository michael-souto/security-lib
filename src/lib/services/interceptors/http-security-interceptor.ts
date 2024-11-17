import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

export class NotAuthenticatedError {}

@Injectable()
export class HttpSecurityInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      this.auth.isInvalidAccessToken() &&
      !this.auth.isLoginPage() &&
      !this.auth.isRegisterPage() &&
      !this.auth.isNewPasswordPage() &&
      !req.url.includes(environment.endPointAPILogin) &&
      !req.url.includes(environment.endPointAPIRegister) &&
      !req.url.includes(environment.endPointAPIRefreshToken) &&
      req.url.indexOf('/assets') < 0
      ) {
      console.log('Navegação com access token inválido. Obtendo novo token...',
        (this.auth.isInvalidAccessToken()),
        (!this.auth.isLoginPage()),
        (!this.auth.isRegisterPage()),
        (!req.url.includes(environment.endPointAPILogin)),
        (!req.url.includes(environment.endPointAPIRegister)),
        (!req.url.includes(environment.endPointAPIRefreshToken)),
        (req.url.indexOf('/assets') < 0)
      );
      return from(this.auth.getNewAccessToken()).pipe(
        mergeMap(() => {
          if (this.auth.isInvalidAccessToken()) {
          }
          return next.handle(req)
        })
      );
    } else {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.auth.redirectToLogin();
          }
          return throwError(() => new HttpErrorResponse(error));
        })
      );
    }
  }
}
