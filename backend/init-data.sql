-- Вставка примеров данных для тестирования

-- Категории
INSERT INTO categories (name, description) VALUES
('🍣 Суши', 'Свежие суши и роллы'),
('🌯 Шаурма', 'Вкусная горячая шаурма'),
('🥤 Напитки', 'Прохладительные напитки'),
('🍟 Закуски', 'Различные закуски и гарниры'),
('🍰 Десерты', 'Сладкие десерты и выпечка')
ON CONFLICT DO NOTHING;

-- Товары
INSERT INTO products (name, description, price, category_id, image_url, available) VALUES
-- Суши
('Калифорния', 'Ролл с крабом, авокадо и огурцом', 320.00, 1, 'https://via.placeholder.com/300x200?text=California', true),
('Филадельфия', 'Ролл с копченым лососем и сливочным сыром', 380.00, 1, 'https://via.placeholder.com/300x200?text=Philadelphia', true),
('Токио', 'Ролл с острым тунцом и зеленым луком', 350.00, 1, 'https://via.placeholder.com/300x200?text=Tokyo', true),
('Нигири с лососем', 'Два куска нигири с лососем', 280.00, 1, 'https://via.placeholder.com/300x200?text=Nigiri', true),

-- Шаурма
('Шаурма куриная', 'Мясо курицы, овощи, соус', 250.00, 2, 'https://via.placeholder.com/300x200?text=Chicken', true),
('Шаурма говяжья', 'Сочное говяжье мясо с зеленью', 320.00, 2, 'https://via.placeholder.com/300x200?text=Beef', true),
('Шаурма острая', 'Острая курица с соусом чили', 280.00, 2, 'https://via.placeholder.com/300x200?text=Spicy', true),
('Шаурма овощная', 'Для вегетарианцев - только овощи', 200.00, 2, 'https://via.placeholder.com/300x200?text=Veggie', true),

-- Напитки
('Coca-Cola 0.5л', 'Классическая Coca-Cola', 60.00, 3, 'https://via.placeholder.com/300x200?text=Coke', true),
('Апельсиновый сок', 'Свежевыжатый сок', 120.00, 3, 'https://via.placeholder.com/300x200?text=Orange', true),
('Лимонад', 'Холодный лимонад', 80.00, 3, 'https://via.placeholder.com/300x200?text=Lemonade', true),
('Вода', 'Чистая питьевая вода', 40.00, 3, 'https://via.placeholder.com/300x200?text=Water', true),

-- Закуски
('Картофель фри', 'Хрустящий картофель', 120.00, 4, 'https://via.placeholder.com/300x200?text=Fries', true),
('Крылья курицы', '6 штук в чесночном соусе', 280.00, 4, 'https://via.placeholder.com/300x200?text=Wings', true),
('Кольца кальмара', 'Хрустящие кольца в кляре', 250.00, 4, 'https://via.placeholder.com/300x200?text=Squid', true),

-- Десерты
('Блинчики с ягодами', 'Тонкие блинчики с клубникой', 180.00, 5, 'https://via.placeholder.com/300x200?text=Pancakes', true),
('Шоколадный торт', 'Слоистый шоколадный торт', 220.00, 5, 'https://via.placeholder.com/300x200?text=Cake', true),
('Мороженое', 'Ванильное мороженое', 100.00, 5, 'https://via.placeholder.com/300x200?text=Ice Cream', true)
ON CONFLICT DO NOTHING;
