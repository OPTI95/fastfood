# 🍔 FastFood Service

Полнофункциональный сервис для продажи быстрого питания с админ-панелью и интеграцией WhatsApp.

## 🎯 Функции

- 📱 **Веб-сайт** - Красивый интерфейс для выбора товаров
- 🛒 **Корзина** - Сборка заказов с расчетом суммы
- 💬 **WhatsApp интеграция** - Автоматическая отправка заказов
- 🔐 **Админ-панель** - Управление товарами и категориями
- 📊 **История заказов** - Просмотр всех заказов
- 🎨 **Современный дизайн** - Адаптивный интерфейс

## 📋 Структура проекта

```
fastfood-service/
├── backend/              # Node.js + Express API
│   ├── routes/          # API маршруты
│   ├── middleware/      # Аутентификация
│   ├── db.js           # Подключение к БД
│   ├── server.js       # Основной сервер
│   └── package.json
├── frontend/           # React приложение
│   ├── src/
│   │   ├── pages/      # Страницы
│   │   └── App.js
│   └── package.json
├── docker-compose.yml  # Docker конфиг
└── README.md
```

## 🚀 Быстрый старт (локально)

### 1. Установка зависимостей

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Запуск

```bash
# Backend
cd backend && npm run dev

# Frontend (в новом терминале)
cd frontend && npm start
```

Откройте http://localhost:3000 в браузере.

## 🐳 Развертывание на VDS (Docker)

### 1. Клонируем проект на VDS

```bash
cd /home/your_user
git clone your_repo_url fastfood-service
cd fastfood-service
```

### 2. Запуск Docker Compose

```bash
docker-compose up -d
```

### 3. Проверяем статус

```bash
docker-compose ps
docker-compose logs -f
```

Приложение доступно:
- **Фронтенд**: http://your_vds_ip:3000
- **API**: http://your_vds_ip:5000

## 📝 Настройка WhatsApp (Twilio)

1. Создайте аккаунт на [twilio.com](https://www.twilio.com)
2. Получите: Account SID, Auth Token, Phone Number
3. Обновите `backend/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🛠️ Основные команды Docker

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Логи
docker-compose logs -f

# Перезапуск
docker-compose restart backend
```

## 📝 Первые шаги

1. Откройте http://your_vds_ip:3000
2. Нажмите "Админ" → "Зарегистрироваться"
3. Залогинитесь в админ-панель
4. Добавьте категории и товары
5. Сайт готов к использованию!

## 🔐 Безопасность

⚠️ **Важно для продакшена:**

1. Измените `JWT_SECRET` в `backend/.env` на случайную строку
2. Используйте сильный пароль для админа
3. Включите HTTPS (используйте Nginx или Let's Encrypt)
4. Регулярно обновляйте зависимости

