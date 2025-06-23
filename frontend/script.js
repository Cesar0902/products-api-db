// Configuración de la API
const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINTS = {
    products: `${API_BASE_URL}/productos`,
    available: `${API_BASE_URL}/productos/disponibles`
};

// Estado global de la aplicación
let products = [];
let filteredProducts = [];
let currentEditingProduct = null;

// Elementos del DOM
const elements = {
    // Botones principales
    addProductBtn: document.getElementById('addProductBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    
    // Filtros
    filterAvailable: document.getElementById('filterAvailable'),
    searchInput: document.getElementById('searchInput'),
    
    // Estadísticas
    totalProducts: document.getElementById('totalProducts'),
    availableProducts: document.getElementById('availableProducts'),
    unavailableProducts: document.getElementById('unavailableProducts'),
    
    // Loading y mensajes
    loading: document.getElementById('loading'),
    messageContainer: document.getElementById('messageContainer'),
    
    // Grid de productos
    productsGrid: document.getElementById('productsGrid'),
    emptyState: document.getElementById('emptyState'),
    
    // Modal de producto
    productModal: document.getElementById('productModal'),
    modalTitle: document.getElementById('modalTitle'),
    productForm: document.getElementById('productForm'),
    closeModal: document.getElementById('closeModal'),
    cancelBtn: document.getElementById('cancelBtn'),
    saveBtn: document.getElementById('saveBtn'),
    
    // Campos del formulario
    productName: document.getElementById('productName'),
    productPrice: document.getElementById('productPrice'),
    productCategory: document.getElementById('productCategory'),
    productDescription: document.getElementById('productDescription'),
    productAvailable: document.getElementById('productAvailable'),
    
    // Errores del formulario
    nameError: document.getElementById('nameError'),
    priceError: document.getElementById('priceError'),
    descriptionError: document.getElementById('descriptionError'),
    
    // Modal de eliminación
    deleteModal: document.getElementById('deleteModal'),
    closeDeleteModal: document.getElementById('closeDeleteModal'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
    deleteProductName: document.getElementById('deleteProductName')
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadProducts();
});

// Event Listeners
function initializeEventListeners() {
    // Botones principales
    elements.addProductBtn.addEventListener('click', openCreateModal);
    elements.refreshBtn.addEventListener('click', loadProducts);
    
    // Filtros
    elements.filterAvailable.addEventListener('change', applyFilters);
    elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
    
    // Modal de producto
    elements.closeModal.addEventListener('click', closeProductModal);
    elements.cancelBtn.addEventListener('click', closeProductModal);
    elements.productForm.addEventListener('submit', handleFormSubmit);
    
    // Modal de eliminación
    elements.closeDeleteModal.addEventListener('click', closeDeleteModal);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    // Cerrar modales al hacer clic fuera
    elements.productModal.addEventListener('click', (e) => {
        if (e.target === elements.productModal) closeProductModal();
    });
    
    elements.deleteModal.addEventListener('click', (e) => {
        if (e.target === elements.deleteModal) closeDeleteModal();
    });
    
    // Validación en tiempo real
    elements.productName.addEventListener('input', validateName);
    elements.productPrice.addEventListener('input', validatePrice);
    elements.productDescription.addEventListener('input', validateDescription);
}

// Funciones de API
async function apiRequest(url, options = {}) {
    try {
        showLoading(true);
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `Error ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function loadProducts() {
    try {
        const response = await apiRequest(API_ENDPOINTS.products);
        products = response.data || [];
        filteredProducts = [...products];
        renderProducts();
        updateStats();
        clearMessages();
        
        if (products.length === 0) {
            showMessage('No hay productos registrados', 'warning');
        }
    } catch (error) {
        showMessage(`Error al cargar productos: ${error.message}`, 'error');
        products = [];
        filteredProducts = [];
        renderProducts();
        updateStats();
    }
}

async function createProduct(productData) {
    try {
        const response = await apiRequest(API_ENDPOINTS.products, {
            method: 'POST',
            body: JSON.stringify(productData)
        });
        
        if (response.success) {
            showMessage(response.message, 'success');
            loadProducts();
            closeProductModal();
        } else {
            handleFormErrors(response.errors);
        }
    } catch (error) {
        showMessage(`Error al crear producto: ${error.message}`, 'error');
    }
}

async function updateProduct(id, productData) {
    try {
        const response = await apiRequest(`${API_ENDPOINTS.products}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(productData)
        });
        
        if (response.success) {
            showMessage(response.message, 'success');
            loadProducts();
            closeProductModal();
        } else {
            handleFormErrors(response.errors);
        }
    } catch (error) {
        showMessage(`Error al actualizar producto: ${error.message}`, 'error');
    }
}

async function deleteProduct(id) {
    try {
        const response = await apiRequest(`${API_ENDPOINTS.products}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            showMessage(response.message, 'success');
            loadProducts();
        }
    } catch (error) {
        showMessage(`Error al eliminar producto: ${error.message}`, 'error');
    }
}

// Funciones de UI
function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
}

function showMessage(message, type = 'info') {
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    
    const icon = getMessageIcon(type);
    messageElement.innerHTML = `<i class="${icon}"></i> ${message}`;
    
    elements.messageContainer.appendChild(messageElement);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 5000);
}

function getMessageIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function clearMessages() {
    elements.messageContainer.innerHTML = '';
}

function renderProducts() {
    elements.productsGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.productsGrid.classList.add('hidden');
        return;
    }
    
    elements.emptyState.classList.add('hidden');
    elements.productsGrid.classList.remove('hidden');
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        elements.productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const formattedPrice = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(product.precio);
    
    const formattedDate = new Date(product.fecha_ingreso).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="product-header">
            <h3 class="product-name">${escapeHtml(product.nombre)}</h3>
            <span class="product-status ${product.disponible ? 'status-available' : 'status-unavailable'}">
                ${product.disponible ? 'Disponible' : 'No disponible'}
            </span>
        </div>
        
        <div class="product-price">${formattedPrice}</div>
        
        ${product.categoria ? `<div class="product-category">${escapeHtml(product.categoria)}</div>` : ''}
        
        <div class="product-description">${escapeHtml(product.descripcion)}</div>
        
        <div class="product-date">
            <i class="fas fa-calendar-alt"></i> Ingresado: ${formattedDate}
        </div>
        
        <div class="product-actions">
            <button class="btn btn-warning" onclick="openEditModal(${product.id})">
                <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn btn-danger" onclick="openDeleteModal(${product.id}, '${escapeHtml(product.nombre)}')">
                <i class="fas fa-trash"></i> Eliminar
            </button>
        </div>
    `;
    
    return card;
}

function updateStats() {
    const total = products.length;
    const available = products.filter(p => p.disponible).length;
    const unavailable = total - available;
    
    elements.totalProducts.textContent = total;
    elements.availableProducts.textContent = available;
    elements.unavailableProducts.textContent = unavailable;
}

function applyFilters() {
    const availableFilter = elements.filterAvailable.value;
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    
    filteredProducts = products.filter(product => {
        // Filtro por disponibilidad
        if (availableFilter !== '') {
            const isAvailable = availableFilter === 'true';
            if (product.disponible !== isAvailable) return false;
        }
        
        // Filtro por búsqueda
        if (searchTerm) {
            const searchFields = [
                product.nombre,
                product.descripcion,
                product.categoria || ''
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchTerm)) return false;
        }
        
        return true;
    });
    
    renderProducts();
}

// Funciones de Modal
function openCreateModal() {
    currentEditingProduct = null;
    elements.modalTitle.textContent = 'Nuevo Producto';
    elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Crear Producto';
    resetForm();
    elements.productModal.classList.remove('hidden');
    elements.productName.focus();
}

function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentEditingProduct = product;
    elements.modalTitle.textContent = 'Editar Producto';
    elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Producto';
    
    fillForm(product);
    elements.productModal.classList.remove('hidden');
    elements.productName.focus();
}

function closeProductModal() {
    elements.productModal.classList.add('hidden');
    resetForm();
    currentEditingProduct = null;
}

function openDeleteModal(productId, productName) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    elements.deleteProductName.textContent = productName;
    elements.confirmDeleteBtn.dataset.productId = productId;
    elements.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    elements.deleteModal.classList.add('hidden');
    elements.confirmDeleteBtn.dataset.productId = '';
}

// Funciones de Formulario
function resetForm() {
    elements.productForm.reset();
    clearFormErrors();
    elements.productAvailable.checked = true;
}

function fillForm(product) {
    elements.productName.value = product.nombre;
    elements.productPrice.value = product.precio;
    elements.productCategory.value = product.categoria || '';
    elements.productDescription.value = product.descripcion;
    elements.productAvailable.checked = product.disponible;
    clearFormErrors();
}

function clearFormErrors() {
    elements.nameError.style.display = 'none';
    elements.priceError.style.display = 'none';
    elements.descriptionError.style.display = 'none';
    
    elements.productName.style.borderColor = '';
    elements.productPrice.style.borderColor = '';
    elements.productDescription.style.borderColor = '';
}

function handleFormErrors(errors) {
    clearFormErrors();
    
    if (!errors) return;
    
    errors.forEach(error => {
        const field = error.field;
        const message = error.message;
        
        switch (field) {
            case 'nombre':
                elements.nameError.textContent = message;
                elements.nameError.style.display = 'block';
                elements.productName.style.borderColor = 'var(--danger-color)';
                break;
            case 'precio':
                elements.priceError.textContent = message;
                elements.priceError.style.display = 'block';
                elements.productPrice.style.borderColor = 'var(--danger-color)';
                break;
            case 'descripcion':
                elements.descriptionError.textContent = message;
                elements.descriptionError.style.display = 'block';
                elements.productDescription.style.borderColor = 'var(--danger-color)';
                break;
        }
    });
}

// Validación en tiempo real
function validateName() {
    const value = elements.productName.value.trim();
    if (value.length === 0) {
        elements.nameError.textContent = 'El nombre es requerido';
        elements.nameError.style.display = 'block';
        elements.productName.style.borderColor = 'var(--danger-color)';
    } else {
        elements.nameError.style.display = 'none';
        elements.productName.style.borderColor = '';
    }
}

function validatePrice() {
    const value = parseFloat(elements.productPrice.value);
    if (isNaN(value) || value <= 0) {
        elements.priceError.textContent = 'El precio debe ser mayor a cero';
        elements.priceError.style.display = 'block';
        elements.productPrice.style.borderColor = 'var(--danger-color)';
    } else {
        elements.priceError.style.display = 'none';
        elements.productPrice.style.borderColor = '';
    }
}

function validateDescription() {
    const value = elements.productDescription.value.trim();
    if (value.length < 10) {
        elements.descriptionError.textContent = 'La descripción debe tener mínimo 10 caracteres';
        elements.descriptionError.style.display = 'block';
        elements.productDescription.style.borderColor = 'var(--danger-color)';
    } else {
        elements.descriptionError.style.display = 'none';
        elements.productDescription.style.borderColor = '';
    }
}

// Event Handlers
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(elements.productForm);
    const productData = {
        nombre: formData.get('nombre').trim(),
        precio: parseFloat(formData.get('precio')),
        categoria: formData.get('categoria').trim(),
        descripcion: formData.get('descripcion').trim(),
        disponible: formData.has('disponible')
    };
    
    // Validación básica del lado del cliente
    if (!productData.nombre) {
        showMessage('El nombre del producto es requerido', 'error');
        return;
    }
    
    if (isNaN(productData.precio) || productData.precio <= 0) {
        showMessage('El precio debe ser un número mayor a cero', 'error');
        return;
    }
    
    if (productData.descripcion.length < 10) {
        showMessage('La descripción debe tener mínimo 10 caracteres', 'error');
        return;
    }
    
    // Enviar datos
    if (currentEditingProduct) {
        updateProduct(currentEditingProduct.id, productData);
    } else {
        createProduct(productData);
    }
}

function handleDeleteConfirm() {
    const productId = elements.confirmDeleteBtn.dataset.productId;
    if (productId) {
        deleteProduct(parseInt(productId));
        closeDeleteModal();
    }
}

// Funciones utilitarias
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funciones globales para los event handlers inline
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;