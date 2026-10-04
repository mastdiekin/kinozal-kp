# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

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