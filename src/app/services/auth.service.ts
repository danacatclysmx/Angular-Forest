import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { Login } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private mockUsers: User[] = [
    { id: 1, username: 'tecnico', password: '123', role: 'tecnico' },
    { id: 2, username: 'jefe', password: '456', role: 'jefe' }
  ];

  constructor(private router: Router) {}

  login(credentials: Login): boolean {
    const user = this.mockUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    if (user) {
      // Guarda el rol en localStorage (simula sesión)
      localStorage.setItem('role', user.role);
      this.router.navigate([user.role]);
      return true;
    }
    return false;
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('role');
    this.router.navigate(['/']);
  }
}