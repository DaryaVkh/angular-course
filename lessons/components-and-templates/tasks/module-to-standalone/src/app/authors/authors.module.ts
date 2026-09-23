import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AuthorListComponent } from './author-list/author-list.component';
import { AuthorsRoutingModule } from './authors-routing.module';

@NgModule({
  declarations: [AuthorListComponent],
  imports: [SharedModule, AuthorsRoutingModule],
})
export class AuthorsModule {}
