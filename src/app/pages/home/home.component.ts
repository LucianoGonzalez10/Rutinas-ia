import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styles: [`
    .home-container {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  displayName: string = 'Usuario';
  rutina: string | null = null;
  formularioCompletado: boolean = false;

  private userSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(async (user: User | null) => {
      if (user) {
        console.log('Usuario autenticado:', user.uid);
        try {
          const userData = await this.authService.getUserData(user.uid);
          console.log('Datos del usuario desde Firestore:', userData);

          // Establecer nombre para mostrar
          if (userData?.nombre && userData?.apellido) {
            this.displayName = `${userData.nombre} ${userData.apellido}`;
          } else if (user.displayName) {
            this.displayName = user.displayName;
          } else {
            this.displayName = user.email || 'Usuario';
          }

          // Verificar si el formulario fue completado
          this.formularioCompletado = !!userData?.edad && !!userData?.altura && !!userData?.peso;

          // Verificar si existe una rutina generada
          this.rutina = userData?.rutina || null;

        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          this.displayName = user.email || 'Usuario';
        }
      } else {
        console.log('No hay usuario autenticado');
        this.displayName = 'Usuario';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Sesión cerrada');
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }
  
}
