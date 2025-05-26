import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Game } from '../../models/game/game';
import { GamesService } from '../../services/games.service';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  aPopularGames!: Game[];
  gamesService = inject(GamesService);
  token!: string;
  isAtStart = true;
  isAtEnd = false;

  @ViewChild('carousel') carousel!: ElementRef;

  constructor(public langServie: LanguageService) {}

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

  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -500, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPosition(), 300);
  }

  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 500, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPosition(), 300);
  }

  ngAfterViewInit() {
    if (this.carousel) {
      const el = this.carousel.nativeElement;
      el.addEventListener('scroll', () => this.checkScrollPosition());
      this.checkScrollPosition();
    }
  }

  checkScrollPosition() {
    const el = this.carousel.nativeElement;
    this.isAtStart = el.scrollLeft <= 0;
    this.isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
  }
}
