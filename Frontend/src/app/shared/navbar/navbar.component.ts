// import { CommonModule } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLinkActive, TranslatePipe, RouterModule],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor (public langServ: LanguageService) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }
}
