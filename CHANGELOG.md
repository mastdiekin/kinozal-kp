# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 1.1.0 (2026-10-04)

### Features

* добавлена настройка времени кэша рейтингов ([1a6e243](https://github.com/mastdiekin/kinozal-kp/commit/1a6e2439ca7ae7574febe4e5e579c55e9419295d))
* добавлена обработка ошибок загрузки рейтинга ([b8a35a5](https://github.com/mastdiekin/kinozal-kp/commit/b8a35a5e5b69c6a7282c0582b0ade5f390a463ca))
* добавлена очистка кэша рейтингов ([93577e6](https://github.com/mastdiekin/kinozal-kp/commit/93577e6e293835156103092596c0e5df41585bff))
* добавление кэширования рейтингов ([8c3b82b](https://github.com/mastdiekin/kinozal-kp/commit/8c3b82b5ac0d770d1f41d449ebb17003c609d077))
* добавлено управление toggle настройками через меню пользователя ([c9105d3](https://github.com/mastdiekin/kinozal-kp/commit/c9105d37ff9772dcf2e351a10b75eef928bbef57))
* улучшена обработка карточек на главной странице ([7de6aad](https://github.com/mastdiekin/kinozal-kp/commit/7de6aade7198211d849fe437fbc5481a1bfd0f5d))
* улучшена обработка ошибок рейтинга ([c915ec8](https://github.com/mastdiekin/kinozal-kp/commit/c915ec8de1c230cda99734467712b9ddacd8fbd1))
* **kinozal:** замена Waypoints на IntersectionObserver ([b49ade6](https://github.com/mastdiekin/kinozal-kp/commit/b49ade6813e9b7cb11e1845cfd374649a9aec85a))
* **style:** обновление стилей и структуры кода ([5c1b38a](https://github.com/mastdiekin/kinozal-kp/commit/5c1b38acee719daafef979f925b84261cc51b9a9))

### Bug Fixes

* добавлена возможность обхода кэша при повторном нажатии ([b8bc592](https://github.com/mastdiekin/kinozal-kp/commit/b8bc592a2ba0f4966c65b1f20fb66a100f5d68de))
* исправлена опечатка в классе элемента загрузки ([9bd494a](https://github.com/mastdiekin/kinozal-kp/commit/9bd494a4b44982fe02e8fa00d5d22bb1a1e775a8))
* обновлен favicon ([26a8e2a](https://github.com/mastdiekin/kinozal-kp/commit/26a8e2a3bd30824036b15f3e8f4d12e4e6fe4845))
* **kinozal:** замена GM_xmlhttpRequest на fetch с поддержкой кодировки windows-1251 ([bb830ef](https://github.com/mastdiekin/kinozal-kp/commit/bb830efacc4990cdbef4d6a6217b6c8b3ef072d9))
## [1.0.9](https://github.com/mastdiekin/kinozal-kp/compare/1.0.8...1.0.9) (2026-09-26)

- Функция requestPage теперь асинхронная и использует fetch вместо GM_xmlhttpRequest.
- Реализована обработка ответа с учетом кодировки windows-1251.
- Добавлены константы для классов и селекторов (CLASS, SELECTOR)
- Переработана структура кода с добавлением разделов-комментариев
- Улучшена функция создания элемента прелоадера

### Features

* **style:** обновление стилей и структуры кода ([5c1b38a](https://github.com/mastdiekin/kinozal-kp/commit/5c1b38acee719daafef979f925b84261cc51b9a9))

### Bug Fixes

* **kinozal:** замена GM_xmlhttpRequest на fetch с поддержкой кодировки windows-1251 ([bb830ef](https://github.com/mastdiekin/kinozal-kp/commit/bb830efacc4990cdbef4d6a6217b6c8b3ef072d9))

## [1.0.8](https://github.com/mastdiekin/kinozal-kp/compare/1.0.7...1.0.8) (2022-05-31)

- Убрано jQuery
- Waypoints - noframework версия вместо jQuery
- Убран лишний код
- Небольшие изменения в верстке
- license

## [1.0.7](https://github.com/mastdiekin/kinozal-kp/compare/1.0.6...1.0.7) (2021-02-06)

- Добавлено зеркало kinozal-tv.appspot.com
- Добавлено зеркало kinozal.me
- Добавлено зеркало kinozal.guru
- Небольшие изменения в структуре

## [1.0.6](https://github.com/mastdiekin/kinozal-kp/compare/1.0.5...1.0.6) (2020-05-03)

- Добавлен рейтинг на главной странице сайта

## [1.0.5](https://github.com/mastdiekin/kinozal-kp/compare/1.0.4...1.0.5) (2020-03-19)

- Добавлен IMDb рейтинг
- Изменены цвета на более спокойные

## [1.0.4](https://github.com/mastdiekin/kinozal-kp/compare/94e38ae8f7b3e73812a69dfbc0fa3450ac039acd...1.0.4) (2019-06-03)

### Reverts

* Revert "Update kinozal_kp.user.js" ([94e38ae](https://github.com/mastdiekin/kinozal-kp/commit/94e38ae8f7b3e73812a69dfbc0fa3450ac039acd))