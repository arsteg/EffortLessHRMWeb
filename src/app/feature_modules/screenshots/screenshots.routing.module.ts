import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScreenshotsComponent } from './screenshots/screenshots.component';

const routes: Routes = [
  { path: '', component: ScreenshotsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScreenshotsdRoutingModule {}
