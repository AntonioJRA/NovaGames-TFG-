import { Component, inject, OnInit } from '@angular/core';
import { Game } from '../../models/games/games';
import { GamesService } from '../../services/games.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  public aPopularGames!:Game[];
  public gamesService = inject(GamesService);

  ngOnInit(){
    this.getAllGames()
  }

  private getAllGames(){
    this.gamesService.getAllGames().subscribe({
      next:(data)=>{
        this.aPopularGames = data
      },
      error:(err)=>{console.log(err.message);}
    })
  }

  
}
