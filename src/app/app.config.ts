import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withRouterConfig, ExtraOptions, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withRouterConfig({ 
        onSameUrlNavigation: 'reload' // Permite recargar la misma URL con fragmentos
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Restaura la posición del scroll
        anchorScrolling: 'enabled' // Permite desplazamiento automático a elementos con fragmento (#id)
      })
    )
  ]
};
