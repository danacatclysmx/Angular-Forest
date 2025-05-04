import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ButtonElement } from '../../utilities/button-element';

@Component({
  selector: 'app-landing-page',
  imports: [HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})
export class LandingPageComponent {
buttonElementList: ButtonElement[] = [
  { text: 'Librería de estilos',class:'filled-button',routeName:'/estilos-base',iconName:'bi-arrow-right-circle' }
];
}
