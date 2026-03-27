# ⚡ Быстрый старт

## Локальная разработка (5 минут)

### 1. Требования
- Node.js 16+
- PostgreSQL 12+
- Git

### 2. Установка

```bash
# Клонируем проект
git clone your_repo_url
cd fastfood-service

# Устанавливаем зависимости
cd backend && npm install
cd ../frontend && npm install
```

### 3. Запускаем БД (если локальная)

```bash
# MacOS с Homebrew
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo systemctl start postgresql

# Или используем Docker
docker run --name fastfood_postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 4. Запуск приложения

```bash
# Терминал 1 - Backend
cd backend
npm run dev
# Ожидаем: ✅ Server running on port 5000

# Терминал 2 - Frontend
cd frontend
npm start
# Автоматически откроется http://localhost:3000
```

### 5. Первые шаги

1. Откройте http://localhost:3000
2. Нажмите "Админ" в верхнем меню
3. Нажмите "Зарегистрироваться"
4. Введите:
   - Логин: `admin`
   - Email: `admin@example.com`
   - Пароль: `123456`
5. Залогинитесь
6. Добавьте первую категорию: `🍣 Суши`
7. Добавьте товар

✅ Готово! Можете использовать приложение локально

---

## Развертывание на VDS (10 минут)

### 1. Требования
- VDS с Ubuntu 20.04+
- SSH доступ
- Домен (опционально)

### 2. Подготовка VDS

```bash
# Логинимся на сервер
ssh root@your_vds_ip

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Устанавливаем Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3. Развертывание приложения

```bash
# Клонируем проект
git clone your_repo_url /home/fastfood-service
cd /home/fastfood-service

# Редактируем переменные окружения
nano backend/.env
# Измените JWT_SECRET и другие параметры

# Запускаем приложение
docker-compose up -d

# Проверяем статус
docker-compose ps

# Смотрим логи
docker-compose logs -f
```

### 4. Доступ к приложению

```
Frontend: http://your_vds_ip:3000
API: http://your_vds_ip:5000
```

### 5. Настройка домена (опционально)

```bash
# Устанавливаем Nginx
apt install -y nginx

# Копируем конфиг
sudo cp nginx.conf /etc/nginx/sites-available/fastfood
sudo ln -s /etc/nginx/sites-available/fastfood /etc/nginx/sites-enabled/fastfood

# Тестируем конфиг
sudo nginx -t

# Запускаем Nginx
sudo systemctl restart nginx

# Получаем SSL сертификат (Let's Encrypt)
apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your_domain.com
```

Теперь приложение доступно по: https://your_domain.com

---

## Добавление товаров через Admin API

```bash
# Получить токен
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# Скопируйте значение поля "token"

# Добавить категорию
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"🍣 Суши","description":"Свежие суши"}'

# Добавить товар
curl -X POST http://localhost:5000/api/admin/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name":"Калифорния",
    "description":"Ролл с крабом",
    "price":320,
    "categoryId":1,
    "imageUrl":"https://..."
  }'
```

---

## Настройка WhatsApp

1. Создайте аккаунт на https://www.twilio.com (бесплатный trial)
2. Перейдите в Console → Phone Numbers
3. Получите ACCOUNT SID и AUTH TOKEN
4. Активируйте WhatsApp Sandbox
5. Обновите `backend/.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

6. Перезапустите backend:

```bash
docker-compose restart backend
```

Теперь при создании заказа сообщение будет отправляться в WhatsApp!

---

## Команды для управления

```bash
# Просмотр логов
docker-compose logs -f

# Остановка приложения
docker-compose down

# Запуск приложения
docker-compose up -d

# Перезагрузка backend
docker-compose restart backend

# Подключение к БД
docker-compose exec postgres psql -U postgres -d fastfood_db

# Экспорт БД
docker-compose exec postgres pg_dump -U postgres fastfood_db > backup.sql

# Импорт БД
cat backup.sql | docker-compose exec -T postgres psql -U postgres fastfood_db
```

---

## Troubleshooting

**Q: Приложение не запускается**
```bash
docker-compose logs
# Посмотрите ошибку и исправьте
```

**Q: Ошибка подключения к БД**
```bash
# Убедитесь что PostgreSQL запущена
docker-compose ps postgres

# Перезапустите БД
docker-compose restart postgres
```

**Q: Порт уже в использовании**
```bash
# Найдите процесс на порту
lsof -i :5000

# Убейте процесс (замените PID)
kill -9 PID
```

**Q: Забыли пароль админа**
```bash
# Удалите пользователя из БД и создайте нового
docker-compose exec postgres psql -U postgres -d fastfood_db
DELETE FROM users WHERE username='admin';
```

---

## Дополнительные ресурсы

- 📖 [API документация](API_DOCUMENTATION.md)
- 🚀 [Полный гайд развертывания](DEPLOYMENT.md)
- 📋 [README](README.md)

---

**Вопросы?** Проверьте логи: `docker-compose logs`
