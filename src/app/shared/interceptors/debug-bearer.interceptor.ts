//import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
//import { tap } from 'rxjs';
//
///**
// * Interceptor funcional de DEBUG para verificar Bearer Token
// * Registra todas as requisições e respostas no console
// * 
// * Este é um interceptor ADICIONAL APENAS para DEBUG
// * Remove quando o problema estiver resolvido
// */
//export const debugBearerInterceptor: HttpInterceptorFn = (req, next) => {
//  const authHeader = req.headers.get('Authorization');
//  const hasToken = !!authHeader;
//  
//  console.group(`🔍 DEBUG: ${req.method} ${req.url}`);
//  console.log('URL completa:', req.url);
//  console.log('URL está relativa?', req.url.startsWith('/'));
//  console.log('Todos os headers:', req.headers);
//  console.log('✅ Authorization Header:', authHeader || '❌ SEM TOKEN');
//  console.log('Tem Bearer Token?', hasToken);
//  console.groupEnd();
//
//  return next(req).pipe(
//    tap(
//      (event) => {
//        if (event instanceof HttpResponse) {
//          console.log(`✅ Response ${req.method} ${req.url}:`, event.status);
//        }
//      },
//      (error: any) => {
//        console.error(`❌ Error ${req.method} ${req.url}:`, error.status, error.message);
//      }
//    )
//  );
//};
