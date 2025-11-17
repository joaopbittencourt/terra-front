import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

import { AuthenticationService } from "../services/authentication.service";

export const LogoutRouteGuard: CanActivateFn = () => {
    const authenticationService = inject(AuthenticationService);
    const router = inject(Router);
    if (!authenticationService.isLoggedIn()) {
      return true;
    } else {
      return router.createUrlTree(['/']);
    }
  };