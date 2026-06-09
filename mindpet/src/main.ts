import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/services/auth.interceptor';


providers: [
  provideHttpClient(
    withInterceptors([authInterceptor])
  )
]

platformBrowser().bootstrapModule(AppModule, {
  
})
  .catch(err => console.error(err));

  
