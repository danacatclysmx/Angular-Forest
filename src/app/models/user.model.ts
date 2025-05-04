export interface User {
    id: number;
    username: string;
    password: string; // En producción, NUNCA guardes contraseñas en texto plano 🛑
    role: 'tecnico' | 'jefe'; // Tipado estricto para evitar errores
  }