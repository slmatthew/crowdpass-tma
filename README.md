# CrowdPass TMA

В этом репозитории хранится исходный код мини-приложения Telegram CrowdPass

## Установка

1. Склонируйте репозиторий с помощью `git clone`
2. Перейдите в папку с проектом: `cd crowdpass-tma`
3. Выполните установку зависимостей: `npm install`

## Настройка

Для настройки TMA используется файл `src/config/appConfig.ts` ([click](https://github.com/slmatthew/crowdpass-tma/blob/main/src/config/appConfig.ts)). Приложение само будет использовать нужную конфигурацию в зависимости от окружения.

Вам необходимо заменить возможные значения `appConfig.apiBaseUrl`, указав сначала endpoint тестового API-сервера (бекенда crowdpass), а потом endpoint production-сервера, например:

```ts
import { publicUrl } from "@/helpers/publicUrl";

export const appConfig = {
  isDevMode: import.meta.env.DEV,
  apiBaseUrl: import.meta.env.DEV ? 'https://cps-test.slmatthew.dev/api/' : 'https://crowdpass-api.slmatthew.dev/api/', // эти два значения необходимо изменить
  placeholderSrc: publicUrl('placeholder.png'),
  pageSize: 10,
};
```

## Сборка
`npm run build`

## Деплой
Вам необходимо самостоятельно задеплоить приложение, так как я это делал на своём сервере и не пользовался ни GitHub Pages, ни иными хостингами статики