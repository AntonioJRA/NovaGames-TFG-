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
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { GamesService } from '../../services/games.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    RouterLinkActive,
    TranslatePipe,
    RouterModule,
    ChangeLanguageComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './navbar.component.html',
  styles: ``,
})
export class NavbarComponent implements OnInit {
  // Api URL
  apiUrl = environment.apiUrl;
  // Menu
  isMenuOpen: boolean = false;
  // User
  isProfileOpen: boolean = false;
  isUserLogged: boolean = false;
  userData!: User;
  sessionToken!: string;
  // Upload Game
  isUploadGameModalOpen: boolean = false;
  modalForm!: FormGroup;
  modalError: boolean = false;

  constructor(
    public langServ: LanguageService,
    public userServ: UsersService,
    public gameServ: GamesService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    window.addEventListener('resize', this.onMobileToDesktop.bind(this));
    window.addEventListener('resize', this.onDesktopToMobile.bind(this));
    this.onMobileToDesktop();
    this.onDesktopToMobile();

    this.sessionToken = localStorage.getItem('user_session') || '';

    this.checkToken();

    this.modalValidate();
  }

  get isUploadGameActive(): boolean {
    return this.router.url === '/upload-game';
  }

  // WINDOW SIZE
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

  // MENU
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  signOut() {
    localStorage.removeItem('user_session');
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  // MODAL
  toggleModal() {
    this.isUploadGameModalOpen = !this.isUploadGameModalOpen;
    this.toggleMenu();

    if (this.isUploadGameModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  modalValidate() {
    this.modalForm = this.fb.group({
      title: ['', [Validators.required]],
    });
  }

  modalOnSubmit() {
    if (this.modalForm.valid) {
      const formValue = this.modalForm.value;
      const title = formValue.title;

      this.addGame(title);
    }
  }

  // NAVIGATES
  navToHome() {
    this.router.navigate(['']);
    this.showScroll();
    this.toggleProfile();
    this.toggleMenu()
  }
  navToLogIn() {
    this.router.navigate(['login']);
    this.showScroll();
    this.toggleProfile();
  }
  navToSignUp() {
    this.router.navigate(['sign-up']);
    this.showScroll();
    this.toggleProfile();
  }
  navToProfile(section: string) {
    this.router.navigate([`profile/${section}`]);
    this.showScroll();
    this.toggleProfile();
    this.toggleMenu()
  }
  navToUploadGame() {
    if(this.isProfileOpen) this.isProfileOpen = false
    this.sessionToken ? this.toggleModal() : this.router.navigate(['/login']);
  }

  showScroll() {
    if (this.isMenuOpen) {
      document.body.style.overflow = 'auto';
    }
  }

  // SERVICES
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

  addGame(title: string) {
    this.gameServ.addGame(this.sessionToken, title).subscribe({
      next: (data) => {
        this.toggleModal();
        this.showScroll();
        this.getLastGame();
      },
      error: (err) => { },
    });
  }

  getLastGame() {
    this.gameServ.getLastGame().subscribe({
      next: (data) => {
        this.router.navigate([`upload-game/${data.id}`]);
      },
      error: (err) => { },
    });
  }
}
