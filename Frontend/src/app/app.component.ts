import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import translationES from '../../public/i18n/es.json';
import translationEN from '../../public/i18n/en.json';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslatePipe,
} from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  imports: [NavbarComponent, FooterComponent, RouterOutlet, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Frontend';

  public currentLang = 'es';
  constructor(private translate: TranslateService) {
    translate.setTranslation('en', translationEN);
    translate.setTranslation('es', translationES);

    let lang;

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!localStorage.getItem('lang')) {
        translate.setDefaultLang('es');
        localStorage.setItem('lang', 'es');
        lang = 'es';
      } else {
        lang = localStorage.getItem('lang');
      }
    }

    this.translate.use(lang === 'es' ? 'es' : 'en');
  }
}
