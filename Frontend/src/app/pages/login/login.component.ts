import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    LogoHeaderComponent,
    ButtonComponent,
    TranslatePipe,
    ReactiveFormsModule,
    ChangeLanguageComponent,
  ],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  logInForm!: FormGroup;
  loginError: boolean = false;
  loginVerifError: boolean = false;

  constructor(
    public langServ: LanguageService,
    public authServ: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.logInValidate();
  }

  // --- LOG IN ---
  logInValidate() {
    this.logInForm = this.fb.group({
      loginEmail: ['', [Validators.required, Validators.email]],
      loginPassword: ['', [Validators.required]],
    });
  }

  loginOnSubmit() {
    if (this.logInForm.valid) {
      const formValue = this.logInForm.value;
      const data = {
        email: formValue.loginEmail,
        password: formValue.loginPassword,
      };

      this.authServ.login(data).subscribe({
        next: (data) => {
          localStorage.setItem('user_session', data.token);
          this.loginError = false;
          this.loginVerifError = false;
          this.router.navigateByUrl('');
        },
        error: (err) => {
          const backendMessage = err?.error?.message || err.message || '';
          if (backendMessage === 'wrong credentials') {
            this.loginError = true;
          } else if (backendMessage === 'account no verif') {
            this.loginError = false;
            this.loginVerifError = true;
          }
        },
      });
    }
  }
}
