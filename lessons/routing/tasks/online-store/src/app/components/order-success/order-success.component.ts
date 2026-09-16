import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-order-success',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-success.component.html',
})
export class OrderSuccessComponent {
  private readonly route = inject(ActivatedRoute);

  /**
   * TODO: сейчас orderId всегда '—'. Замените заглушку на реальное чтение
   * параметра маршрута `orderId` (см. route `order/:orderId`)
   */
  protected readonly orderId = toSignal(this.route.paramMap.pipe(map(() => '—')), {
    initialValue: '—',
  });
}
