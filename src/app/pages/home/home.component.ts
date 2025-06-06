import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { FormularioDatosComponent } from '../formulario/formulario-datos.component';
import { Firestore, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { GeminiService } from '../../services/gemini.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormularioDatosComponent, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styles: [`
    .botones-secundarios {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.btn-historial,
.btn-estadisticas {
  padding: 0.8rem 1.5rem;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-historial:hover,
.btn-estadisticas:hover {
  background: #1565c0;
}


    :host {
      display: block;
      min-height: 100vh;
      width: 100vw;
      background: linear-gradient(135deg, #1e2a3a 0%, #2c3e50 100%);
    }

    .home-container {
      padding: 2rem;
      width: 100%;
      min-height: 100vh;
      color: #ffffff;
      font-family: 'Inter', 'Roboto', sans-serif;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      text-align: center;
    }

    h2 {
      color: #64b5f6;
      font-weight: 700;
      margin-bottom: 2.5rem;
      font-size: 2.8rem;
      text-shadow: 0 2px 10px rgba(100, 181, 246, 0.2);
      letter-spacing: 1px;
    }

    h3 {
      color: #64b5f6;
      font-weight: 600;
      margin-bottom: 2rem;
      font-size: 2.2rem;
      text-shadow: 0 2px 8px rgba(100, 181, 246, 0.2);
    }

    .top-buttons-container {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .formulario-status {
      background: rgba(100, 181, 246, 0.1);
      padding: 1.5rem;
      border-radius: 16px;
      margin: 2rem 0;
      border: 1px solid rgba(100, 181, 246, 0.2);
      font-size: 1.2rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 15px rgba(100, 181, 246, 0.1);
      animation: fadeIn 0.5s ease-out;
    }

    .rutina-container {
      background-color: rgba(255, 255, 255, 0.05);
      padding: 35px;
      border-radius: 12px;
      margin: 30px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 1000px;
    }

    .rutina-content {
      background-color: rgba(255, 255, 255, 0.03);
      padding: 35px;
      border-radius: 8px;
      border: 1px solid rgba(100, 181, 246, 0.1);
    }

    .rutina-content pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'JetBrains Mono', monospace;
      line-height: 1.8;
      color: #E0E0E0;
      font-size: 1.1rem;
    }

    .loading-rutina {
      text-align: center;
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      margin: 2rem 0;
      border: 1px solid rgba(100, 181, 246, 0.2);
      font-size: 1.2rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      animation: fadeIn 0.5s ease-out;
    }

    .loading-steps {
      margin: 2rem 0;
      text-align: left;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .loading-step {
      margin: 1rem 0;
      padding: 1rem 1.5rem;
      background: rgba(100, 181, 246, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(100, 181, 246, 0.1);
      animation: fadeIn 0.5s ease-in-out;
      transition: transform 0.3s ease;
    }

    .loading-step:hover {
      transform: translateX(10px);
    }

    .loading-step:nth-child(1) { animation-delay: 0s; }
    .loading-step:nth-child(2) { animation-delay: 0.5s; }
    .loading-step:nth-child(3) { animation-delay: 1s; }

    .error-message {
      color: #ff6b6b;
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: rgba(255, 107, 107, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(255, 107, 107, 0.2);
    }

    .btn-retry {
      background: linear-gradient(135deg, #64b5f6 0%, #1976d2 100%);
      color: #ffffff;
      margin-top: 1.5rem;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(100, 181, 246, 0.2);
    }

    .btn-retry:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(100, 181, 246, 0.3);
    }

    .loading-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      margin-top: 1.5rem;
    }

    .formulario-pendiente {
      background: rgba(255, 107, 107, 0.1);
      padding: 2rem;
      border-radius: 20px;
      margin: 2rem 0;
      text-align: center;
      border: 1px solid rgba(255, 107, 107, 0.2);
      font-size: 1.2rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(255, 107, 107, 0.1);
      animation: fadeIn 0.5s ease-out;
    }

    button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      min-width: 200px;
    }

    .btn-completar {
      background: linear-gradient(135deg, #64b5f6 0%, #1976d2 100%);
      color: #ffffff;
      box-shadow: 0 4px 15px rgba(100, 181, 246, 0.2);
    }

    .btn-completar:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(100, 181, 246, 0.3);
    }

    .btn-logout {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
      color: white;
      margin-top: 2rem;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
    }

    .btn-logout:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.3);
    }

    .checkbox-completado {
      width: 24px;
      height: 24px;
      cursor: pointer;
      accent-color: #64b5f6;
      background-color: rgba(255, 255, 255, 0.05);
      border: 2px solid #64b5f6;
      border-radius: 6px;
      transition: all 0.3s ease;
    }

    .checkbox-completado:checked {
      background-color: #64b5f6;
      box-shadow: 0 0 10px rgba(100, 181, 246, 0.3);
    }

    .checkbox-completado:hover {
      transform: scale(1.1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .loading-rutina p {
      animation: pulse 2s infinite;
    }

    .tabla-rutina {
      width: 100%;
      max-width: 1200px;
      margin: 2rem auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.5s ease-out;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      color: #fff;
      font-size: 1.1rem;
      background: transparent;
    }

    th, td {
      border: 1px solid rgba(100, 181, 246, 0.2);
      padding: 1.2rem;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: rgba(100, 181, 246, 0.1);
      color: #64b5f6;
      font-size: 1.2rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
      position: sticky;
      top: 0;
    }

    tr:nth-child(even) td {
      background: rgba(255, 255, 255, 0.03);
    }

    tr:hover td {
      background: rgba(100, 181, 246, 0.05);
      transition: background 0.3s ease;
    }

    ul {
      margin: 0;
      padding-left: 1.2rem;
      list-style-type: none;
    }

    li {
      margin-bottom: 1rem;
      line-height: 1.6;
      position: relative;
      padding-left: 1.5rem;
    }

    li:before {
      content: "•";
      color: #64b5f6;
      position: absolute;
      left: 0;
      font-size: 1.2rem;
    }

    b {
      color: #64b5f6;
      font-weight: 600;
    }

    i {
      color: #90caf9;
      font-size: 0.95em;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 1rem;
      }

      h2 {
        font-size: 2rem;
      }

      h3 {
        font-size: 1.8rem;
      }

      .tabla-rutina {
        padding: 1rem;
        margin: 1rem 0;
      }

      table, th, td {
        font-size: 0.95rem;
      }

      th, td {
        padding: 0.8rem;
      }

      button {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
      }
    }

    .btn-ver-formulario {
      background: linear-gradient(135deg, #64b5f6 0%, #1976d2 100%);
      color: #ffffff;
      margin: 1rem 0;
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(100, 181, 246, 0.2);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-ver-formulario:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(100, 181, 246, 0.3);
    }

    .btn-ver-formulario i {
      font-size: 1.2rem;
    }

    .formulario-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
      overflow: hidden;
    }

    .formulario-modal-content {
      background-color: #2c3e50;
      padding: 2rem;
      border-radius: 15px;
      max-width: 600px;
      width: 90%;
      max-height: 95%;
      overflow-y: auto;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .btn-cerrar {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      min-width: auto;
      transition: all 0.3s ease;
    }

    .btn-cerrar:hover {
      color: #64b5f6;
      transform: rotate(90deg);
    }

    .user-menu-container {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 1010;
    }

    .user-icon-button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
      display: block;
      object-fit: cover;
      transition: transform 0.2s ease;
    }

    .user-icon-button i {
      font-size: 40px;
      color: #64b5f6;
    }

    .user-icon-button img {
      display: block;
      width: 100%;
      height: 100%;
    }

    .user-menu {
      position: absolute;
      top: 60px;
      right: 0;
      background: rgba(30, 30, 30, 0.95);
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      animation: fadeIn 0.3s ease-out;
    }

    .user-menu button {
      display: block;
      width: 100%;
      padding: 0.8rem 1.5rem;
      background: none;
      border: none;
      color: #ffffff;
      text-align: left;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
      min-width: 150px;
    }

    .user-menu button:hover {
      background: rgba(100, 181, 246, 0.1);
    }

    .editar-perfil-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1005;
      backdrop-filter: blur(5px);
      overflow: hidden;
    }

    .editar-perfil-modal-content {
      background: rgba(255, 255, 255, 0.05);
      padding: 2rem;
      border-radius: 20px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      border: 1px solid rgba(100, 181, 246, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      box-sizing: border-box;
      margin: 1rem;
    }

    .editar-perfil-modal-content .btn-cerrar {
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  displayName: string = 'Usuario';
  rutina: string | null = null;
  formularioCompletado: boolean = false;
  generandoRutina: boolean = false;
  errorGeneracion: string | null = null;
  rutinaEstructurada: any[] = [];
  currentUserUid: string | null = null;
  mostrarFormulario: boolean = false;
  userData: any = null;
  mostrarMenuUsuario: boolean = false;
  photoURL: string | null = null;
  esActualizacion: boolean = false;

  private userSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private geminiService: GeminiService,
    private firestore: Firestore,
    private router: Router
  ) {}
  

  ngOnInit(): void {
    console.log('ngOnInit: Iniciando suscripción a user$');
    this.authService.user$.subscribe(async (user) => {
      console.log('ngOnInit: user$ emitido, user:', !!user);
      // Iniciamos asumiendo que generaremos o cargaremos, por eso mostramos carga
      this.generandoRutina = true;
      this.rutinaEstructurada = [];
      this.rutina = null;
      this.errorGeneracion = null;
      this.formularioCompletado = false; // Asumir incompleto hasta verificar
      console.log('ngOnInit: Estado inicial - generandoRutina:', this.generandoRutina, 'formularioCompletado:', this.formularioCompletado);

      if (user) {
        console.log('ngOnInit: Usuario autenticado:', user.uid);
        try {
          const userDocRef = doc(this.firestore, 'usuarios', user.uid);
          console.log('ngOnInit: Intentando obtener datos del usuario de Firestore...');
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            this.userData = userDoc.data();
            console.log('ngOnInit: Datos del usuario cargados:', this.userData);
            
            // Determinar si el formulario está completado (verificando campos clave)
            this.formularioCompletado = !!(this.userData && 
                                      this.userData.nombre && 
                                      this.userData.edad && 
                                      this.userData.objetivo); // Puedes añadir más campos si es necesario
            console.log('ngOnInit: Formulario completado evaluado a:', this.formularioCompletado);

            // Si el formulario está completado y hay rutina guardada, cargarla
            if (this.formularioCompletado && this.userData.rutina) {
              console.log('ngOnInit: Formulario completado y rutina existente encontrada. Cargando rutina existente...');
              this.rutina = this.userData.rutina;
              this.rutinaEstructurada = this.estructurarRutina(this.rutina);
              console.log('ngOnInit: Rutina existente estructurada. rutinaEstructurada.length:', this.rutinaEstructurada.length);
              // No desactivamos generandoRutina aquí, se hará al final del subscribe
            } else if (this.formularioCompletado && !this.userData.rutina) {
              // Si el formulario está completado pero no hay rutina, generarla por primera vez
              console.log('ngOnInit: Formulario completado pero no hay rutina, generando nueva...');
              await this.generarRutina(this.userData);
              // generarRutina ya establece generandoRutina a false
            } else {
              // Si el formulario no está completado, asegurar que la rutina no se muestre
              console.log('ngOnInit: Formulario incompleto o datos insuficientes.');
              this.rutinaEstructurada = [];
              this.rutina = null;
              // No desactivamos generandoRutina aquí, se hará al final del subscribe
            }

          } else {
            console.log('ngOnInit: No se encontraron datos del usuario en Firestore.');
            this.formularioCompletado = false;
            this.rutinaEstructurada = [];
            this.rutina = null;
            // No desactivamos generandoRutina aquí, se hará al final del subscribe
          }
        } catch (error) {
          console.error('ngOnInit: Error al cargar datos del usuario:', error);
          this.formularioCompletado = false;
          this.rutinaEstructurada = [];
          this.rutina = null;
          this.errorGeneracion = 'Error al cargar datos del usuario.';
          // No desactivamos generandoRutina aquí, se hará al final del subscribe
        } finally {
           // Asegurarse de que el indicador de carga se oculte después de procesar
           // Esto cubre los casos donde no se llama a generarRutina directamente
           if (this.generandoRutina) { // Solo si no se desactivó ya en generarRutina
              this.generandoRutina = false;
              console.log('ngOnInit: finally - generandoRutina establecido a false.');
           }
        }

      } else {
        console.log('ngOnInit: No hay usuario autenticado.');
        this.formularioCompletado = false;
        this.rutinaEstructurada = [];
        this.rutina = null;
        this.generandoRutina = false; // Ocultar indicador si no hay usuario
        console.log('ngOnInit: No autenticado - generandoRutina establecido a false.');
      }
      console.log('ngOnInit: Fin del user$ subscribe. generandoRutina:', this.generandoRutina, 'formularioCompletado:', this.formularioCompletado, 'rutinaEstructurada.length:', this.rutinaEstructurada.length);

    });

    // Suscribirse a las actualizaciones del formulario
    this.authService.formularioActualizado$.subscribe(async (datos) => {
      console.log('HomeComponent: Suscripción a formularioActualizado$ activada con datos:', datos);
      if (datos) {
        console.log('onFormularioActualizado: Datos del formulario actualizados (desde servicio):', datos);
        // Actualizar userData localmente
        this.userData = { ...this.userData, ...datos };
        console.log('onFormularioActualizado: userData actualizado localmente:', this.userData);
        
        // Marcar formulario como completado si los datos son válidos
        this.formularioCompletado = !!(this.userData && 
                                    this.userData.nombre && 
                                    this.userData.edad && 
                                    this.userData.objetivo); // Ajusta según los campos de validación
        console.log('onFormularioActualizado: Formulario completado evaluado a:', this.formularioCompletado);

        // Si el formulario está completado, generar una nueva rutina con los datos actualizados
        if (this.formularioCompletado) {
           console.log('onFormularioActualizado: Formulario actualizado y completado, iniciando generación de nueva rutina...');
           console.log('onFormularioActualizado: Estableciendo generandoRutina = true');
           this.generandoRutina = true; // Mostrar indicador de carga al iniciar la generación
           this.rutinaEstructurada = []; // Limpiar rutina anterior visualmente
           this.rutina = null; // Limpiar rutina anterior
           this.errorGeneracion = null; // Limpiar error previo
           
           // Cerrar el modal del formulario *antes* o *al inicio* de generar la rutina
           this.mostrarFormulario = false;
           console.log('onFormularioActualizado: Modal cerrado antes de generar rutina.');

           await this.generarRutina(this.userData);
           console.log('onFormularioActualizado: Finalizada llamada a generarRutina.');
           // generarRutina ya establece generandoRutina a false

        } else {
           console.log('onFormularioActualizado: Formulario actualizado pero incompleto.');
           this.rutinaEstructurada = [];
           this.rutina = null;
           console.log('onFormularioActualizado: Estableciendo generandoRutina = false por formulario incompleto.');
           this.generandoRutina = false; // Ocultar indicador si el formulario está incompleto
           this.errorGeneracion = null;
           console.log('onFormularioActualizado: Modal cerrado por formulario incompleto.');
           // Cerrar el modal si el formulario no está completado pero se guardó algo
           this.mostrarFormulario = false;
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  async generarRutina(datosUsuario: any) {
    console.log('Iniciando generación de rutina...');
    console.log('generarRutina: Estableciendo generandoRutina = true');
    this.generandoRutina = true; // Mostrar indicador de carga
    this.errorGeneracion = null; // Limpiar errores anteriores
    this.rutinaEstructurada = []; // Limpiar rutina anterior visualmente
    this.rutina = null; // Limpiar rutina anterior

    const user = await this.authService.getCurrentUser();
    if (!user) {
      console.error('No hay usuario autenticado para generar rutina');
      console.log('generarRutina: Estableciendo generandoRutina = false por falta de usuario.');
      this.generandoRutina = false;
      this.errorGeneracion = 'No se pudo autenticar el usuario.';
      return;
    }

    console.log('Datos de usuario para generar rutina:', datosUsuario);

    try {
      const rutinaGenerada = await this.geminiService.generarRutina(datosUsuario);
      console.log('Respuesta de GeminiService:', rutinaGenerada);

      if (rutinaGenerada) {
        this.rutina = rutinaGenerada; // Guardar la rutina cruda si es necesario
        this.rutinaEstructurada = this.estructurarRutina(rutinaGenerada);
        console.log('Rutina estructurada:', this.rutinaEstructurada);

        // Guardar la rutina en Firestore
        const userDocRef = doc(this.firestore, 'usuarios', user.uid);
        await updateDoc(userDocRef, { rutina: this.rutina });
        console.log('Rutina guardada en Firestore.');

        console.log('generarRutina: Estableciendo generandoRutina = false tras éxito.');
        this.generandoRutina = false; // Ocultar indicador SÓLO si fue exitoso

      } else {
        console.error('GeminiService no devolvió una rutina válida');
        this.errorGeneracion = 'Error al generar la rutina. Inténtalo de nuevo.';
        console.log('generarRutina: Estableciendo generandoRutina = false tras respuesta inválida.');
        this.generandoRutina = false; // Ocultar indicador también en caso de respuesta inválida
      }

    } catch (error: any) {
      console.error('Error al generar la rutina:', error);
      // Intenta extraer un mensaje de error útil
      this.errorGeneracion = `Error al generar la rutina: ${error.message || error}. Por favor, intenta de nuevo.`;
      console.log('generarRutina: Estableciendo generandoRutina = false tras error.');
      this.generandoRutina = false; // Ocultar indicador en caso de error
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario) {
      this.mostrarMenuUsuario = false;
    }
  }

  toggleMenuUsuario() {
    this.mostrarMenuUsuario = !this.mostrarMenuUsuario;
    if (this.mostrarMenuUsuario) {
      this.mostrarFormulario = false;
    }
  }

  async handlePhotoUpload(file: File) {
    if (!this.currentUserUid) return;

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${this.currentUserUid}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await this.onFormularioActualizado({ photoURL: downloadURL });

    } catch (error) {
      console.error('Error al subir la foto:', error);
    }
  }

  logout() {
    this.authService.logout().then(() => {
      console.log('Sesión cerrada');
      this.displayName = 'Usuario';
      this.rutina = null;
      this.formularioCompletado = false;
      this.generandoRutina = false;
      this.errorGeneracion = null;
      this.rutinaEstructurada = [];
      this.currentUserUid = null;
      this.mostrarFormulario = false;
      this.userData = null;
      this.mostrarMenuUsuario = false;
      this.photoURL = null;
    }).catch(error => {
      console.error('Error al cerrar sesión:', error);
    });
  }

  async obtenerDatosUsuario(uid: string): Promise<any> {
    const userDocRef = doc(this.firestore, 'usuarios', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      return {};
    }
  }

  verFormulario() {
    this.router.navigate(['/formulario']);
  }

  comenzarRutina(dia: any) {
    this.router.navigate(['/ejecucion'], {
      state: { dia }
    });
  }

  private estructurarRutina(rutina: any): any[] {
    console.log('Estructurando rutina, datos recibidos:', rutina);
    try {
      let rutinaProcesada;
      
      if (typeof rutina === 'string') {
        console.log('La rutina es un string, intentando parsear JSON');
        try {
          rutinaProcesada = JSON.parse(rutina);
        } catch (e) {
          console.error('Error al parsear JSON:', e);
          return [];
        }
      } else {
        rutinaProcesada = rutina;
      }

      console.log('Rutina procesada:', rutinaProcesada);

      if (rutinaProcesada.rutina_semanal) {
        console.log('Encontrada rutina_semanal en la respuesta');
        return rutinaProcesada.rutina_semanal;
      } else if (Array.isArray(rutinaProcesada)) {
        console.log('La rutina es un array');
        return rutinaProcesada;
      } else {
        console.log('Formato de rutina no reconocido');
        return [];
      }
    } catch (error) {
      console.error('Error al estructurar la rutina:', error);
      return [];
    }
  }

  async onFormularioActualizado(datosActualizados: any) {
    console.log('onFormularioActualizado: Datos del formulario actualizados (desde servicio):', datosActualizados);
    if (datosActualizados) {
      // Actualizar userData localmente
      this.userData = { ...this.userData, ...datosActualizados };
      console.log('onFormularioActualizado: userData actualizado localmente:', this.userData);
      
      // Marcar formulario como completado si los datos son válidos
      this.formularioCompletado = !!(this.userData && 
                                    this.userData.nombre && 
                                    this.userData.edad && 
                                    this.userData.objetivo); // Ajusta según los campos de validación
      console.log('onFormularioActualizado: Formulario completado evaluado a:', this.formularioCompletado);

      // Si el formulario está completado, generar una nueva rutina con los datos actualizados
      if (this.formularioCompletado) {
         console.log('onFormularioActualizado: Formulario actualizado y completado, iniciando generación de nueva rutina...');
         // No establecer generandoRutina = true aquí, generarRutina lo hará
         this.rutinaEstructurada = []; // Limpiar rutina anterior visualmente inmediatamente
         this.rutina = null; // Limpiar rutina anterior inmediatamente
         this.errorGeneracion = null; // Limpiar error previo
         
         // Cerrar el modal del formulario *antes* o *al inicio* de generar la rutina
         this.mostrarFormulario = false;
         console.log('onFormularioActualizado: Modal cerrado antes de generar rutina.');

         // Pasar los datos actualizados a generarRutina
         await this.generarRutina(this.userData);
         console.log('onFormularioActualizado: Finalizada llamada a generarRutina.');
         // generarRutina ya establece generandoRutina a false

      } else {
         console.log('onFormularioActualizado: Formulario actualizado pero incompleto.');
         this.rutinaEstructurada = [];
         this.rutina = null;
         this.generandoRutina = false; // Ocultar indicador si el formulario está incompleto
         this.errorGeneracion = null;
         console.log('onFormularioActualizado: generatingRutina establecido a false por formulario incompleto.');

         // Cerrar el modal si el formulario no está completado pero se guardó algo
         this.mostrarFormulario = false;
         console.log('onFormularioActualizado: Modal cerrado por formulario incompleto.');
      }
    }
  }

  // Método placeholder para manejar el marcado de días como completados
  marcarDiaCompletado(dia: any) {
    console.log('Día marcado/desmarcado como completado:', dia);
    // Aquí iría la lógica para actualizar el estado de completado (localmente o en Firestore)
  }
}
