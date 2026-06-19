//import { HttpInterceptorFn } from '@angular/common/http';
//import { inject } from '@angular/core';
//import { KeycloakService } from 'keycloak-angular';
//
///**
// * Interceptor ALTERNATIVO e MAIS AGRESSIVO para DEBUG
// * Força o token em TODAS as requisições para /api/
// * 
// * Use este se o includeBearerTokenInterceptor não funcionar
// * REMOVA QUANDO PROBLEMA ESTIVER RESOLVIDO
// */
//export const forceTokenInterceptor: HttpInterceptorFn = (req, next) => {
//  const keycloak = inject(KeycloakService);
//  
//  // Se a requisição é para /api/ e o usuário está autenticado
//  if (req.url.includes('/api') && keycloak.isLoggedIn()) {
//    const token = keycloak.getToken();
//    
//    if (token) {
//      console.log('💪 FORCE TOKEN INTERCEPTOR: Adicionando token à requisição', req.url);
//      
//      // Clone a requisição e adiciona o header Authorization
//      const clonedReq = req.clone({
//        setHeaders: {
//          'Authorization': `Bearer ${token}`
//        }
//      });
//      
//      console.log('✅ Token adicionado:', clonedReq.headers.get('Authorization'));
//      return next(clonedReq);
//    } else {
//      console.warn('⚠️ FORCE TOKEN INTERCEPTOR: Token não disponível para', req.url);
//    }
//  }
//  
//  return next(req);
//};
