import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { UtilsService } from 'projects/design-lib/src/lib/services/utils/utils.service';

@Injectable()
export class AuthGuard {
  constructor(
    private auth: AuthService,
    private router: Router,
    private _utilsService: UtilsService
  ) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (next.routeConfig?.path == 'auth') {
      return false;
    } else {
      if (this.auth.isInvalidAccessToken()) {
        console.log(
          'Navegação com access token inválido. Obtendo novo token...'
        );
        await this.auth.getNewAccessToken();
        if (this.auth.isInvalidAccessToken()) {
          this.auth.redirectToLogin();
          return false;
        }
        return true;
      } else if (
        next.data['roles'] &&
        !this.auth.hasAnyPermission(next.data['roles'])
      ) {
        this.router.navigate(['/accessdenied']);
        return false;
      }
    }

    if (!this.auth.isLogged()) {
      this.auth.redirectToLogin();
    }

    return true;
  }
}
