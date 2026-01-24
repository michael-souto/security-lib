import { EventBusService } from 'projects/design-lib/src/lib/services/event-bus.service';
import { JwtPayload } from './../../models/token.model';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

import { JwtHelperService } from '@auth0/angular-jwt';

import { environment } from 'src/environments/environment';
import { CryptoService } from './crypto.service';
import { AuthenticationResponse } from '../../models/token.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {

  get payload(): JwtPayload | null {
    const token = localStorage.getItem(environment.tokenGetter);
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }
  constructor(
    protected http: HttpClient,
    protected jwtHelper: JwtHelperService,
    protected router: Router,
    protected cryptoService: CryptoService,
    protected eventBus: EventBusService
  ) {
  }

  ngOnDestroy() {
    console.log('AuthService foi destruído.');
  }

  login(
    user: string,
    password: string,
    actionSussess: () => void
  ): Promise<void> {
    console.log('Limpando token de acesso para login!');
    this.clearToken();

    const headersLogin = new HttpHeaders().append('Content-Type', 'application/json');
    const body = JSON.stringify({email: user,password: password});
    console.log('Iniciando request na URL ', environment.apiUrlAuth + environment.endPointAPILogin);

    return this.http
      .post(environment.apiUrlAuth + environment.endPointAPILogin, body, {
        headers: headersLogin
      })
      .toPromise()
      .then(async (response: any) => {
        this.saveToken(response);
        this.createRefreshTokenTimer(this.payload['expiresIn']);
        this.eventBus.emit({ type: 'user:logged' });
        await this.saveLoginData(user, password);
        actionSussess();
      })
      .catch((response) => {
        if (response.status === 400) {
          if (response.error === 'invalid_grant') {
            return Promise.reject('Usuário ou senha inválida!');
          }
        }

        return Promise.reject(response);
      });
  }

  logout() {
    this.clearToken();
    this.redirectToLogin();
  }

  protected async saveLoginData(user: string, password: string){}

  getNewAccessToken(): Promise<any> {
    const headersRefreshToken = new HttpHeaders()
      .append('Authorization', `Bearer ${localStorage.getItem(environment.refreshTokenGetter)}`);

    return this.http
      .post(environment.apiUrlAuth + environment.endPointAPIRefreshToken, null, {
        headers: headersRefreshToken,
      })
      .toPromise()
      .then((response: any) => {
        this.saveToken(response);
        this.createRefreshTokenTimer(this.payload['expiresIn']);
        return Promise.resolve(response);
      })
      .catch(async (response: any) => {
        this.handleAccessRenewalError();
        return Promise.resolve(response);
      });
  }

  sendRecoveryEmail(email: string): Promise<void> {
    const url = `${environment.apiUrlAuth}/auth/send_email_new_password`;
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain'
    });

    return this.http.post<void>(url, email, { headers })
      .toPromise()
      .then(() => {
        console.log('E-mail de recuperação enviado com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao enviar e-mail de recuperação:', error);
        return Promise.reject(error);
      });
  }

  resetPassword(newPassword: string, confirmNewPassword: string, token: string = null): Promise<void> {
    const url = `${environment.apiUrlAuth}/auth/new_password`;
    const tokenRenew = token ?? localStorage.getItem(environment.tokenGetter);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenRenew}`
    });
    const body = {
      newPassword,
      confirmNewPassword
    };

    return this.http.post<void>(url, body, { headers })
      .toPromise()
      .then(() => {
        console.log('Senha redefinida com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao redefinir a senha:', error);
        return Promise.reject(error);
      });
  }

  protected async handleAccessRenewalError() {
    this.redirectToLogin();
  }

  clearToken() {
    localStorage.removeItem(environment.tokenGetter);
    localStorage.removeItem(environment.refreshTokenGetter);
  }

  isInvalidAccessToken() {
    const token = localStorage.getItem(environment.tokenGetter);
    if (token == 'undefined' || token == null || token == undefined || token == '') {
      return true;
    }
    return !token || this.jwtHelper.isTokenExpired(token);
  }

  isLogged() {
    const token = localStorage.getItem(environment.tokenGetter);
    return !!token && !this.isInvalidAccessToken();
  }

  hasPermission(permissao: string) {
    return this.payload && this.payload.authorities.includes(permissao);
  }

  hasAnyPermission(roles: string[]) {
    for (const role of roles) {
      if (this.hasPermission(role)) {
        return true;
      }
    }
    return false;
  }

  public async saveToken(token: AuthenticationResponse) {
    console.log('ARMAZENANDO TOKEN ----------------------------------');
    localStorage.setItem(environment.tokenGetter, token.access_token);
    localStorage.setItem(environment.refreshTokenGetter, token.refresh_token);
    this.updateUrlImage(this.payload?.urlImg);
    this.executeAfterSaveToken(token);
  }

  protected async executeAfterSaveToken(token: AuthenticationResponse) { }

  public getLoginPage(): string {
    return environment.urlProject[environment.urlProject.length - 1] == '/'
      ? environment.urlProject.substring(0, environment.urlProject.length - 1)
      : environment.urlProject;
  }

  public isLoginPage(): boolean {
    let url = this.getLoginPage();
    return window.location.href == url + environment.routePageLogin;
  }

  public isRegisterPage(): boolean {
    let url = this.getLoginPage();
    return window.location.href.indexOf(url + environment.routePageRegister) >= 0;
  }

  public isNewPasswordPage(): boolean {
    let url = this.getLoginPage();
    return window.location.href == url + environment.routePageNewPassword;
  }

  public getDetrasoftId(): number {
    return this.payload?.detrasoftId;
  }

  public getUserId(): string {
    return this.payload?.userId;
  }

  public getUserFirstName(): string {
    return this.payload?.firstName;
  }

  public getUserLastName(): string {
    return this.payload?.lastName;
  }
  public getUserFullName(): string {
    return `${this.payload?.firstName} ${this.payload?.lastName}`;
  }

  public getUserType(): string {
    return this.payload?.type;
  }

  public getUserBusiness(): string {
    return this.payload?.business;
  }

  public getUrlImage(): string {
    const customImage = localStorage.getItem('user_url_image');
    if (customImage) return customImage;
    this.updateUrlImage(this.payload?.urlImg ?? 'assets/layout/images/avatar-64.png');
    return customImage;
  }

  public getUserEmail(): string {
    return this.payload['sub'];
  }

  updateUrlImage(urlImg: string) {
    localStorage.setItem('user_url_image', urlImg);
  }

  public redirectToLogin() {
    console.log('Direcionando para login...');
    if (!this.isLoginPage()) {
      console.log('ARMAZENANDO ULTIMA PAGINA ===> ', window.location.href);
      this.previousUrl = window.location.href;
    }
    this.router.navigate([environment.routePageLogin]);
  }

  get previousUrl(): string {
    return localStorage.getItem('previous-url') ?? '';
  }
  set previousUrl(url: string | null) {
    if (url == null) {
      localStorage.removeItem('previous-url');
    } else {
      localStorage.setItem('previous-url', url);
    }
  }

  refreshTokenTimer: ReturnType<typeof setTimeout>;

  createRefreshTokenTimer(expiresIn: number) {
    if (this.refreshTokenTimer) {
      console.log('Limpando timer de refresh token atual...')
      clearTimeout(this.refreshTokenTimer);
    }

    // Se faltar menos de 15 minutos para expirar o token ele já solicita um novo token
    const refreshTime = expiresIn - 15;
    if (refreshTime <= 0) {
      this.getNewAccessToken();
    } else {
      // Se faltar mais de 15 minutos para expirar ele mantem a estratégia de criar um
      // temporizador para renovar o token quando estiver próximo de expirar
      this.refreshTokenTimer = setTimeout(() => {
        console.log('Timer de refreseh token sendo executado a partir de agora......')
        this.getNewAccessToken();
      }, refreshTime * 1000);
      console.log(`Timer de refresh token configurado para chamar em ${refreshTime} segundos.`);
    }
  }

  public async carregarToken(tokenGetter: string = null) {
    const token = localStorage.getItem(tokenGetter ?? environment.tokenGetter);
    if (token) {
      const dateExpiresIn = this.jwtHelper.getTokenExpirationDate(token);
      const expiresIn = Math.floor(( dateExpiresIn.getTime()- new Date().getTime()) / 1000);
      if (expiresIn > 0) {
        this.createRefreshTokenTimer(expiresIn);
      } else {
        this.getNewAccessToken();
      }
    }
  }

  changePassword(currentPassword: string, password: string, confirmPassword: string): Promise<void> {
    const url = `${environment.apiUrlAuth}/auth/change_password`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const body = {
      oldPassword: currentPassword,
      newPassword: password,
      confirmNewPassword: confirmPassword
    };

    return this.http.post<void>(url, body, { headers })
      .toPromise()
      .then(() => {
        console.log('Senha alterada com sucesso');
      })
      .catch((error) => {
        console.error('Erro ao alterar a senha:', error);
        return Promise.reject(error);
      });
  }
}
