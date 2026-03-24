import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/AuthContext'
import { getDashboardNav } from '../../data/navConfig'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { fetchMyProducts, createProduct, updateProduct, deleteProduct as deleteProductAPI, fetchCategories } from '../../services/dataService'
import FileUpload from '../../components/FileUpload'
import './Farmer.css'

export default function FarmerProducts() {
  const { user } = useAuth()
  const navItems = getDashboardNav('farmer')
  const [productsList, setProductsList] = useState([])
  const [categories, setCategories] = useState(['All'])

  useEffect(() => {
    fetchMyProducts().then(data => setProductsList(data))
    fetchCategories().then(data => { if (data.length > 0) setCategories(data.filter(c => c !== 'All')) })
  }, [])
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '', category: 'Vegetables', price: '', unit: '', stock: '', description: ''
  })
  const [imageUrls, setImageUrls] = useState([])

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editProduct) {
        const updated = await updateProduct(editProduct.id, {
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          quantity_available: Number(formData.stock),
        })
        setProductsList(prev => prev.map(p => p.id === editProduct.id ? updated : p))
      } else {
        const created = await createProduct({
          name: formData.name,
          category: formData.category.toLowerCase(),
          price: Number(formData.price),
          unit: formData.unit || 'basket',
          quantity_available: Number(formData.stock),
          description: formData.description,
          state: user?.state,
          image_url: imageUrls[0] || null,
          image_urls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        })
        setProductsList(prev => [created, ...prev])
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save product')
    }
    closeModal()
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      description: product.description || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditProduct(null)
    setFormData({ name: '', category: 'Vegetables', price: '', unit: '', stock: '', description: '' })
    setImageUrls([])
  }

  const handleDelete = async (id) => {
    try {
      await deleteProductAPI(id)
      setProductsList(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete product')
    }
  }

  return (
    <DashboardLayout navItems={navItems} title="My Products">
      <div className="page-toolbar">
        <div>
          <p className="text-muted">{productsList.length} products listed</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="products-grid-dashboard">
        {productsList.map(product => (
          <div key={product.id} className="card product-manage-card">
            <div className="product-manage-img">
              <img src={product.image} alt={product.name} />
              <span className="product-manage-category">{product.category}</span>
            </div>
            <div className="product-manage-body">
              <h4>{product.name}</h4>
              <p className="product-manage-price">{formatPrice(product.price)} / {product.unit}</p>
              <div className="product-manage-meta">
                <span>Stock: {product.stock}</span>
                <span>Rating: {product.rating}</span>
              </div>
              <div className="product-manage-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(product)}>
                  <Edit2 size={14} /> Edit
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(product.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required placeholder="e.g. Fresh Tomatoes" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <input type="text" name="unit" className="form-input" value={formData.unit} onChange={handleChange} required placeholder="e.g. basket, bag (50kg)" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (NGN)</label>
                  <input type="number" name="price" className="form-input" value={formData.price} onChange={handleChange} required placeholder="e.g. 5000" />
                </div>
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input type="number" name="stock" className="form-input" value={formData.stock} onChange={handleChange} required placeholder="e.g. 50" />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" className="form-input" rows="3" value={formData.description} onChange={handleChange} placeholder="Describe your product..." />
              </div>
              <div className="form-group">
                <label>Product Images</label>
                <FileUpload
                  onUpload={(urls) => setImageUrls(urls)}
                  multiple={true}
                  maxFiles={4}
                  accept="image"
                  label="Upload product photos"
                  existingUrls={editProduct?.image ? [editProduct.image] : []}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
