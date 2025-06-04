import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grafico-dias-completados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-dias-completados.component.html',
  styleUrl: './grafico-dias-completados.component.css'
})
export class GraficoDiasCompletadosComponent implements OnInit {

  days: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Recibe el estado de completado desde el componente padre
  @Input() completedDays: { [key: string]: boolean } = {};

  // Emite el estado de completado al componente padre cuando cambia
  @Output() completedDaysChange = new EventEmitter<{ [key: string]: boolean }>();

  ngOnInit(): void {
    // Asegurarse de que todos los días estén inicializados (false por defecto si no vienen del padre)
    this.days.forEach(day => {
      if (this.completedDays[day] === undefined) {
        this.completedDays[day] = false;
      }
    });
  }

  toggleDayCompleted(day: string): void {
    this.completedDays[day] = !this.completedDays[day];
    // Emitir el cambio
    this.completedDaysChange.emit(this.completedDays);
  }

}
