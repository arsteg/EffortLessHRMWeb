import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export class MultiTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, private resources: { prefix: string; suffix: string }[]) {}

  getTranslation(lang: string): Observable<any> {
    const requests = this.resources.map(resource =>
      this.http.get(`${resource.prefix}${lang}${resource.suffix}`)
    );
    return forkJoin(requests).pipe(
      map(response => response.reduce((acc, res) => ({ ...acc, ...res }), {}))
    );
  }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/i18n/', suffix: '.json' }
  ]);
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [TranslateModule]
})
export class EffortlessTranslateModule { }
