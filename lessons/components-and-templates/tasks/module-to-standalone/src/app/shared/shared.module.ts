import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighlightDirective } from './directives/highlight.directive';
import { TruncatePipe } from './pipes/truncate.pipe';
import { CardComponent } from './ui/card/card.component';

@NgModule({
  declarations: [CardComponent, HighlightDirective, TruncatePipe],
  imports: [CommonModule],
  exports: [CommonModule, CardComponent, HighlightDirective, TruncatePipe],
})
export class SharedModule {}
