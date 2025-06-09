import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user/user';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { formatDate } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { environment } from '../../../environments/environment';
import { Game } from '../../models/game/game';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  imports: [
    LogoHeaderComponent,
    TranslatePipe,
    CommonModule,
    ChangeLanguageComponent,
  ],
  templateUrl: './profile.component.html',
  styles: ``,
})
export class ProfileComponent implements OnInit {
  // Api URL
  apiUrl = environment.apiUrl;
  // Token
  sessionToken!: string;
  // Profile
  isProfileOpen: boolean = true;
  isMyGamesOpen: boolean = false;
  isAdminPanelOpen: boolean = false;
  userData!: User;
  userGamesData!: Game[];

  filteredGames: Game[] = []; // Los que se muestran
  searchValue: string = ''; // Input del usuario

  constructor(
    public langServ: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    public userServ: UsersService,
    public gameServ: GamesService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    document.body.style.overflow = 'auto';
    
    this.sessionToken = localStorage.getItem('user_session') || '';
    this.getUser();

    this.route.paramMap.subscribe((params) => {
      const section = params.get('section') as 'user' | 'games' | 'admin';
      this.showSection(section);
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();

    this.searchValue = value;
    this.filteredGames = this.userGamesData.filter((game) =>
      game.title.toLowerCase().includes(value)
    );
  }

  showSection(section: 'user' | 'games' | 'admin') {
    this.isProfileOpen = section === 'user';
    this.isMyGamesOpen = section === 'games';
    this.isAdminPanelOpen = section === 'admin';
  }

  navToProfile(section: string) {
    this.router.navigate([`profile/${section}`]);
  }

  get activeSectionKey(): string {
    if (this.isProfileOpen) return 'profile.myProfile';
    if (this.isMyGamesOpen) return 'profile.myGames.name';
    if (this.isAdminPanelOpen) return 'profile.adminPanel';
    return '';
  }

  formatDate(date: Date | undefined) {
    if (date) {
      const lang = localStorage.getItem('lang') || 'es';

      if (lang === 'es') {
        console.log(date);
        // return date
      } else {
      }
    }
  }

  // NAVIGATE
  navToEditSection(id: number) {
    this.router.navigate([`/upload-game/${id}`]);
  }

  // SERVICES
  getUser() {
    if (this.sessionToken) {
      this.userServ.getUser(this.sessionToken).subscribe({
        next: (data) => {
          this.userData = data;
          this.getAllUserGames();
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
  getAllUserGames() {
    if (this.sessionToken) {
      this.gameServ.getAllUserGames(this.sessionToken).subscribe({
        next: (data) => {
          this.userGamesData = data;
          this.filteredGames = data;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  deleteGame(id: number) {
    this.translate
      .get(['auth.signUp.alert.emailAlreadyExists'])
      .subscribe((translations) => {
        Swal.fire({
          icon: 'warning',
          title: translations['auth.signUp.alert.emailAlreadyExists'],
          text: translations['auth.signUp.alert.emailAlreadyExists'],
          showConfirmButton: true,
          confirmButtonText: 'OK',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.gameServ.deleteGame(id).subscribe({
              next: (data) => {
                this.translate
                  .get(['auth.signUp.alert.emailAlreadyExists'])
                  .subscribe((translations) => {
                    Swal.fire({
                      icon: 'success',
                      title:
                        translations['auth.signUp.alert.emailAlreadyExists'],
                      showConfirmButton: true,
                      confirmButtonText: 'OK',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        window.location.reload();
                      }
                    });
                  });
              },
              error: (err) => {
                console.log(err);
              },
            });
          }
        });
      });
  }
}
