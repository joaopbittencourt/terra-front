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

  get name(): string {
    return this.keycloakService.tokenParsed?.['name'] || ''    ;
  }

  get email(): string {
    return this.keycloakService.tokenParsed?.['email'] || '';
  }

  isLoggedIn(): boolean {
    return this.keycloakService.authenticated || false; 
  }

  hasRoles(roles: string[]): boolean {
    const userRoles = this.keycloakService.tokenParsed?.['realm_access']?.['roles'] || [];
    return roles.some(role => userRoles.includes(role));
  }

  logout(): void {
    this.keycloakService.logout();
  }
}