import { routes } from '../app/app.routes';

// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  routes: {
    getUser: '/api/usuarios/usuario',
    home: {
      getMostRatedGamesLimit: '/api/juegos/valoracion',
      getMostRecentGamesLimit: '/api/juegos/recientes',
      addGame: '/api/juegos/crear',
    },
    auth: {
      login: '/api/login',
      register: '/api/register',
    },
    games: {
      getAllGames: '/api/juegos',
      getGamesByFilter: '/api/juegos/filtros',
      getCategories: '/api/categorias',
      getContentBlocks: '/api/seccion-juego/contenido',
      getGame: '/api/juegos',
      getRandomGames: '/api/juegos/random',
      getLastGame: '/api/juegos/ultimo',
    },
    gameSection: {
      getAllPosts: '/api/publicaciones',
      getGameRatingByUser: '/api/juegos/rating-usuario',
      addGameRating: '/api/juegos/subir-rating',
      updateGameRating: '/api/juegos/actualizar-rating',
      updateGameDownloads: '/api/juegos/actualizar-descargas',
      getGameCategories: '/api/seccion-juego/categorias'
    },
    posts: {
      getPost: '/api/publicacion',
    },
    uploadGame: {
      updateSectionGame: '/api/seccion-juego/guardar',
      developerVerification: '/api/verificar-user',      
    },

  },
};
