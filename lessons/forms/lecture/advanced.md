# Расширенные знания

# Angular Forms. Advanced

## ControlValueAccessor

Это важная тема для построения своих собственных форм-контролов. Раньше мы рассматривали нативные контролы, например текстовые инпуты. Есть так же нативные (стандартные, уже существующие во всех браузерах) чекбоксы, радио-кнопки, датапикер (контрол выбора даты).

Часто бывает так, что нам хочется не только поменять внешний вид этих стандартных контролов но и вообще создать что то принципиально новое, при эьтом чтобы оно было совместимо с Forms API ангуляра.

Давайте попробуем рассмотреть пример и проблематику. Представим такой пользователький сценарий:
1. Юзер заполняет отзыв о товаре
2. В отзыве у нас есть форма, которая должна содержать следующие данные:
    - текст отзыва
    - оценку товара
3. Оценка товара выставляется как кол-во звезд, от 1 то 5.

Вот такая форма должна отправиться на сервер:

```
{
    reviewContent: string;
    rating: number;
}
```

Форма наша будет состоять из двух дом-элементов:
    - textarea куда мы будем вписывать текст отзыва
    - компонента star-rating, которая будет отображать звездочки и хранить
    кол-во звезд которое мы выбрали

```typescript
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    <div class="stars" role="group" aria-label="Оценка товара">
      @for (star of stars; track star) {
        <button
          type="button"
          class="star"
          [class.filled]="star <= value()"
          [attr.aria-label]="star + ' из 5'"
          (click)="setRating(star)"
        >
          ★
        </button>
      }
    </div>
  `,
  styles: `
    .stars {
      display: flex;
      gap: 4px;
    }

    .star {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #d3d1c7; /* незакрашенная звезда */
      padding: 0;
      transition:
        color 0.1s,
        transform 0.1s;
      line-height: 1;
    }

    .star.filled {
      color: #ef9f27;
    }

    .star:hover {
      transform: scale(1.15);
    }
  `,
})
export class StarRatingComponent {
  value = signal<number>(0);
  valueChange = output<number>();

  stars = [1, 2, 3, 4, 5];

  setRating(star: number): void {
    this.valueChange.emit(star);
    this.value.set(star);
  }
}

import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StarRatingComponent } from './star-rating';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [ReactiveFormsModule, StarRatingComponent],
  styles: `
    textarea { display: block; }
    .error { color: red; }
  `,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="review">Текст отзыва</label>
        <textarea
          id="review"
          formControlName="reviewContent"
          rows="4"
        ></textarea>
        @if (form.controls.reviewContent.invalid && form.controls.reviewContent.touched) {
          <p class="error">Проверьте отзыв: минимум 10 символов</p>
        }
      </div>

      <div class="field">
        <label>Оценка</label>
        <app-star-rating
          (valueChange)="onRatingChange($event)"
        />

        @if (form.controls.rating.invalid && form.controls.rating.touched) {
          <p class="error">Выберите оценку</p>
        }
      </div>

      <button type="submit">Отправить отзыв</button>
    </form>
  `,
})
export class ReviewFormComponent {
  form = new FormGroup({
    reviewContent: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
    rating: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(1)],
    }),
  });

  get ratingValue() {
    return this.form.controls.rating.value;
  }

  // Обработчик события: вручную обновляем контрол
  onRatingChange(value: number): void {
    this.form.controls.rating.setValue(value);
    this.form.controls.rating.markAsTouched(); // ← вручную!
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.error('Form is invalid')
      
      return;
    }
    console.log(this.form.value);
    // { reviewContent: string; rating: number }
  }
}
```

Давайте подробно разберем что тут происходит.
1. Мы создали компоненту `StarRatingComponent`. Она отвечает за отрисовку звездочек и хранит значение выбрынных звезд. Когда звезды выбрали - наверх через output отправляется выбранное значение.
2. Создали компонету `ReviewFormComponent` которая рендерит собственно форму: textarea + компоненту рейтинга. Мы создали инстанс FormGroup и привязали к нему 2 инстанса FormControl. Форм-контрол `reviewContent` мы привязали к `textarea`, а форм-контрол `rating` мы привязали к... а вот и первая проблема! Мы его ни к какому дом-элементу не привязали. Точнее вы можете попробовать его привязать к компоненте `app-star-rating`, точно так же как это сделано с `textarea`: попробуйте и посмотрите что получится. Подсказка: смотрите в консоль браузера.

Если запустить код этой формы (без привязки форм-контрола `rating` к `app-star-rating`), поиграться с формой то все будет работать в целом, данные соберутся, а значит и отправить на сервер их получится. Но какие проблемы тут есть? Вот они:

1. Появился какой то фантомный инстанс FormControl с ключом `rating`: класс форм-контрола есть, он даже хранит в себе какой то стейт, но существует он только в рамках TS-файла. Хотя должен быть связан с дом-элементом.
2. Реактивность какая то худая, основана только на output компонента `app-star-rating`. Очень сложно будет как то строить сложные Rx-цепочки в таком случае.
3. Если мы захотим включить полную мощь реактивности FormControl и попробуем привязать FormControl к компоненте `app-star-rating` через директиву `formControlName` то получим какую то странную ошибку: `NG01203: No value accessor for form control name: 'rating'`
4. Чтобы реализовать валидацию значения компоненты `app-start-rating` нужно писать кастомный код. Тоже самое касается состояний touched, disabled: вполне обычных состояний каждого форм контрола. Их придется писать вручную. При этом вся эта логика будет жить в родительской компоненте формы, а не в `app-star-rating`.

Если представить что все эти операции надо будет проделывать вообще для любой такой компоненты которую мы хотим использовать в форме, то появляется ощущение безысходности: слишком много бойлерплейта. Можно конечно написать некоторый код-обёртку, который мы потом сможем использовать повсеместно. К счастью, это не нужно делать.

Именно для решения этой проблемы в Ангуляре существует паттерн `ControlValueAccessor`.
`ControlValueAccessor` (далее CVA) определяет **стандартный контракт** между Angular Forms API и любым компонентом. После реализации этого контракта ваш компонент становится полноценным элементом формы — точно так же, как `<input>` или любой другой нативный форм-контрол.

Технически CVA — это TypeScript-интерфейс с четырьмя методами. Три обязательных, один нет:

```ts
interface ControlValueAccessor {
  // кто-то снаружи меняет значение программно — 
  // форма обязана отразить это в UI.
  // Angular говорит компоненту: у модели новое значение, обнови свой UI. 
  // Компонент должен отрендерить это изменение в UI
  writeValue(value: any): void;
  // регистрация колбэка, который будет вызываться
  // каждый раз при изменении контрола через UI
  // то есть когда юзер повзаимодействовал с контролом
  // этот колбек заишет значение в FormControl и соотв. запустит
  // пайплайн valueChanges контрола
  registerOnChange(fn: (value: any) => void): void;
  // тоже самое но про логику touch-состояния
  // то есть когда юзер потрогал контрол и снял с него фокус (blur-событие)
  registerOnTouched(fn: () => void): void;
  // логика disabled-состояния
  setDisabledState?(isDisabled: boolean): void;
}
```

Раз это интерфейс, то чтобы превратить наш компонент в форм-контрол, надо чтобы компонента имплементировала этот интерфейс. Давайте создадим новый компонент рейтинга, и уже его сделаем как CVA. Зачем новый? Чтобы потом было нагляднее сравнивать оба подхода

TODO - сделать код
```ts
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StarRatingCvaComponent } from './star-rating-cva';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [ReactiveFormsModule, StarRatingCvaComponent],
  styles: `
    textarea { display: block; }
    .error { color: red; }
  `,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="field">
        <label for="review">Текст отзыва</label>
        <textarea
          id="review"
          formControlName="reviewContent"
          rows="4"
        ></textarea>
        @if (form.controls.reviewContent.invalid && form.controls.reviewContent.touched) {
          <p class="error">Проверьте отзыв: минимум 10 символов</p>
        }
      </div>

      <div class="field">
        <label>Оценка</label>
        <app-star-rating-cva formControlName="rating" />

        @if (form.controls.rating.invalid && form.controls.rating.touched) {
          <p class="error">Выберите оценку</p>
        }
      </div>

      <button type="submit">Отправить отзыв</button>
    </form>
  `,
})
export class ReviewFormComponent {
  form = new FormGroup({
    reviewContent: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
    rating: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.min(1)],
    }),
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.error('Form is invalid')
      
      return;
    }
    console.log(this.form.value);
    // { reviewContent: string; rating: number }
  }
}

import { Component, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating-cva',
  standalone: true,
  template: `
    <div class="stars" role="group" aria-label="Оценка товара">
      @for (star of stars; track star) {
        <button
          type="button"
          class="star"
          [class.filled]="star <= value"
          [attr.aria-label]="star + ' из 5'"
          (click)="setRating(star)"
        >
          ★
        </button>
      }
    </div>
  `,
  styles: `
    .stars {
      display: flex;
      gap: 4px;
    }

    .star {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #d3d1c7; /* незакрашенная звезда */
      padding: 0;
      transition:
        color 0.1s,
        transform 0.1s;
      line-height: 1;
    }

    .star.filled {
      color: #ef9f27;
    }

    .star:hover {
      transform: scale(1.15);
    }
  `,
  // `NG_VALUE_ACCESSOR` — это токен инъекции, по которому Angular Forms ищет реализацию CVA для элемента. 
  // `multi: true` означает что под одним токеном может быть несколько провайдеров — Angular собирает их массивом. 
  // `useExisting` говорит: "используй уже существующий экземпляр компонента, не создавай новый".
  // `forwardRef(() => StarRatingCvaComponent)` решает проблему: в момент выполнения декоратора 
  // `@Component` класс `StarRatingCvaComponent` ещё не определён в JavaScript (классы не поднимаются как `var`).
  // `forwardRef` откладывает разрешение ссылки до момента использования.
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingCvaComponent),
      multi: true,
    },
  ],
})
export class StarRatingCvaComponent implements ControlValueAccessor {
  stars = [1, 2, 3, 4, 5];

  // Внутреннее состояние компонента
  value = 0;
  disabled = false;

  // Колбэки, которые Angular Forms передаст через registerOnChange / registerOnTouched
  onChange: (value: number) => void = () => { };
  onTouched: () => void = () => { };

  // ControlValueAccessor — метод 1
  // Вызывается Angular когда форма хочет записать значение в компонент
  // Например: form.patchValue({ rating: 4 }) или form.reset()
  writeValue(value: number): void {
    this.value = value ?? 0;
  }

  // ControlValueAccessor — метод 2
  // Angular передаёт сюда функцию, которую мы обязаны вызывать
  // каждый раз когда значение меняется изнутри компонента
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  // ControlValueAccessor — метод 3
  // Angular передаёт сюда функцию для пометки контрола как touched
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // ControlValueAccessor — метод 4 (опциональный)
  // Вызывается когда форма делает control.disable() / control.enable()
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  setRating(star: number): void {
    this.value = star;
    this.onChange(star);  // сообщаем форме о новом значении
    this.onTouched();     // помечаем контрол как touched
  }
}

```

Посмотрите как изменился код: теперь у нас куча кода делается под капотом, всё стройно и масштабируемо, а еще - все стандартизировано. Все члены команды при решении подобной задачи будут следовать паттерну CVA и весь код будет одинаковым.

Теперь мы просто взяли и сделали так: `<app-star-rating-cva formControlName="rating" />` и наша компонента стала полноценным форм контролов, со всеми плюшками.

Любопытные могут задаться вопросом: а почему когда мы вешали директиву `formControlName` на `input type="text"` у нас не было никаких ошибок, мы ничего не реализовывали?
Дело в том, что Ангуляр уже за нас реализовал для всех нативных контролов ControlValueAccessor. Можно посмотреть их [вот тут](https://github.com/angular/angular/blob/main/packages/forms/src/directives/checkbox_value_accessor.ts). Это ControlValueAccessor для checkbox, но в этом же каталоге лежат все остельные стандартные ValueAccessors.

## Асинхронные валидаторы

Синхронных валидаторов достаточно для большинства проверок. Но что если нужно проверить занят ли логин на сервере, существует ли промокод, доступен ли email? Для таких задач нужно посылать дополнительные http-запросы, то есть выполнять операцию валидации асинхронно, ведь неизвестно сколько времени будет длиться запрос.

Асинхронные валидаторы работают точно так же, как синхронные, но возвращают `Observable<ValidationErrors | null>` вместо `ValidationErrors | null`. Пока асинхронный валидатор работает, контрол находится в состоянии `pending`.

```typescript
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { UserService } from './user.service';

// Фабрика асинхронного валидатора
function usernameAvailable(): AsyncValidatorFn {
  const userService = inject(UserService);

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    return of(control.value).pipe(
      debounceTime(400),         // ждём 400мс после последнего ввода
      distinctUntilChanged(),    // не запрашиваем если значение не изменилось
      switchMap(username =>
        userService.checkAvailability(username).pipe(
          map(isAvailable => isAvailable ? null : { usernameTaken: true }),
          catchError(() => of(null)), // ошибка сети — не блокируем форму
        )
      )
    );
  };
}

// Использование: async-валидаторы передаются третьим аргументом в FormControl
const form = new FormGroup({
  username: new FormControl(
    '',
    [Validators.required, Validators.minLength(3)], // sync
    [usernameAvailable()]                           // async
  ),
});
```

В шаблоне показываем состояние `pending`:

```html
<input formControlName="username" />

@if (form.controls.username.pending) {
  <span>Проверяем доступность...</span>
}
@if (form.controls.username.errors?.['usernameTaken']) {
  <span>Этот username уже занят</span>
}
```

Важный нюанс производительности: Angular не запускает async-валидаторы, если sync-валидаторы уже вернули ошибку. Это правильное поведение — зачем делать запрос, если поле пустое или слишком короткое?

## FormBuilder — сокращённый синтаксис для создания форм

Писать `new FormControl(...)` для каждого поля быстро надоедает. `FormBuilder` — это сервис-хелпер, который сокращает синтаксис. Вместо явного создания объектов вы передаёте массивы `[значение, валидаторы]`.

```typescript
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({ ... })
export class RegisterComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    profile: this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
    }),
  });
}
```

`fb.group(...)` эквивалентен `new FormGroup(...)`, но читается чище. Обратите внимание: `FormGroup` можно вкладывать — `profile` здесь является вложенной группой. В шаблоне для неё нужна директива `formGroupName="profile"`.

Давайте для примера сравним подход без использования `FormBuilder`:

```ts
@Component({ ... })
export class RegisterComponent {
  form = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    profile: new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName:  new FormControl('', Validators.required),
    }),
  });
}
```

`FormBuilder` — это просто синтаксический сахар. `fb.group({ email: ['', ...] })` разворачивается в `new FormGroup({ email: new FormControl('', ...) })`. Результат идентичен, но код читается проще
