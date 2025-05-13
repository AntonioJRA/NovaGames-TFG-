import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'juegos',
    loadComponent: () =>
      import('./pages/games/games.component').then((c) => c.GamesComponent),
  },
  {
    path: 'subir-juego',
    loadComponent: () =>
      import('./pages/upload-game/upload-game.component').then((c) => c.UploadGameComponent),
  },
];


