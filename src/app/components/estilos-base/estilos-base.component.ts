import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Generico } from '../../utilities/generico';
import { HeaderComponent } from '../header/header.component';
import { ButtonElement } from '../../utilities/button-element';

@Component({
  selector: 'app-estilos-base',
  imports: [CommonModule,FormsModule,HeaderComponent],
  templateUrl: './estilos-base.component.html',
  styleUrl: './estilos-base.component.css'
})
export class EstilosBaseComponent {
  buttonElementList: ButtonElement[] = [
    { text: 'Salir',class:'elevated-button',routeName:'/landing',iconName:'bi-door-closed-fill' },
    { text: 'Checkbox',class:'elevated-button',routeName:'/estilos-base',iconName:'bi-check2-square',fragment:'containerCheckbox' },
    { text: 'Switch',class:'elevated-button',routeName:'/estilos-base',iconName:'bi-circle-half',fragment:'containerSwitch' },
    { text: 'Table',class:'elevated-button',routeName:'/estilos-base',iconName:'bi-table',fragment:'containerTable' },
  ];

  elementoSeleccionado:Generico<number,string>={clave:0,valor:'',descripcion:''};
  optionsSelect: Generico<number,string>[] =[
    {clave:1,valor:'opcion 1',descripcion:'descripcion 1'},
    {clave:2,valor:'opcion 2',descripcion:'descripcion 2'},
    {clave:3,valor:'opcion 3',descripcion:'descripcion 3'},
    {clave:4,valor:'opcion 4',descripcion:'descripcion 4'}, 
  ]
  seleccionarElemnto(elementoSeleccionado: Generico<number,string>,arg1: number) {
    this.elementoSeleccionado=elementoSeleccionado;
  }
}
