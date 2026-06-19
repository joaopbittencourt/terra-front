import { AuthGuardData, createAuthGuard, Roles } from 'keycloak-angular';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthenticationService } from "../services/authentication.service";
import { NotificationService } from '../services/notification/notification';

/**
 * The logic below is a simple example, please make it more robust when implementing in your application.
 *
 * Reason: isAccessGranted is not validating the resource, since it is merging all roles. Two resources might
 * have the same role name and it makes sense to validate it more granular.
 */

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const authenticationService = inject(AuthenticationService);
  const { authenticated, grantedRoles } = authData;

  const requiredRole: Roles[] = route.data['roles'];
  //if (!!requiredRole ) {
  //  authenticationService.redirectToLoginPage();
  //  return false;
  //}
  

  const hasRequiredRole = (roles: Roles[]): boolean =>{
    let result = false;
    roles.forEach((role: any) => {
      //if(Object.values(grantedRoles.realmRoles).some((roles) => roles.includes(roles))) {
        if(grantedRoles.realmRoles.find((grantedRole: string) => grantedRole === role)) {
          result = true;
        } 
         
      
    })
    return result;
  }
  const router = inject(Router);

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
    
  }else {
    if(!authenticated) {
      authenticationService.redirectToLoginPage();
      return false;
    }
    return router.parseUrl('/dashboard?error=accessDenied');
  
  }

  
  return router.parseUrl('/');
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);