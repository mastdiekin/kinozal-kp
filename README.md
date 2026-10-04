<p align="center">
  <a href="https://github.com/mastdiekin/kinozal-kp">
    <img src="https://github.com/mastdiekin/kinozal-kp/blob/master/src/assets/preview.gif" alt="" width="657" height="350">
  </a>
</p>

# Что делает?

На главной странице и на странице топа http://kinozal.tv/top.php собирает данные о рейтинге по ссылкам фильмов.

## Как использовать?

Установить [kinozal_kp.user.js](https://github.com/mastdiekin/kinozal-kp/releases/latest/download/kinozal_kp.user.js) в [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=ru)

### Обновления

см. [CHANGELOG.md](CHANGELOG.md)

### Для разработчиков

Проект собирается через [Vite](https://vite.dev/) и [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey). Блок `==UserScript==` генерируется автоматически из `vite.config.js` и `package.json`, а `@grant` расставляются по тем `GM_*` функциям, которые импортированы в коде.

### Структура

```
kinozal-kp/
├── package.json     # версия, автор, лицензия и скрипты сборки
├── vite.config.js   # конфиг сборки и метаданные userscript
└── src/
    └── main.js      # исходный код скрипта
```

### Требования

- [Node.js](https://nodejs.org/) (актуальная LTS-версия)
- Tampermonkey в браузере

### Установка зависимостей

```bash
npm install
```

### Сборка

```bash
npm run build            # минифицированный файл
npm run build:readable   # читаемый файл без минификации
```

Готовый файл появится в `dist/kinozal_kp.user.js`. Читаемую сборку используйте там, где не принимают минифицированный код (например, при публикации на Greasy Fork).

### Разработка с автообновлением

```bash
npm run dev
```

После запуска откроется страница установки dev-версии в Tampermonkey. Нажмите «Установить». Дальше изменения в `src/main.js` подхватываются при обновлении страницы сайта.

Что нужно знать:

- Dev-версия называется `server:Рейтинг кинопоиска для kinozal.tv`. Она подгружает код с локального сервера, поэтому `npm run dev` должен оставаться запущенным, иначе скрипт на сайте не сработает.
- Отключите обычную версию скрипта, пока тестируете dev-версию. Иначе на странице появятся дубли кнопок и плашек.
- В dev-режиме в шапке указаны все возможные `@grant`. В обычной сборке остаются только используемые.
- В Chrome сайт может не получить доступ к локальному серверу и в консоли будет ошибка про `loopback address space`. Откройте «Настройки сайта» для `kinozal.guru` (и других используемых доменов) и разрешите пункт **«Приложения на устройстве»**. Название пункта зависит от версии браузера. Если ошибка остаётся, перезапустите браузер.
- Если ошибка `ERR_BLOCKED_BY_CLIENT`, то запрос блокирует расширение (uBlock Origin, AdGuard и подобные) или встроенная защита браузера. Отключите блокировщик для сайта.

### Выпуск новой версии

Версия и changelog обновляются через [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version). Инструмент по сообщениям коммитов в формате [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:` и т.д.) сам определяет новую версию, обновляет `version` в `package.json`, дописывает [CHANGELOG.md](CHANGELOG.md), создаёт коммит и git-тег. Править версию и changelog вручную не нужно.

```bash
npm run release              # версия определяется по коммитам
npm run release -- --dry-run # показать, что произойдёт, ничего не меняя
npm run release -- --release-as minor   # задать тип повышения вручную (patch, minor, major)
```

Порядок выпуска:

1. Закоммитить изменения с сообщениями вида `feat: ...` или `fix: ...`.
2. Выполнить `npm run release`. Версия в `package.json` и `CHANGELOG.md` обновятся, появятся коммит и тег.
3. Выполнить `npm run build`. Сборку нужно делать **после** повышения версии, потому что версия в шапке скрипта берётся из `package.json`.
4. Отправить коммит и тег: `git push --follow-tags origin master`.
5. Взять готовый файл из `dist/`.