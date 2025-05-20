import { Component, inject, OnInit } from '@angular/core';
import { Game } from '../../models/game/game';
import { GamesService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  public aPopularGames!: Game[];
  public gamesService = inject(GamesService);
  token!: string;

  constructor(
    public langServie: LanguageService
  ) {}

  ngOnInit() {
    this.getMostRatedGamesLimit();
  }

  private getMostRatedGamesLimit() {
    this.gamesService.getMostRatedGamesLimit().subscribe({
      next: (data) => {
        this.aPopularGames = data;
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }
}
