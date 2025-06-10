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
import { UploadImageService } from '../../services/upload-image.service';

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
  // User
  userRole!: string;
  selectedFile: File | null = null;
  fileName!: string;
  isProfileOpen: boolean = true;
  isMyGamesOpen: boolean = false;
  isAdminPanelOpen: boolean = false;
  userData!: User;
  // MyGames
  userGamesData!: Game[];
  filteredGames!: Game[]
  searchValue: string = '';
  // Admin
  allGames!: Game[];
  allUsers!: User[];
  adminFilteredGames!: any[]
  adminFilteredUsers!: User[]
  isAdminGamesOpen: boolean = true;
  isAdminUsersOpen: boolean = false;

  constructor(
    public langServ: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    public userServ: UsersService,
    public gamesServ: GamesService,
    private translate: TranslateService,
    private uploadImageServ: UploadImageService
  ) { }

  ngOnInit(): void {
    document.body.style.overflow = 'auto';

    this.sessionToken = localStorage.getItem('user_session') || '';
    if (this.sessionToken) {
      this.getUser();
      this.getAllUserGames();
    }
    this.getAllUsers()

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

  onSearchChangeAdmin(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();

    if (this.isAdminGamesOpen) {
      this.searchValue = value;
      this.adminFilteredGames = this.allGames.filter((game) =>
        game.title.toLowerCase().includes(value)
      );
    } else if (this.isAdminUsersOpen) {
      this.searchValue = value;
      this.adminFilteredUsers = this.allUsers.filter((user) =>
        user.username.toLowerCase().includes(value) || user.email.toLowerCase().includes(value)
      );
    }
  }

  showSection(section: 'user' | 'games' | 'admin') {
    this.isProfileOpen = section === 'user';
    this.isMyGamesOpen = section === 'games';
    this.isAdminPanelOpen = section === 'admin';
  }

  get activeSectionKey(): string {
    if (this.isProfileOpen) return 'profile.myProfile';
    if (this.isMyGamesOpen) return 'profile.myGames.name';
    if (this.isAdminPanelOpen) return 'profile.adminPanel.name';
    return '';
  }

  switchAdminPanel(panel: 'games' | 'users') {
    const input = document.querySelector("#admin-searcher")
    if (input) {
      (input as HTMLInputElement).value = '';
    }
    this.adminFilteredGames = this.allGames
    this.adminFilteredUsers = this.allUsers

    if (panel === 'games') {
      this.isAdminGamesOpen = true
      this.isAdminUsersOpen = false
    } else if (panel === 'users') {
      this.isAdminGamesOpen = false
      this.isAdminUsersOpen = true
    }
  }

  // NAVIGATE
  navToEditSection(id: number) {
    this.router.navigate([`/upload-game/${id}`]);
  }
  navToGameSection(id: number) {
    this.router.navigate([`/game-section/${id}`]);
  }

  navToProfile(section: string) {
    this.router.navigate([`profile/${section}`]);
  }

  // SERVICES
  getUser() {
    if (this.sessionToken) {
      this.userServ.getUser(this.sessionToken).subscribe({
        next: (data) => {
          this.userData = data;
          this.userRole = this.userData.role
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
  getAllUserGames() {
    if (this.sessionToken) {
      this.gamesServ.getAllUserGames(this.sessionToken).subscribe({
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

  getAllGames() {
    this.gamesServ.getAllGamesWithUserEmail().subscribe({
      next: (data) => {
        this.allGames = data;
        this.adminFilteredGames = this.allGames
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  getAllUsers() {
    this.userServ.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data
        this.adminFilteredUsers = this.allUsers
        this.getAllGames()
      },
      error: (err) => {
        console.log(err.message);
      },
    });
  }

  deleteGame(id: number, deletedBy: 'self' | 'admin', email?:string,) {
    this.translate
      .get([
        'profile.myGames.alert.delete.title',
        'profile.myGames.alert.delete.text',
        'profile.myGames.alert.delete.confirm',
        'profile.myGames.alert.delete.confirmButtonText',
        'profile.myGames.alert.delete.cancelButtonText'
      ])
      .subscribe((translations) => {
        Swal.fire({
          icon: 'warning',
          title: translations['profile.myGames.alert.delete.title'],
          text: translations['profile.myGames.alert.delete.text'],
          showConfirmButton: true,
          confirmButtonText: translations['profile.myGames.alert.delete.confirmButtonText'],
          showCancelButton: true,
          cancelButtonText: translations['profile.myGames.alert.delete.cancelButtonText'],
        }).then((result) => {
          if (result.isConfirmed) {
            if (deletedBy === 'self') {
              this.gamesServ.deleteGame(id).subscribe({
                next: (data) => {
                  Swal.fire({
                    icon: 'success',
                    title:
                      translations['profile.myGames.alert.delete.confirm'],
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.reload();
                    }
                  });
                },
                error: (err) => {
                  console.log(err);
                },
              });
            } else if (deletedBy === 'admin' && email) {
              console.log(email);
              this.gamesServ.deleteGameByAdmin(this.sessionToken, id, email).subscribe({
                next: (data) => {
                  Swal.fire({
                    icon: 'success',
                    title:
                      translations['profile.myGames.alert.delete.confirm'],
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.reload();
                    }
                  });
                },
                error: (err) => {
                  console.log(err);
                },
              });
            }
          }
        });
      });
  }

  uploadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Solo permite imagenes
      if (!file.type.startsWith('image/')) {
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
        this.uploadImage()
      }
    }
  }

  uploadImage() {
    if (this.selectedFile) {
      this.uploadImageServ
        .postImageToServer(this.sessionToken, this.selectedFile)
        .subscribe({
          next: (response) => {
            this.fileName = response.filename;
            this.updateProfile()
          },
          error: (err) => {
            console.error('Error subiendo la imagen:', err);
          },
        });
    }
  }

  updateProfile() {
    if (this.sessionToken) {
      this.userServ.updateProfile(this.sessionToken, this.fileName).subscribe({
        next: (data) => {
          window.location.reload()
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
