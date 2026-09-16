import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product, ProductCategory } from '../models/product.model';

/**
 * Константные моковые данные — имитация ответа с бэкенда.
 * В реальном приложении это был бы HttpClient + реальный API.
 */
const PRODUCTS: readonly Product[] = [
  {
    id: 'headphones-a1',
    title: 'Беспроводные наушники SoundMax A1',
    category: 'electronics',
    price: 89.99,
    emoji: '🎧',
    description: 'Накладные наушники с шумоподавлением и автономностью до 30 часов.',
  },
  {
    id: 'smartwatch-p2',
    title: 'Смарт-часы PulseFit P2',
    category: 'electronics',
    price: 129.0,
    emoji: '⌚️',
    description: 'Отслеживание пульса, сна и тренировок, водозащита 5 ATM.',
  },
  {
    id: 'keyboard-mk3',
    title: 'Механическая клавиатура MechKey MK3',
    category: 'electronics',
    price: 74.5,
    emoji: '⌨️',
    description: 'Компактная клавиатура на горячо-заменяемых свитчах с RGB-подсветкой.',
  },
  {
    id: 'book-ng-router',
    title: 'Angular Router изнутри',
    category: 'books',
    price: 24.99,
    emoji: '📘',
    description: 'Подробный разбор устройства Angular Router: от routes до guards.',
  },
  {
    id: 'book-rxjs',
    title: 'RxJS для практиков',
    category: 'books',
    price: 19.9,
    emoji: '📗',
    description: 'Операторы, стратегии подписки и типичные ошибки в реактивном коде.',
  },
  {
    id: 'book-ts',
    title: 'TypeScript: паттерны и типы',
    category: 'books',
    price: 22.0,
    emoji: '📙',
    description: 'От базовых типов до продвинутых generic-паттернов.',
  },
  {
    id: 'lamp-orbit',
    title: 'Настольная лампа Orbit',
    category: 'home',
    price: 39.0,
    emoji: '💡',
    description: 'Регулируемая яркость и цветовая температура, USB-зарядка.',
  },
  {
    id: 'mug-thermo',
    title: 'Термокружка WarmStay 400мл',
    category: 'home',
    price: 15.5,
    emoji: '☕️',
    description: 'Держит температуру до 6 часов, крышка с защитой от протекания.',
  },
  {
    id: 'plant-pot',
    title: 'Кашпо Terra Ceramic',
    category: 'home',
    price: 27.3,
    emoji: '🪴',
    description: 'Керамическое кашпо с поддоном, подходит для большинства комнатных растений.',
  },
];

const NETWORK_DELAY_MS = 350;

@Injectable({ providedIn: 'root' })
export class ProductsService {
  getAll(category?: ProductCategory | null): Observable<readonly Product[]> {
    const result = category ? PRODUCTS.filter((product) => product.category === category) : PRODUCTS;
    return of(result).pipe(delay(NETWORK_DELAY_MS));
  }

  getById(id: string): Observable<Product | undefined> {
    return of(PRODUCTS.find((product) => product.id === id)).pipe(delay(NETWORK_DELAY_MS));
  }
}
