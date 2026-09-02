import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import {
  AutoRefreshTokenService,
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition,
  includeBearerTokenInterceptor,
  provideKeycloak,
  UserActivityService,
} from 'keycloak-angular';
import { MAT_DATE_LOCALE } from '@angular/material/core';
//import { debugBearerInterceptor } from './shared/interceptors/debug-bearer.interceptor';
//import { forceTokenInterceptor } from './shared/interceptors/force-token.interceptor';

// Aceita URLs relativas (/api/...) e absolutas para localhost
const localhostCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
   urlPattern: /^(http:\/\/localhost:3000|\/api)(\/.*)?$/i,
   httpMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
   bearerPrefix: 'Bearer'
});


registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    // HTTP Client com Bearer Token Interceptor
    // Opção 1: includeBearerTokenInterceptor (recomendado) + debugBearerInterceptor
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    
    // Opção 2 (ALTERNATIVA para debug): Descomente a linha abaixo se Opção 1 não funcionar
    // provideHttpClient(withInterceptors([forceTokenInterceptor, debugBearerInterceptor])),
    
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [localhostCondition]
    },
    { 
      provide: MAT_DATE_LOCALE, 
      useValue: 'pt-BR' 
    },
    
    // Keycloak Configuration
    provideKeycloak({
      config: {
       realm: 'terra-app',
        url: 'http://localhost:8280/keycloak/',
        clientId: 'terra-app'
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      }
    }),
    AutoRefreshTokenService,
    UserActivityService,
    
    // Zone Change Detection
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // Router
    provideRouter(routes)
    
  ]
};
