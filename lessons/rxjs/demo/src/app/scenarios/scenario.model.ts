import { Type } from '@angular/core';

export type LaneKind = 'imperative' | 'reactive';

/**
 * Ссылка на слайд презентации. page — номер страницы PDF,
 * используется для построения deep-link на конкретный слайд.
 */
export interface SlideRef {
  readonly page: number;
  readonly title: string;
}

/**
 * Метаданные сценария: описание + связь с разделами лекции.
 */
export interface ScenarioMeta {
  readonly id: string;
  readonly name: string;
  readonly slides: ReadonlyArray<SlideRef>;
  readonly operators: ReadonlyArray<string>;
  readonly summary: string;
}

/**
 * Контракт сценария: standalone-компонент + метаданные для сайдбара.
 */
export interface ScenarioDescriptor {
  readonly meta: ScenarioMeta;
  readonly component: Type<unknown>;
}