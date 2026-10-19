# InjectionToken

### Как запускать

```bash
npm run serve:angular-injection-token
```

### Документация и инструкция

---
title: 🟠 InjectionToken
description: Challenge 39 is about learning the power of dependency injection
author: thomas-laforge
contributors:
  - tomalaforge
  - jdegand
  - LMFinney
challengeNumber: 39
command: angular-injection-token
videoLinks:
  - link: https://www.youtube.com/watch?v=ntggdQycFyc
    alt: Injection Token by Arthur Lannelucq
    flag: FR
sidebar:
  order: 118
---

## Информация

В этом небольшом приложении у нас есть `VideoComponent` с таймером на **1 секунду**. Команда разработки решила хранить значение таймера в глобальной константе `DEFAULT_TIMER`. Через несколько недель продуктовая команда захотела добавить новый экран для телефонных звонков — `PhoneComponent`, — и мы хотим переиспользовать в нём `TimerComponent`. Но для этого экрана продуктовой команде нужен таймер на **2 секунды**. Как этого добиться?

## Задание

Сейчас у `PhoneComponent` таймер всё ещё 1 секунда. Цель задания — изменить значение таймера на 2 секунды для `PhoneComponent`.

## Ограничения

Использовать `@Input` запрещено. Пример простой, и `@Input` здесь мог бы быть неплохим вариантом, но в более сложных приложениях компонент, который нужно настроить, может быть глубоко вложен, и тогда использование `@Input` — действительно плохой дизайн.

## Подсказка

<details>
  <summary>Подсказка 1</summary>

Очень поможет эта [статья](https://itnext.io/stop-being-scared-of-injectiontokens-ab22f72f0fe9).

</details>
