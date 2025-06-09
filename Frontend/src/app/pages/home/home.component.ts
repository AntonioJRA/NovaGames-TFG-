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
import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Api URL
  apiUrl = environment.apiUrl;

  aPopularGames!: Game[];
  aRecentGames!: Game[];
  gamesService = inject(GamesService);
  token!: string;
  // Carousels
  isAtStartCarousel1: boolean = true;
  isAtEndCarousel1: boolean = false;
  isAtStartCarousel2: boolean = true;
  isAtEndCarousel2: boolean = false;

  @ViewChild('carousel1') carousel1!: ElementRef;
  @ViewChild('carousel2') carousel2!: ElementRef;

  constructor(public langServie: LanguageService) {}

  ngOnInit() {
    document.body.style.overflow = 'auto';
    this.getMostRatedGamesLimit();
    this.getMostRecentGamesLimit();
  }

  ngAfterViewInit() {
    if (this.carousel1) {
      const el = this.carousel1.nativeElement;
      el.addEventListener('scroll', () => this.checkScrollPositionCarousel1());
      this.checkScrollPositionCarousel1();
    }
  }

  scrollLeftCarousel1() {
    this.carousel1.nativeElement.scrollBy({ left: -500, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPositionCarousel1(), 300);
  }

  scrollRightCarousel1() {
    this.carousel1.nativeElement.scrollBy({ left: 500, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPositionCarousel1(), 300);
  }

  checkScrollPositionCarousel1() {
    const el = this.carousel1.nativeElement;
    this.isAtStartCarousel1 = el.scrollLeft <= 0;
    this.isAtEndCarousel1 = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
  }

  scrollLeftCarousel2() {
    this.carousel2.nativeElement.scrollBy({ left: -500, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPositionCarousel2(), 300);
  }

  scrollRightCarousel2() {
    this.carousel2.nativeElement.scrollBy({ left: 500, behavior: 'smooth' });
    setTimeout(() => this.checkScrollPositionCarousel2(), 300);
  }

  checkScrollPositionCarousel2() {
    const el = this.carousel2.nativeElement;
    this.isAtStartCarousel2 = el.scrollLeft <= 0;
    this.isAtEndCarousel2 = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
  }

  // SERVICES
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

  private getMostRecentGamesLimit() {
    this.gamesService.getMostRecentGamesLimit().subscribe({
      next: (data) => {
        this.aRecentGames = data;
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }
}
