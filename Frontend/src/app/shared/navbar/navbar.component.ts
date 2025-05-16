import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
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
  isUserLogged: boolean = false;
  userToken:string = ''
  userData!:User;

  constructor(
    public langServ: LanguageService,
    private router: Router,
    public userServ: UsersService
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize.bind(this));
    this.checkToken();
  }

  onResize() {
    if (window.innerWidth > 1024 && this.isMenuOpen) {
      this.isMenuOpen = false;
      this.showScroll();
    }
  }

  checkToken() {
    const token = localStorage.getItem('user_session');
    if (token) {
      this.userServ.getUser(token).subscribe({
        next: (data) => {
          this.userData = data
          this.isUserLogged = true;
        },
        error: (err) => {
          console.log(err);
        },
      })
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

  showScroll() {
    if (this.isMenuOpen) {
      document.body.style.overflow = 'auto';
    }
  }
}
