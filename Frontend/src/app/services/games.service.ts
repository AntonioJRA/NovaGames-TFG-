import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, throwError } from 'rxjs';
import { Game } from '../models/game/game';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GamesService {

  public http = inject(HttpClient)
  

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${environment.apiUrl}${environment.routes.getAllGames}`).pipe(
      catchError(this.handleError)
    )
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage: string = "";
    if (err.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente ${err.error.message}`
    } else {
      errorMessage = `Error del servidor ${err.error.message}`
    }
    return throwError(() => {
      new Error(errorMessage)
    })
  }
}
