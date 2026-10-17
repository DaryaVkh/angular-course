import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private user = new BehaviorSubject<User | undefined>(undefined);
  user$ = this.user.asObservable();

  get currentUser(): User | undefined {
    return this.user.value;
  }
  
  add(user: User) {
    this.user.next(user);
  }
}
