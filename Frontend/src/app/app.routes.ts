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
    path: 'upload-game/:id',
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
    path: 'profile/:section',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((c) => c.ProfileComponent),
  },
  {
    path: 'game-section/:id',
    loadComponent: () =>
      import('./pages/game-section/game-section.component').then((c) => c.GameSectionComponent),
  },
  {
    path: 'post/:id',
    loadComponent: () =>
      import('./pages/post/post.component').then((c) => c.PostComponent),
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./pages/help/help.component').then((c) => c.HelpComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./pages/about/about.component').then((c) => c.AboutComponent),
  },
];


