import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ChangeLanguageComponent } from '../change-language/change-language.component';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user/user';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLinkActive,
    TranslatePipe,
    RouterModule,
    ChangeLanguageComponent,
  ],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent implements OnInit {
  isMenuOpen: boolean = false;
  isProfileOpen: boolean = false;
  isUserLogged: boolean = false;
  userToken: string = '';
  userData!: User;
  token!: string;

  constructor(
    public langServ: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    public userServ: UsersService
  ) {}

  async ngOnInit() {
    window.addEventListener('resize', this.onMobileToDesktop.bind(this));
    window.addEventListener('resize', this.onDesktopToMobile.bind(this));

    this.token = localStorage.getItem('user_session') || '';

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.token = localStorage.getItem('user_session') || '';
        this.checkToken();
      }
    });

    await this.checkEmail();

    this.checkToken();
  }

  checkEmail(): Promise<void> {
    return new Promise((resolve) => {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe(async (event: NavigationEnd) => {
          const url = event.urlAfterRedirects || event.url;
          const tokenMatch = url.match(/\/auth\/([^\/\?]+)/);
          if (tokenMatch && tokenMatch[1]) {
            const token = tokenMatch[1];
            localStorage.setItem('user_session', token);
            await this.router.navigate(['']);
          }
          resolve();
        });
    });
  }

  onMobileToDesktop() {
    if (window.innerWidth > 1024 && this.isMenuOpen) {
      this.isMenuOpen = false;
      this.showScroll();
    }
  }
  onDesktopToMobile() {
    if (window.innerWidth < 1024 && this.isProfileOpen) {
      this.isProfileOpen = false;
      this.showScroll();
    }
  }

  checkToken() {
    console.log(this.token);
    if (this.token) {
      this.userServ.getUser(this.token).subscribe({
        next: (data) => {
          this.userData = data;
          this.isUserLogged = true;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  navToHome() {
    this.router.navigate(['']);
    this.showScroll();
  }
  navToLogIn() {
    this.router.navigate(['login']);
    this.showScroll();
  }
  navToSignUp() {
    this.router.navigate(['sign-up']);
    this.showScroll();
  }
  navToProfile() {
    this.router.navigate(['profile']);
    this.showScroll();
  }

  showScroll() {
    if (this.isMenuOpen) {
      document.body.style.overflow = 'auto';
    }
  }
}
