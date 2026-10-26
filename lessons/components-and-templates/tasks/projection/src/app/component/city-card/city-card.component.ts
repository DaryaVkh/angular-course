import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit
} from '@angular/core';
import { FakeHttpService, randomCity } from '../../data-access/fake-http.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CityStore } from '../../data-access/city.store';
import { CardComponent } from '../../ui/card/card.component';
import { NgOptimizedImage } from '@angular/common';
import { ListItemComponent } from '../../ui/list-item/list-item.component';

@Component({
  selector: 'app-city-card',
  templateUrl: './city-card.component.html',
  styleUrl: './city-card.component.scss',
  imports: [CardComponent, NgOptimizedImage, ListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityCardComponent implements OnInit {
  private http = inject(FakeHttpService);
  private store = inject(CityStore);
  private destroyRef = inject(DestroyRef);
  cities = this.store.cities;

  protected addCity(): void {
    this.store.addOne(randomCity());
  }

  protected deleteCity(id: number): void {
    this.store.deleteOne(id);
  }

  ngOnInit(): void {
    this.http.fetchCities$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((c) => this.store.addAll(c));
  }
}
