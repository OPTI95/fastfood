# 📡 API Documentation

## Base URL
```
http://localhost:5000/api (локально)
http://your_vds_ip:5000/api (на VDS)
```

## Аутентификация

### Регистрация админа
```http
POST /auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Ответ:**
```json
{
  "message": "Admin registered",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### Вход в систему
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "securepassword"
}
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

## Товары (публичный доступ)

### Получить все товары
```http
GET /products
```

**Ответ:**
```json
[
  {
    "id": 1,
    "name": "Калифорния",
    "description": "Ролл с крабом, авокадо и огурцом",
    "price": 320.00,
    "category_id": 1,
    "category_name": "🍣 Суши",
    "image_url": "https://...",
    "available": true,
    "created_at": "2024-03-27T10:00:00Z"
  }
]
```

### Получить товар по ID
```http
GET /products/1
```

### Получить категории
```http
GET /products/categories
```

## Заказы (публичный доступ)

### Создать заказ
```http
POST /orders
Content-Type: application/json

{
  "customerName": "Иван Петров",
  "customerPhone": "+79991234567",
  "items": [
    {
      "id": 1,
      "quantity": 2
    },
    {
      "id": 3,
      "quantity": 1
    }
  ]
}
```

**Ответ:**
```json
{
  "order": {
    "id": 1,
    "customer_name": "Иван Петров",
    "customer_phone": "+79991234567",
    "total_price": 640.00,
    "status": "pending",
    "items": "[{\"id\":1,\"quantity\":2},{\"id\":3,\"quantity\":1}]",
    "created_at": "2024-03-27T10:30:00Z"
  },
  "whatsappSent": true,
  "orderText": "📱 *Новый заказ от Иван Петров*\n\n☎️ Телефон: +79991234567\n\n*Товары:*\n• Калифорния x2 = 640.00 ₽\n\n*Итого: 640.00 ₽*"
}
```

### Получить все заказы
```http
GET /orders
```

### Обновить статус заказа
```http
PATCH /orders/1
Content-Type: application/json

{
  "status": "completed"
}
```

## Админ API (требуется авторизация)

**Заголовок для всех админ запросов:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Категории

#### Получить все категории
```http
GET /admin/categories
Authorization: Bearer {token}
```

#### Добавить категорию
```http
POST /admin/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "🍕 Пицца",
  "description": "Итальянская пицца"
}
```

#### Обновить категорию
```http
PUT /admin/categories/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "🍕 Пицца и паста",
  "description": "Итальянская кухня"
}
```

#### Удалить категорию
```http
DELETE /admin/categories/1
Authorization: Bearer {token}
```

### Товары (админ)

#### Получить все товары (админ)
```http
GET /admin/products
Authorization: Bearer {token}
```

#### Добавить товар
```http
POST /admin/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Маргарита",
  "description": "Классическая пицца",
  "price": 450.00,
  "categoryId": 6,
  "imageUrl": "https://..."
}
```

#### Обновить товар
```http
PUT /admin/products/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Калифорния (обновленная)",
  "description": "Ролл с крабом, авокадо и огурцом",
  "price": 350.00,
  "categoryId": 1,
  "imageUrl": "https://...",
  "available": true
}
```

#### Удалить товар
```http
DELETE /admin/products/1
Authorization: Bearer {token}
```

### Заказы (админ)

#### Получить все заказы
```http
GET /admin/orders
Authorization: Bearer {token}
```

**Ответ:**
```json
[
  {
    "id": 1,
    "customer_name": "Иван Петров",
    "customer_phone": "+79991234567",
    "total_price": 640.00,
    "status": "pending",
    "items": "[{\"id\":1,\"quantity\":2}]",
    "created_at": "2024-03-27T10:30:00Z"
  }
]
```

## Коды ошибок

| Код | Описание |
|-----|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

## Примеры на JavaScript

### Получить товары
```javascript
const products = await fetch('/api/products')
  .then(res => res.json());
```

### Создать заказ
```javascript
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'Иван',
    customerPhone: '+79991234567',
    items: [{ id: 1, quantity: 2 }]
  })
}).then(res => res.json());
```

### Добавить товар (админ)
```javascript
const token = localStorage.getItem('token');

const newProduct = await fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Новый товар',
    price: 300.00,
    categoryId: 1
  })
}).then(res => res.json());
```

## Rate Limiting

API не имеет лимитов на количество запросов, но при развертывании на продакшене рекомендуется добавить:

```javascript
// Пример с express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // лимит 100 запросов за период
});

app.use('/api/', limiter);
```

## WebSocket (будущие обновления)

Планируется добавить WebSocket для:
- Уведомления о новых заказах в реал-тайме
- Обновления статуса товаров
- Чат поддержки
