# Master Dependancy Injection

### Как запускать

```bash
npm run serve:angular-master-dependency-injection
```

### Документация и инструкция

---
title: 🔴 Master Dependency Injection
description: Челлендж 16 посвящён глубокому пониманию того, как работает внедрение зависимостей
author: thomas-laforge
contributors:
  - tomalaforge
  - tomer953
  - kabrunko-dev
challengeNumber: 16
command: angular-master-dependency-injection
sidebar:
  order: 203
---

## Описание

Чтобы успешно выполнить этот челлендж, нужно хорошо понимать, как в Angular работает [внедрение зависимостей (Dependency Injection)](https://angular.dev/guide/di/dependency-injection).

Цель — предоставить `CurrencyService` на уровне строки, чтобы в каждой строке отображалась правильная валюта. Сейчас `CurrencyService` предоставлен только на уровне таблицы, и из-за этого возникает ошибка: во всех строках показывается одна и та же валюта, хотя у каждого товара она своя.

Один из способов решить задачу — добавить в пайп второй аргумент, но в этом челлендже так делать нельзя.

## Задание

- Отобрази правильную валюту в каждой строке.

## Ограничения

- Пайп изменять нельзя.
- Нельзя оборачивать строку в компонент, потому что это сломает вёрстку.
