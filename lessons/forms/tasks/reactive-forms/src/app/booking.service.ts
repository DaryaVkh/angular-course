import { Injectable } from '@angular/core';
import { map, Observable, timer } from 'rxjs';

export interface Tour {
  id: string;
  title: string;
  seats: number;
}

export interface BookingRequest {
  contact: { name: string; email: string };
  tourId: string;
  guests: string[];
}

export interface BookingReceipt {
  reference: string;
  tourTitle: string;
  seats: number;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly tours: Tour[] = [
    { id: 'observatory', title: 'Вечер в обсерватории', seats: 1 },
    { id: 'museum', title: 'Музей архитектуры', seats: 3 },
    { id: 'botanical-garden', title: 'Ботанический сад', seats: 5 },
  ];
  private readonly bookedEmails = new Set(['reserved@example.com']);
  private nextReference = 1;

  getTours(): Observable<Tour[]> {
    return timer(400).pipe(map(() => this.tours.map((tour) => ({ ...tour }))));
  }

  isEmailAvailable(email: string): Observable<boolean> {
    return timer(600).pipe(
      map(() => !this.bookedEmails.has(email.trim().toLowerCase())),
    );
  }

  book(request: BookingRequest): Observable<BookingReceipt> {
    return timer(800).pipe(
      map(() => {
        const email = request.contact.email.trim().toLowerCase();
        const tour = this.tours.find(({ id }) => id === request.tourId);
        const seats = request.guests.length + 1;

        if (this.bookedEmails.has(email)) {
          throw new Error('На эту почту уже оформлено бронирование.');
        }

        if (!tour || tour.seats < seats) {
          throw new Error('На выбранной экскурсии недостаточно мест.');
        }

        tour.seats -= seats;
        this.bookedEmails.add(email);

        return {
          reference: `EX-${this.nextReference++}`,
          tourTitle: tour.title,
          seats,
        };
      }),
    );
  }
}
