import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, of, throwError } from 'rxjs';
import { Game, GameRating, GameResponse } from '../models/game/game';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GamesService {
  public http = inject(HttpClient);

  getAllGames(): Observable<{ results: number; games: Game[] }> {
    return this.http
      .get<GameResponse>(
        `${environment.apiUrl}${environment.routes.games.getAllGames}`
      )
      .pipe(
        map((response) => ({
          results: response.results,
          games: response.games,
        })),
        catchError(this.handleError)
      );
  }

  getGamesByFilter(filters: {
    categories?: string;
    rating?: string;
    time?: string;
  }): Observable<{ results: number; games: Game[] }> {
    let params = new HttpParams();

    if (filters.categories) {
      params = params.set('categories', filters.categories);
    }

    if (filters.rating) {
      params = params.set('rating', filters.rating);
    }

    if (filters.time) {
      params = params.set('time', filters.time);
    }

    return this.http
      .get<GameResponse>(
        `${environment.apiUrl}${environment.routes.games.getGamesByFilter}`,
        { params }
      )
      .pipe(
        map((response) => ({
          results: response.results,
          games: response.games,
        })),
        catchError(this.handleError)
      );
  }

  getRandomGames(): Observable<Game[]> {
    return this.http
      .get<Game[]>(
        `${environment.apiUrl}${environment.routes.games.getRandomGames}`
      )
      .pipe(catchError(this.handleError));
  }

  getMostRatedGamesLimit(): Observable<Game[]> {
    return this.http
      .get<Game[]>(
        `${environment.apiUrl}${environment.routes.home.getMostRatedGamesLimit}`
      )
      .pipe(catchError(this.handleError));
  }

  getMostRecentGamesLimit(): Observable<Game[]> {
    return this.http
      .get<Game[]>(
        `${environment.apiUrl}${environment.routes.home.getMostRecentGamesLimit}`
      )
      .pipe(catchError(this.handleError));
  }

  getGame(id: string): Observable<Game> {
    return this.http
      .get<Game>(
        `${environment.apiUrl}${environment.routes.games.getGame}/${id}`
      )
      .pipe(catchError(this.handleError));
  }

  getGameRatingByUser(
    token: string,
    idGame: number
  ): Observable<GameRating | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<GameRating>(
        `${environment.apiUrl}${environment.routes.gameSection.getGameRatingByUser}`,
        {
          headers,
          params: { id: idGame },
        }
      )
      .pipe(catchError(() => of(null)));
  }

  addGameRating(
    token: string,
    idGame: number,
    userRating: number
  ): Observable<GameRating> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .post<GameRating>(
        `${environment.apiUrl}${environment.routes.gameSection.addGameRating}`,
        { idGame, userRating },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  updateGameRating(
    token: string,
    idGame: number,
    userRating: number
  ): Observable<GameRating> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .put<GameRating>(
        `${environment.apiUrl}${environment.routes.gameSection.updateGameRating}`,
        { idGame, userRating },
        { headers }
      )
      .pipe(catchError(this.handleError));
  }

  updateGameDownloads(idGame: number): Observable<void> {
    return this.http
      .put<void>(
        `${environment.apiUrl}${environment.routes.gameSection.updateGameDownloads}`,
        { idGame }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage: string = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente ${err.error.message}`;
    } else {
      errorMessage = `Error del servidor ${err.error.message}`;
    }
    return throwError(() => {
      new Error(errorMessage);
    });
  }
}
