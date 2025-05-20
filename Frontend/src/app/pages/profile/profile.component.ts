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
import { TranslatePipe } from '@ngx-translate/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../models/user/user';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { formatDate } from '@angular/common';

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
  isProfileOpen: boolean = true;
  isMyGamesOpen: boolean = false;
  isAdminPanelOpen: boolean = false;
  userData!: User;
  sessionToken!: string;

  constructor(
    public langServ: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    public userServ: UsersService
  ) {}

  ngOnInit(): void {
    this.sessionToken = localStorage.getItem('user_session') || '';
    this.getUser();
  }

  showSection(section: 'profile' | 'games' | 'admin') {
    this.isProfileOpen = section === 'profile';
    this.isMyGamesOpen = section === 'games';
    this.isAdminPanelOpen = section === 'admin';
  }

  get activeSectionKey(): string {
    if (this.isProfileOpen) return 'profile.myProfile';
    if (this.isMyGamesOpen) return 'profile.myGames';
    if (this.isAdminPanelOpen) return 'profile.adminPanel';
    return '';
  }

  formatDate(date:Date | undefined){
    if (date) {
      const lang = localStorage.getItem('lang') || 'es'

      if (lang === 'es') {
        console.log(date);
        // return date
      } else {
        
      }
    }
  }

  getUser() {
    if (this.sessionToken) {
      this.userServ.getUser(this.sessionToken).subscribe({
        next: (data) => {
          this.userData = data;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
