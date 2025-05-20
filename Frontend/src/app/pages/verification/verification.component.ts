import { Component, OnInit } from '@angular/core';
import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import {
  ActivatedRoute,
  Router
} from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import { UsersService } from '../../services/users.service';
import { ButtonComponent } from "../../shared/button/button.component";

@Component({
  selector: 'app-verification',
  imports: [LogoHeaderComponent, ButtonComponent,TranslatePipe],
  templateUrl: './verification.component.html',
  styles: ``,
})
export class VerificationComponent implements OnInit {
  token!: string;

  constructor(
    public langServ: LanguageService,
    private router: Router,
    private route: ActivatedRoute,
    public userServ: UsersService
  ) {}

  ngOnInit() {
    this.setSessionToken()
  }

  setSessionToken(){
    this.route.params.subscribe((params) => {
      this.token = params['token']
      if (this.token) {
        console.log(this.token);
        localStorage.setItem('user_session', this.token);
      }
    });
  }

  navToHome() {
    this.router.navigate(['']);
  }
}
