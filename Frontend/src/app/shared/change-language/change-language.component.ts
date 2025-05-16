import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLinkActive, RouterModule } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-change-language',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './change-language.component.html',
  styles: ``
})
export class ChangeLanguageComponent {
 constructor (public langServ: LanguageService) {}


}
