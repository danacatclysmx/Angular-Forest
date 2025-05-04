import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // Propiedades para los formularios
  nuevoUsuario = {
    nombre: '',
    cargo: '',
    email: ''
  };

  credenciales = {
    usuario: '',
    contrasena: ''
  };

  mensajeError: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simula el efecto toggle en Angular para el overlay
    const container = document.getElementById("container");
    const buttons = document.querySelectorAll(".overlay button");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        container?.classList.toggle("right-panel-active");
        btn.classList.add("btnScaled");
        setTimeout(() => {
          btn.classList.remove("btnScaled");
        }, 600);
      });
    });
  }

  solicitarCuenta(): void {
    // Aquí podrías enviar el nuevoUsuario al backend con HttpClient
    console.log("Solicitud de cuenta enviada:", this.nuevoUsuario);
    alert("Solicitud de cuenta enviada");
  }

  iniciarSesion(): void {
    const usuario = this.credenciales.usuario.trim();
    const contrasena = this.credenciales.contrasena.trim();

    if (!usuario || !contrasena) {
      this.mensajeError = "Por favor complete todos los campos";
      return;
    }

    this.authenticateUser(usuario, contrasena)
      .then((ruta) => this.router.navigate([ruta]))
      .catch((err) => this.mensajeError = err.message);
  }

  volver(): void {
    // Aquí podrías hacer router.navigate(['/home']) o lo que necesites
    window.history.back();
  }

  toggleOverlay(): void {
    const container = document.getElementById("container");
    container?.classList.toggle("right-panel-active");
  }

  private authenticateUser(username: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const credencialesValidas: Record<string, { password: string, redirect: string }> = {
          '1': { password: '1', redirect: '/jefe' },
          '2': { password: '2', redirect: '/tecnico' }
        };

        if (
          credencialesValidas[username] &&
          credencialesValidas[username].password === password
        ) {
          resolve(credencialesValidas[username].redirect);
        } else {
          reject(new Error("Credenciales incorrectas. Inténtalo de nuevo."));
        }
      }, 500);
    });
  }
}
