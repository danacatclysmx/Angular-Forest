import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Generico } from '../../utilities/generico';
import {  ButtonElement } from '../../utilities/button-element';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
 @Input() buttonElementList : ButtonElement[] = [];
}
