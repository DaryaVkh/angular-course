import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [NavbarComponent, NotFoundComponent],
  imports: [RouterModule],
  exports: [NavbarComponent, NotFoundComponent],
})
export class CoreModule {}
