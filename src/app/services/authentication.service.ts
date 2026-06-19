import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { NotificationService } from './notification/notification';
//import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
    private readonly keycloakService = inject(Keycloak);
    private readonly notificationsService = inject(NotificationService);
  constructor() {}

  redirectToLoginPage(): Promise<void> {
    
    return this.keycloakService.login();
  }

  get userName(): string {
    return this.keycloakService.tokenParsed?.['preferred_username'] || ''    ;
  }

  isLoggedIn(): boolean {
    return this.keycloakService.authenticated || false; 
  }

  logout(): void {
    this.keycloakService.logout();
  }
}