import { routes } from "../app/app.routes";

// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/',
  routes: {
    getAllGames: '/api/juegos/valoracion'
  }
};
