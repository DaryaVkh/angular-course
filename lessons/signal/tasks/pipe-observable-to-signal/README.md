# Pipe Observable to Signal

🔴 Уровень: сложный · ⏱ 60–90 минут · Тема: [Сигналы](../../lecture/advanced.md)

### Как запускать

```bash
npm run serve:signal-pipe-observable-to-signal
```

## Документация
---
title: 🔴 Pipe Observable to Signal
description: Испытание 54 про рефакторинг приложения с observable на сигналы
author: thomas-laforge
contributors:
  - tomalaforge
  - LMFinney
challengeNumber: 54
command: signal-pipe-observable-to-signal
sidebar:
  order: 210
---

## Информация

У нас есть легаси-приложение, которое хранит состояние в observable. Сигналы подходят для этого гораздо лучше.

## Задача

Цель этого испытания — отрефакторить приложение так, чтобы оно полностью работало на сигналах. Когда вы закончите, ни пайп, ни сервис не должны импортировать RxJS.

Будьте внимательны по ходу: не всё заработает так, как вам хотелось бы.
