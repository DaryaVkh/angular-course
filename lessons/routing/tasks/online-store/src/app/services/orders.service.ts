import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface CheckoutForm {
  readonly fullName: string;
  readonly address: string;
}

const NETWORK_DELAY_MS = 500;
let orderCounter = 1000;

@Injectable({ providedIn: 'root' })
export class OrdersService {
  /** Имитация отправки заказа на бэкенд — возвращает id "созданного" заказа. */
  placeOrder(_form: CheckoutForm): Observable<{ orderId: string }> {
    orderCounter += 1;
    return of({ orderId: String(orderCounter) }).pipe(delay(NETWORK_DELAY_MS));
  }
}
