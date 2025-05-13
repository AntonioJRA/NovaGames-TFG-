import { Injectable } from '@angular/core';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslatePipe,
} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translate: TranslateService) {}

  public changeLang(lang: string) {
    this.translate.use(lang);
    this.translate.currentLang = lang 
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang)
    }
  }

  public getCurrentLang() {
    return this.translate.currentLang;
  }
}
