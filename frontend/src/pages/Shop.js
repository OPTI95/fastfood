import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Shop.css';

function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке товаров');
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !customerPhone || cart.length === 0) {
      setError('Заполните все поля и добавьте товары');
      return;
    }

    try {
      const orderItems = cart.map(item => ({ id: item.id, quantity: item.quantity }));
      const response = await axios.post('/api/orders', {
        customerName,
        customerPhone,
        items: orderItems
      });

      setOrderSent(true);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setShowCart(false);

      setTimeout(() => setOrderSent(false), 5000);
    } catch (err) {
      setError('Ошибка при отправке заказа: ' + err.message);
    }
  };

  if (loading) return <div className="container"><div className="loader">Загрузка...</div></div>;

  const groupedByCategory = {};
  products.forEach(product => {
    const category = product.category_name || 'Прочее';
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = [];
    }
    groupedByCategory[category].push(product);
  });

  return (
    <div className="shop-container">
      <div className="container">
        {orderSent && <div className="alert alert-success">✅ Заказ успешно отправлен! Проверьте WhatsApp</div>}
        {error && <div className="alert alert-error">❌ {error}</div>}

        {showCart ? (
          <div className="cart-view">
            <h2>🛒 Корзина</h2>
            {cart.length === 0 ? (
              <p>Корзина пуста</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p className="price">{item.price} ₽</p>
                      </div>
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} />
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <p className="total">{(item.price * item.quantity).toFixed(2)} ₽</p>
                      <button className="btn-danger" onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmitOrder} className="order-form">
                  <h3>Ваши данные</h3>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Номер телефона (+79...)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                  />
                  <div className="order-summary">
                    <h3>Итого: {getTotalPrice()} ₽</h3>
                  </div>
                  <button type="submit" className="btn-primary">📱 Отправить заказ в WhatsApp</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCart(false)}>Назад</button>
                </form>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="shop-header">
              <h1>🍔 FastFood - Быстрое питание</h1>
              <button className="btn-primary cart-btn" onClick={() => setShowCart(true)}>
                🛒 Корзина ({cart.length})
              </button>
            </div>

            {Object.entries(groupedByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="category">
                <h2>{category}</h2>
                <div className="products-grid">
                  {categoryProducts.map(product => (
                    <div key={product.id} className="product-card card">
                      {product.image_url && <img src={product.image_url} alt={product.name} />}
                      <h3>{product.name}</h3>
                      {product.description && <p>{product.description}</p>}
                      <p className="price">{product.price} ₽</p>
                      <button className="btn-primary" onClick={() => addToCart(product)}>
                        Добавить в корзину
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Shop;
