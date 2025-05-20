import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-games',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent],
  templateUrl: './games.component.html',
  styles: ``,
})
export class GamesComponent {
  aCategories: string[] = [
    'Acción',
    'Aventura',
    'Rol',
    'Estrategia',
    'Simulación',
    'Deportes',
    'Carreras',
    'Lucha',
    'Terror',
    'Plataformas',
    'Puzzle',
    'Multijugador masivo (MMO)',
    'Shooter',
    'Sandbox',
    'Indie',
  ];
  selectedCategories: string[] = [];
  valor: number = 2.5; // Bola en el centro (entre 0 y 5)
  filterForm!: FormGroup;
  isCategoriesFilterOpen: boolean = false;
  isRatingFilterOpen: boolean = false;
  isTimeFilterOpen: boolean = false;
  isMobileScreen!: boolean;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    window.addEventListener('resize', this.onMobileToDesktop.bind(this));
    this.onMobileToDesktop();
    this.filterFormValidate();
    this.syncRatingInputs();
  }

  filterFormValidate() {
    this.filterForm = this.fb.group({
      categories: this.fb.array(
        this.aCategories.map(() => new FormControl(false))
      ),
      rating: [0],
      time: [null],
    });
  }

  syncRatingInputs() {
    this.filterForm.get('rating')?.valueChanges.subscribe((value) => {
      this.filterForm.get('rating')?.setValue(+value, { emitEvent: false });
    });
  }

  resetTimeInputValue() {
    this.filterForm.get('time')?.setValue(null);
  }

  onMobileToDesktop() {
    window.innerWidth > 1024
      ? (this.isMobileScreen = false)
      : (this.isMobileScreen = true);
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
    this.selectedCategories = this.filterForm.value.categories.reduce(
      (arr: string[], checked: boolean, index: number) => {
        if (checked) arr.push(this.aCategories[index]);
        return arr;
      },
      []
    );
    // cerramos los filtros
    this.isCategoriesFilterOpen = false;
    this.isRatingFilterOpen = false;
    this.isTimeFilterOpen = false;

    const data = {
      categories: this.selectedCategories,
      rating: this.filterForm.value.rating,
      time: this.filterForm.value.time,
    };

    this.filterForm.reset();
    console.log(data);
  }
}
