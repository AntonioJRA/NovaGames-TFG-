import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'auth/:token',
    loadComponent: () =>
      import('./pages/verification/verification.component').then((c) => c.VerificationComponent),
  },
  {
    path: 'games',
    loadComponent: () =>
      import('./pages/games/games.component').then((c) => c.GamesComponent),
  },
  {
    path: 'upload-game',
    loadComponent: () =>
      import('./pages/upload-game/upload-game.component').then((c) => c.UploadGameComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/signup/signup.component').then((c) => c.SignupComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((c) => c.ProfileComponent),
  },
];


