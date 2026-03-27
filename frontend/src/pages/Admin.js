import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [uploading, setUploading] = useState(false);

  const API = axios.create({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await API.post('/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProductForm(prev => ({ ...prev, imageUrl: res.data.url }));
      setSuccess('✅ Фото загружено');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        API.get('/api/admin/products'),
        API.get('/api/admin/categories'),
        API.get('/api/admin/orders')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setOrders(ordersRes.data);
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки данных');
      setLoading(false);
    }
  };

  // ===== ТОВАРЫ =====

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/api/admin/products', {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        categoryId: parseInt(productForm.categoryId),
        imageUrl: productForm.imageUrl
      });
      setProducts([...products, response.data]);
      setProductForm({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
      setSuccess('✅ Товар добавлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при добавлении товара');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/api/admin/products/${editingProduct.id}`, {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        categoryId: parseInt(productForm.categoryId),
        imageUrl: productForm.imageUrl,
        available: productForm.available !== false
      });
      setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
      setSuccess('✅ Товар обновлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при обновлении товара');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Вы уверены?')) return;
    try {
      await API.delete(`/api/admin/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      setSuccess('✅ Товар удален');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при удалении товара');
    }
  };

  // ===== КАТЕГОРИИ =====

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/api/admin/categories', categoryForm);
      setCategories([...categories, response.data]);
      setCategoryForm({ name: '', description: '' });
      setSuccess('✅ Категория добавлена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при добавлении категории');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await API.put(`/api/admin/categories/${editingCategory.id}`, categoryForm);
      setCategories(categories.map(c => c.id === editingCategory.id ? response.data : c));
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '' });
      setSuccess('✅ Категория обновлена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при обновлении категории');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Вы уверены?')) return;
    try {
      await API.delete(`/api/admin/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      setSuccess('✅ Категория удалена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Ошибка при удалении категории');
    }
  };

  if (loading) return <div className="container"><div className="loader">Загрузка...</div></div>;

  return (
    <div className="admin-container">
      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Товары
          </button>
          <button
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Категории
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Заказы
          </button>
        </div>

        {/* ТОВАРЫ */}
        {activeTab === 'products' && (
          <div className="tab-content">
            <h2>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</h2>
            <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="form">
              <input
                type="text"
                placeholder="Название товара"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Описание"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Цена"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                step="0.01"
                required
              />
              <select
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="image-upload-group">
                <input
                  type="text"
                  placeholder="URL изображения (или загрузите файл ниже)"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                />
                <label className="upload-label">
                  {uploading ? 'Загрузка…' : '📎 Загрузить фото'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
                {productForm.imageUrl && (
                  <img src={productForm.imageUrl} alt="preview" className="image-preview" />
                )}
              </div>
              <button type="submit" className="btn-primary">
                {editingProduct ? 'Обновить товар' : 'Добавить товар'}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: '', categoryId: '', imageUrl: '' });
                  }}
                >
                  Отмена
                </button>
              )}
            </form>

            <h3>Список товаров ({products.length})</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Категория</th>
                    <th>Цена</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category_name || 'N/A'}</td>
                      <td>{product.price} ₽</td>
                      <td className="actions">
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setEditingProduct(product);
                            setProductForm({
                              name: product.name,
                              description: product.description,
                              price: product.price,
                              categoryId: product.category_id,
                              imageUrl: product.image_url
                            });
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* КАТЕГОРИИ */}
        {activeTab === 'categories' && (
          <div className="tab-content">
            <h2>{editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}</h2>
            <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory} className="form">
              <input
                type="text"
                placeholder="Название категории"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Описание"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              />
              <button type="submit" className="btn-primary">
                {editingCategory ? 'Обновить категорию' : 'Добавить категорию'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '' });
                  }}
                >
                  Отмена
                </button>
              )}
            </form>

            <h3>Список категорий ({categories.length})</h3>
            <div className="categories-grid">
              {categories.map(category => (
                <div key={category.id} className="category-card card">
                  <h4>{category.name}</h4>
                  {category.description && <p>{category.description}</p>}
                  <div className="card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryForm({ name: category.name, description: category.description });
                      }}
                    >
                      Изменить
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ЗАКАЗЫ */}
        {activeTab === 'orders' && (
          <div className="tab-content">
            <h2>Заказы ({orders.length})</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_phone}</td>
                      <td>{order.total_price} ₽</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status === 'pending' ? '⏳ Новый' : '✅ Готов'}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
