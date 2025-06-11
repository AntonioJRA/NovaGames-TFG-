import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LogoHeaderComponent } from '../../shared/logo-header/logo-header.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeLanguageComponent } from '../../shared/change-language/change-language.component';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

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
  forgotPasswordForm!: FormGroup;
  recoverPasswordForm!: FormGroup;
  loginError: boolean = false;
  loginVerifError: boolean = false;
  bannedAccountError: boolean = false;

  constructor(
    public langServ: LanguageService,
    public authServ: AuthService,
    private router: Router,
    private translate: TranslateService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.logInValidate();
    this.forgotPasswordValidate();
    this.recoverPasswordValidate()
  }

  // FORM VALIDATORS
  logInValidate() {
    this.logInForm = this.fb.group({
      loginEmail: ['', [Validators.required, Validators.email]],
      loginPassword: ['', [Validators.required]],
    });
  }

  forgotPasswordValidate() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  recoverPasswordValidate() {
    this.recoverPasswordForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  // --- LOG IN ---
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
          this.bannedAccountError = false;
          this.router.navigateByUrl('');
        },
        error: (err) => {
          const backendMessage = err?.error?.message || err.message || '';
          if (backendMessage === 'wrong credentials') {
            this.loginError = true;
            this.loginVerifError = false;
            this.bannedAccountError = false;
          } else if (backendMessage === 'account no verif') {
            this.loginError = false;
            this.loginVerifError = true;
            this.bannedAccountError = false;
          } else if (backendMessage === 'account banned') {
            this.loginError = false;
            this.loginVerifError = false;
            this.bannedAccountError = true;
          }
        },
      });
    }
  }

  // FORGOT YOUR PASSWORD
  forgotPasswordOnSubmit() {
    if (this.forgotPasswordForm.valid) {
      const formValue = this.forgotPasswordForm.value;
      const data = {
        email: formValue.email
      };

      console.log(data);
      this.authServ.forgotPassword(data).subscribe({
        next: (data) => {

        },
        error: (err) => {
          const backendMessage = err?.error?.message || err.message || '';
          console.log(backendMessage);
        },
      });
    }
  }

  // FORGOT YOUR PASSWORD
  recoverPasswordFormOnSubmit() {
    if (this.recoverPasswordForm.valid) {
      const formValue = this.recoverPasswordForm.value;
      const data = {
        code: formValue.code
      };

      console.log(data);
      // this.authServ.forgotPassword(data).subscribe({
      //   next: (data) => {

      //   },
      //   error: (err) => {
      //     const backendMessage = err?.error?.message || err.message || '';
      //     console.log(backendMessage);
      //   },
      // });
    }
  }
}
