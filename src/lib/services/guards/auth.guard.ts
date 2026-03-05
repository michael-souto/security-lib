import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(
    private auth: AuthService,
    private router: Router
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
