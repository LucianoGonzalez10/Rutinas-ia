import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.claveApiGoogle);
  }

  async generarRutina(datosUsuario: any): Promise<any> {
    const prompt = `
    Soy un entrenador personal. Basándome en estos datos:
    - Edad: ${datosUsuario.edad}
    - Sexo: ${datosUsuario.sexo}
    - Peso: ${datosUsuario.peso} kg
    - Altura: ${datosUsuario.altura} cm
    - Nivel: ${datosUsuario.nivel}
    - Enfermedades o condiciones médicas: ${datosUsuario.enfermedades || 'ninguna'}
    - Frecuencia semanal de entrenamiento: ${datosUsuario.frecuencia} días
    - Objetivo principal: ${datosUsuario.objetivo}
    - Restricciones físicas o lesiones: ${datosUsuario.restricciones || 'ninguna'}
    - Ubicación de entrenamiento: ${datosUsuario.ubicacion}
    - Equipamiento disponible: ${(datosUsuario.equipamiento && datosUsuario.equipamiento.length > 0) ? datosUsuario.equipamiento.join(', ') : 'ninguno'}

    Crea una rutina semanal personalizada con enfoque en salud, fuerza y bienestar general. Sé claro, breve y adecuado para su nivel, enfermedades, restricciones y equipamiento.
    
    ${datosUsuario.ubicacion === 'Casa' ? 'Prioriza ejercicios que se puedan realizar en casa con el equipamiento disponible.' : 'Incluye ejercicios que aprovechen el equipamiento del gimnasio.'}

    Devuélveme la rutina en formato JSON, con un array de días. Cada día debe tener:
    - dia: nombre del día (ej: "Lunes")
    - enfoque: el enfoque principal del entrenamiento (ej: "Fuerza superior", "Cardio", "Piernas", etc.)
    - ejercicios: array de ejercicios con nombre, series, repeticiones, descanso y notas si son necesarias.

    Ejemplo de formato:
    {
      "rutina_semanal": [
        {
          "dia": "Lunes",
          "enfoque": "Fuerza superior",
          "ejercicios": [
            {
              "nombre": "Flexiones",
              "series": 3,
              "repeticiones": 12,
              "descanso": "90 segundos",
              "notas": "Mantener la espalda recta"
            }
          ]
        }
      ]
    }
    `;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let rutinaLimpia = response.text()
      .replace(/```json|```/g, '')
      .replace(/^[^{]*({.*})[^}]*$/s, '$1');
    let rutinaJson = {};
    try {
      rutinaJson = JSON.parse(rutinaLimpia);
    } catch (e) {
      // Manejar error de parseo
    }
    return rutinaJson; // Devuelve el objeto, no el texto
  }
}
