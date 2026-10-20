import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, OnInit, viewChild } from '@angular/core';
import { CardComponent } from '../../ui/card/card.component';
import { FakeHttpService, randomCity } from '../../data-access/fake-http.service';
import { CityStore } from '../../data-access/city.store';
import { CardType } from '../../model/card.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-city-card',
  templateUrl: './city-card.component.html',
  styleUrl: './city-card.component.scss',
  imports: [CardComponent, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityCardComponent implements OnInit {
  private http = inject(FakeHttpService);
  private store = inject(CityStore);
  private destroyRef = inject(DestroyRef);

  cities = this.store.cities;
  cardType = CardType.CITY;

  ngOnInit(): void {
    this.http.fetchCities$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((c) => this.store.addAll(c));
  }

  addCity() {
    this.store.addOne(randomCity());
  }

  deleteCity(id: number) {
    this.store.deleteOne(id);
  }
}
