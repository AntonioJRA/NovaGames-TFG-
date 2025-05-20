import { routes } from '../app/app.routes';

// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  routes: {
    getUser: '/api/usuarios/usuario',
    home: {
      getMostRatedGamesLimit: '/api/juegos/valoracion',
    },
    auth: {
      login: '/api/login',
      register: '/api/register',
    },
  },
};
