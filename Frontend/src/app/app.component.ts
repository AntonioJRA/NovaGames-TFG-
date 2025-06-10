import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import translationES from '../../public/i18n/es.json';
import translationEN from '../../public/i18n/en.json';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, FooterComponent, RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  public currentLang = 'es';
  public showNavbar = true;

  constructor(private translate: TranslateService, private router: Router) {
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

    // Lógica del navbar
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const hiddenRoutes = ['/login', '/sign-up'];
        const currentUrl = event.urlAfterRedirects;
        this.showNavbar = !(
          hiddenRoutes.includes(currentUrl) ||
          currentUrl.startsWith('/auth/') ||
          currentUrl.startsWith('/profile/')
        );
      }
    });
  }
}
