import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; 
  }
  

  // IMPORTANTE: Redirigimos a WELCOME pasando la URL original
  router.navigate(['/welcome'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false;
};