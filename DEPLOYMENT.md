# 🚀 Гайд по развертыванию на VDS

## Требования

- VDS с Ubuntu 20.04+ или Debian 10+
- Минимум 2GB RAM
- 20GB свободного места на диске
- Доступ по SSH

## Шаг 1: Подготовка сервера

### 1.1 Обновляем систему
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git
```

### 1.2 Устанавливаем Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 1.3 Устанавливаем Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

## Шаг 2: Развертывание приложения

### 2.1 Клонируем репозиторий
```bash
cd /home/your_user
git clone your_repo_url fastfood-service
cd fastfood-service
```

### 2.2 Создаем переменные окружения
```bash
# Копируем пример
cp backend/.env.example backend/.env

# Редактируем (используйте Ваши значения)
nano backend/.env
```

Важные переменные для продакшена:
```env
DB_PASSWORD=strong_password_here
JWT_SECRET=random_secret_key_min_32_chars
```

### 2.3 Запускаем приложение
```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f
```

Проверяем, что все контейнеры запущены:
```bash
docker ps
```

## Шаг 3: Настройка Nginx

### 3.1 Устанавливаем Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3.2 Создаем конфиг для приложения
```bash
sudo nano /etc/nginx/sites-available/fastfood
```

Вставляем:
```nginx
upstream fastfood_backend {
    server localhost:5000;
}

upstream fastfood_frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Фронтенд
    location / {
        proxy_pass http://fastfood_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://fastfood_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.3 Активируем конфиг
```bash
sudo ln -s /etc/nginx/sites-available/fastfood /etc/nginx/sites-enabled/fastfood
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Шаг 4: SSL сертификат (Let's Encrypt)

### 4.1 Устанавливаем Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Получаем сертификат
```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

### 4.3 Автоматическое обновление
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Шаг 5: Мониторинг

### 5.1 Проверяем статус приложения
```bash
docker-compose ps
docker-compose logs -f
```

### 5.2 Создаем скрипт мониторинга
```bash
cat > ~/check_services.sh << 'EOF'
#!/bin/bash

echo "=== Docker контейнеры ==="
docker-compose -f ~/fastfood-service/docker-compose.yml ps

echo "=== Проверка портов ==="
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend работает" || echo "❌ Frontend не работает"
curl -s http://localhost:5000/api/products > /dev/null && echo "✅ Backend работает" || echo "❌ Backend не работает"

echo "=== PostgreSQL ==="
docker-compose -f ~/fastfood-service/docker-compose.yml exec -T postgres pg_isready
EOF

chmod +x ~/check_services.sh
```

### 5.3 Cron job для мониторинга
```bash
crontab -e

# Добавляем строку для проверки каждый час
0 * * * * ~/check_services.sh >> ~/fastfood_status.log 2>&1
```

## Шаг 6: Резервные копии

### 6.1 Скрипт резервной копии БД
```bash
cat > ~/backup_db.sh << 'EOF'
#!/bin/bash

BACKUP_DIR=~/fastfood_backups
mkdir -p $BACKUP_DIR

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE=$BACKUP_DIR/fastfood_db_$DATE.sql

docker-compose -f ~/fastfood-service/docker-compose.yml exec -T postgres \
    pg_dump -U postgres fastfood_db > $BACKUP_FILE

gzip $BACKUP_FILE

echo "Backup создан: $BACKUP_FILE.gz"

# Удаляем старые резервные копии (старше 7 дней)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
EOF

chmod +x ~/backup_db.sh
```

### 6.2 Ежедневная резервная копия
```bash
crontab -e

# Добавляем строку
0 3 * * * ~/backup_db.sh >> ~/backup.log 2>&1
```

## Шаг 7: Обновление приложения

### 7.1 Получаем обновления
```bash
cd ~/fastfood-service
git pull origin main
```

### 7.2 Перестраиваем контейнеры
```bash
docker-compose down
docker-compose up -d --build
docker-compose logs -f
```

## Команды для управления

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Остановка/запуск
```bash
# Остановить все
docker-compose down

# Запустить все
docker-compose up -d

# Перезапустить
docker-compose restart
```

### Подключение к БД
```bash
docker-compose exec postgres psql -U postgres -d fastfood_db
```

### Восстановление из резервной копии
```bash
docker-compose exec -T postgres psql -U postgres fastfood_db < ~/fastfood_backups/fastfood_db_YYYYMMDD_HHMMSS.sql
```

## Troubleshooting

### Приложение не запускается
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Занят порт
```bash
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5000
sudo lsof -i :3000
```

### БД не работает
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Nginx возвращает 502
```bash
# Проверяем Docker контейнеры
docker-compose ps

# Проверяем логи backend
docker-compose logs backend

# Проверяем конфиг Nginx
sudo nginx -t
```

## Оптимизация

### 1. Кэширование статики
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 2. Сжатие
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
```

### 3. Лимит на размер тела запроса
```nginx
client_max_body_size 10M;
```

## Безопасность

### 1. Брандмауэр
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSH ключи (вместо пароля)
```bash
# На локальной машине
ssh-keygen -t rsa -b 4096

# Скопировать на сервер
ssh-copy-id -i ~/.ssh/id_rsa.pub user@vds_ip
```

### 3. Отключаем пароли в SSH
```bash
sudo nano /etc/ssh/sshd_config

# Измените:
PasswordAuthentication no

# Перезагружаем
sudo systemctl restart sshd
```

## Итоговая проверка

```bash
# Все должно быть OK
curl http://your_domain.com
curl http://your_domain.com/api/products
docker-compose ps
```

🎉 Поздравляем! Ваше приложение готово к работе!
