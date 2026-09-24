import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../shared/ui/card/card.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [CardComponent, RouterLink],
})
export class HomeComponent {}
