import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Shop.css';

const WA_NUMBER = process.env.REACT_APP_WHATSAPP || '79991234567';

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const EmptyPlate = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.3}}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12h8M12 8v8"/>
  </svg>
);

function Shop({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const categoryRefs = useRef({});

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [cartOpen]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.error || err.message;
      console.error('❌ Ошибка:', { status, detail, err });
      setError(`Ошибка при загрузке товаров [${status || 'сеть'}]: ${detail}`);
      setLoading(false);
    }
  };

  // Cart helpers
  const getQty = (id) => cart.find(i => i.id === id)?.quantity || 0;

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeOne = (id) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === id);
      if (!ex) return prev;
      if (ex.quantity <= 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(0);

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    let text = '🛒 *Заказ:*\n\n';
    cart.forEach(item => {
      text += `• ${item.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ₽\n`;
    });
    text += `\n*Итого: ${totalPrice} ₽*`;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    categoryRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loader">
          <div className="loader-spinner" />
          Загрузка…
        </div>
      </div>
    );
  }

  const grouped = {};
  products.forEach(p => {
    const cat = p.category_name || 'Прочее';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  });
  const categories = Object.keys(grouped);

  return (
    <>
      {/* ── Cart drawer ── */}
      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)} />
          <div className="cart-drawer">
            <div className="cart-drawer-head">
              <h2>
                Корзина
                {totalItems > 0 && <div className="cart-badge">{totalItems}</div>}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {cart.length > 0 && (
                  <button className="clear-btn" onClick={() => setCart([])}>Очистить</button>
                )}
                <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty-drawer">
                <CartIcon />
                <p>Корзина пуста</p>
              </div>
            ) : (
              <>
                <div className="cart-drawer-body">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        <p className="item-price">{item.price} ₽</p>
                      </div>
                      <div className="quantity-control">
                        <button onClick={() => removeOne(item.id)}>−</button>
                        <span className="qty-display">{item.quantity}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </div>
                      <p className="item-total">{(item.price * item.quantity).toFixed(0)} ₽</p>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  ))}
                </div>

                <div className="cart-drawer-foot">
                  <div className="order-total-row">
                    <span>Итого</span>
                    <strong>{totalPrice} ₽</strong>
                  </div>
                  <button className="btn-primary wa-btn" onClick={handleWhatsAppOrder}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Заказать через WhatsApp
                  </button>
                  <button className="btn-secondary" onClick={() => setCartOpen(false)}>
                    Продолжить покупки
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Floating cart bar ── */}
      {totalItems > 0 && !cartOpen && (
        <div className="cart-float" onClick={() => setCartOpen(true)}>
          <div className="cart-float-left">
            <div className="cart-float-badge">{totalItems}</div>
            <span>Корзина</span>
          </div>
          <div className="cart-float-right">
            <span>{totalPrice} ₽</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className="container">
        {error && <div className="alert alert-error">⚠ {error}</div>}

        {/* Statement header */}
        <div className="shop-statement">
          <div className="shop-statement-left">
            <h1>Меню</h1>
          </div>
          <div className="shop-statement-meta">
            <p>Доставка · Самовывоз</p>
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              <CartIcon />
              {totalItems > 0
                ? <><div className="cart-badge">{totalItems}</div>{totalPrice} ₽</>
                : 'Корзина'
              }
            </button>
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                className={`tab-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => scrollToCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products */}
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><EmptyPlate /></div>
            <h3>Меню пустое</h3>
            <p>Товары ещё не добавлены</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="category" ref={el => categoryRefs.current[cat] = el}>
              <div className="category-label">
                <h2>{cat}</h2>
                <span className="category-count">{grouped[cat].length} поз.</span>
                <div className="category-rule" />
              </div>

              <div className="products-grid">
                {grouped[cat].map(product => {
                  const qty = getQty(product.id);
                  return (
                    <div key={product.id} className="product-card card">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="product-card-img"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="product-card-img-placeholder">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.2}}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                        </div>
                      )}
                      <div className="product-card-body">
                        <h3>{product.name}</h3>
                        {product.description && (
                          <p className="product-card-desc">{product.description}</p>
                        )}
                        <div className="product-card-footer">
                          <p className="price">{product.price}<span className="price-currency"> ₽</span></p>
                          {qty === 0 ? (
                            <button className="add-btn" onClick={() => addToCart(product)}>+</button>
                          ) : (
                            <div className="card-stepper">
                              <button onClick={() => removeOne(product.id)}>−</button>
                              <span>{qty}</span>
                              <button onClick={() => addToCart(product)}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Bottom padding so floating bar doesn't overlap last card */}
        {totalItems > 0 && <div style={{ height: 80 }} />}
      </div>
    </>
  );
}

export default Shop;
