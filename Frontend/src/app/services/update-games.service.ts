import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, of, throwError } from 'rxjs';
import { Game, GameCategories, GameRating, GameResponse } from '../models/game/game';
import { environment } from '../../environments/environment';
import { Category } from '../models/category/category';
import { GameUpdate } from '../models/updateGame/updateGame';

@Injectable({
  providedIn: 'root',
})
export class UpdateGameService {
  public http = inject(HttpClient);

  updateSectionGame(
    data: GameUpdate
  ): Observable<any> {
    return this.http
      .patch<any>(
        `${environment.apiUrl}${environment.routes.uploadGame.updateSectionGame}`,
        data 
      )
      .pipe(catchError(this.handleError));
  }



  private handleError(err: HttpErrorResponse) {
    let errorMessage: string = '';

    if (err.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${err.error.message}`;
    } else if (err.error && err.error.message) {
      errorMessage = err.error.message; // <- mensaje personalizado del backend
    } else {
      errorMessage = `Error del servidor: ${err.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
