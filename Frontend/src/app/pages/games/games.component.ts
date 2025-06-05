import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { filter } from 'rxjs';
import { GamesService } from '../../services/games.service';
import { Game } from '../../models/game/game';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category/category';
import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-games',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslatePipe,
    RouterModule,
  ],
  templateUrl: './games.component.html',
  styles: ``,
})
export class GamesComponent {
  // Api URL
  apiUrl = environment.apiUrl;
  // Datos Service
  aCategories: Category[] = [];
  allGames: Game[] = [];
  gamesResult!: number;
  // Pagination
  GAMES_PER_PAGE: number = 30;
  paginationGames!: Game[];
  pageNumber: number = 0;
  totalPages: number = 1;
  // Filters
  selectedCategories!: any[];
  valor: number = 2.5; // Bola en el centro (entre 0 y 5)
  filterForm!: FormGroup;
  searchForm!: FormGroup;
  isCategoriesFilterOpen: boolean = false;
  isRatingFilterOpen: boolean = false;
  isTimeFilterOpen: boolean = false;
  // Screen Size
  isMobileScreen!: boolean;

  constructor(
    private fb: FormBuilder,
    private gamesServ: GamesService,
    private categoriesServ: CategoriesService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    window.addEventListener('resize', this.onMobileToDesktop.bind(this));
    this.onMobileToDesktop();

    this.filterFormInit();

    this.getAllGames();
    this.getCategories();
  }

  // RESIZE
  onMobileToDesktop() {
    if (window.innerWidth > 1024) {
      this.isMobileScreen = false;
    } else if (window.innerWidth > 1024) {
      this.closeAllFilters();
    } else {
      this.isMobileScreen = true;
    }
  }

  // FILTERS
  filterFormInit() {
    this.filterForm = this.fb.group({
      categories: this.fb.array([]),
      rating: [0],
      time: [null],
    });
  }

  filterFormValidate() {
    this.filterForm = this.fb.group({
      categories: this.fb.array(
        this.aCategories.map(() => new FormControl(false))
      ),
      rating: [0],
      time: [null],
    });
    this.syncRatingInputs();
  }

  syncRatingInputs() {
    this.filterForm.get('rating')?.valueChanges.subscribe((value) => {
      this.filterForm.get('rating')?.setValue(+value, { emitEvent: false });
    });
  }

  resetTimeInputValue() {
    this.filterForm.get('time')?.setValue(null);
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.allGames.length / this.GAMES_PER_PAGE);
  }

  closeAllFilters() {
    this.isCategoriesFilterOpen = false;
    this.isRatingFilterOpen = false;
    this.isTimeFilterOpen = false;
  }

  openFilter(filter: 'categories' | 'rating' | 'time') {
    if (this.isMobileScreen) {
      switch (filter) {
        case 'categories':
          this.isCategoriesFilterOpen = !this.isCategoriesFilterOpen;
          this.isRatingFilterOpen = false;
          this.isTimeFilterOpen = false;
          break;
        case 'rating':
          this.isRatingFilterOpen = !this.isRatingFilterOpen;
          this.isCategoriesFilterOpen = false;
          this.isTimeFilterOpen = false;
          break;
        case 'time':
          this.isTimeFilterOpen = !this.isTimeFilterOpen;
          this.isRatingFilterOpen = false;
          this.isCategoriesFilterOpen = false;
          break;

        default:
          break;
      }
    } else {
      if (filter === 'categories')
        this.isCategoriesFilterOpen = !this.isCategoriesFilterOpen;
      if (filter === 'rating')
        this.isRatingFilterOpen = !this.isRatingFilterOpen;
      if (filter === 'time') this.isTimeFilterOpen = !this.isTimeFilterOpen;
    }
  }

  onSubmit() {
    const formValues = this.filterForm.value;

    // Filtramos solo las categorías marcadas
    this.selectedCategories = this.aCategories
      .filter((_, i) => formValues.categories[i])
      .map((cat) => cat.id);

    const data = {
      categories: this.selectedCategories.length
        ? this.selectedCategories.join(',')
        : undefined,
      rating: formValues.rating?.toString() || undefined,
      time: formValues.time?.toString() || undefined,
    };

    // reseteamos los filtros
    this.closeAllFilters();
    this.filterForm.reset();

    this.getGamesByFilter(data);
  }

  // SEARCH
  searchingGame() {
    const inputValue = (
      document.querySelector('#search-input') as HTMLInputElement
    )?.value;

    this.allGames = this.allGames.filter((game) =>
      game.title?.toLowerCase().includes(inputValue)
    );

    this.paginationGames = this.allGames.slice(0, this.GAMES_PER_PAGE);
    this.gamesResult = this.allGames.length;
    this.pageNumber = 0;
    this.calculateTotalPages()
  }

  // PAGINATION
  get isAtStart(): boolean {
    return this.pageNumber === 0;
  }

  get isAtEnd(): boolean {
    return (
      (this.pageNumber + 1) * this.GAMES_PER_PAGE >=
      (this.allGames?.length || 0)
    );
  }

  changePage(direction: 'next' | 'back') {
    direction === 'next' ? this.pageNumber++ : this.pageNumber--;

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    this.updatePaginationGames();
  }

  updatePaginationGames() {
    const start = this.pageNumber * this.GAMES_PER_PAGE;
    const end = start + this.GAMES_PER_PAGE;
    this.paginationGames = this.allGames.slice(start, end);
  }

  // SERVICES
  getAllGames() {
    this.gamesServ.getAllGames().subscribe({
      next: (data) => {
        this.allGames = data.games;
        this.paginationGames = data.games.slice(0, this.GAMES_PER_PAGE);
        this.gamesResult = data.results;
        this.calculateTotalPages();
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  getGamesByFilter(filters: {
    categories?: string;
    rating?: string;
    time?: string;
  }) {
    this.gamesServ.getGamesByFilter(filters).subscribe({
      next: (data) => {
        this.allGames = data.games;
        this.paginationGames = data.games.slice(0, this.GAMES_PER_PAGE);
        this.gamesResult = data.results;
        this.pageNumber = 0;
        this.calculateTotalPages();
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  getCategories() {
    this.categoriesServ.getCategories().subscribe({
      next: (data) => {
        this.aCategories = data.map((cat: any) => ({
          ...cat,
          translatedName: this.translate.instant(
            `games.categories.${cat.name}`
          ),
        }));

        this.filterFormValidate();
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  getRandomGames() {
    this.gamesServ.getRandomGames().subscribe({
      next: (data) => {
        this.allGames = data;
        this.paginationGames = data.slice(0, this.GAMES_PER_PAGE);
        this.gamesResult = data.length;
        this.pageNumber = 0;
        this.calculateTotalPages();
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }
}
