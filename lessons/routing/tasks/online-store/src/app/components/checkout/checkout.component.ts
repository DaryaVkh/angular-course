import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HasUnsavedChanges } from '../../guards/unsaved-changes.guard';
import { CartService } from '../../services/cart.service';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-checkout',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'checkout.component.html',
})
export class CheckoutComponent implements HasUnsavedChanges {
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);

  protected readonly cart = inject(CartService);
  protected readonly fullName = signal('');
  protected readonly address = signal('');
  protected readonly placing = signal(false);
  private readonly submitted = signal(false);

  protected onFullNameChange(value: string): void {
    this.fullName.set(value);
  }

  protected onAddressChange(value: string): void {
    this.address.set(value);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.placing.set(true);

    this.ordersService.placeOrder({ fullName: this.fullName(), address: this.address() }).subscribe(({ orderId }) => {
      this.submitted.set(true);
      this.cart.clear();
      this.router.navigate(['/order', orderId], { replaceUrl: true });
    });
  }

  /**
   * Пока заказ не отправлен и в форме есть введённый текст, уход со страницы должен подтверждаться.
   */
  hasUnsavedChanges(): boolean {
    return !this.submitted() && (this.fullName().length > 0 || this.address().length > 0);
  }
}
