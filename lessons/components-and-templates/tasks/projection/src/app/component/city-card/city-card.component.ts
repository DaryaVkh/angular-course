import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { CardComponent } from '../../ui/card/card.component';
import { NgOptimizedImage } from '@angular/common';
import { FakeHttpService, randomCity } from '../../data-access/fake-http.service';
import { CityStore } from '../../data-access/city.store';
import { CardType } from '../../model/card.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListItem } from '../../model/list-item';

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
  cityItems = computed<ListItem[]>(() =>
    this.cities().map((city) => ({ id: city.id, name: city.name })),
  );
  cardType = CardType.CITY;

  protected addCity() : void {
    this.store.addOne(randomCity())
  }

  protected deleteCity(id: number) : void {
    this.store.deleteOne(id)
  }

  ngOnInit () : void {
    this.http.fetchCities$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((c) => this.store.addAll(c));
  }
}
