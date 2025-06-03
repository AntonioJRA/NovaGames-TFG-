import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ChangeLanguageComponent } from '../change-language/change-language.component';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user/user';

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
  userData!: User;
  sessionToken!: string;

  constructor(
    public langServ: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    public userServ: UsersService
  ) {}

  ngOnInit() {
    window.addEventListener('resize', this.onMobileToDesktop.bind(this));
    window.addEventListener('resize', this.onDesktopToMobile.bind(this));
    this.onMobileToDesktop();
    this.onDesktopToMobile();

    this.sessionToken = localStorage.getItem('user_session') || '';

    this.checkToken();
  }

  get isUploadGameActive(): boolean {
    return this.router.url === '/upload-game';
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
    if (this.sessionToken) {
      this.userServ.getUser(this.sessionToken).subscribe({
        next: (data) => {
          if (data) {
            this.userData = data;
            this.isUserLogged = true;
          } else {
            localStorage.removeItem('user_session');
          }
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

  signOut() {
    localStorage.removeItem('user_session');
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }
  navigateUploadGame() {
    this.sessionToken
      ? this.router.navigate(['/upload-game'])
      : this.router.navigate(['/login']);
  }
}
