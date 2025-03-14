// Initialize data storage
let bills = JSON.parse(localStorage.getItem('bills')) || [];
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'User' };
let materialsList = [];

// DOM elements
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout');
const materialModal = document.getElementById('material-modal');
const viewBillModal = document.getElementById('view-bill-modal');
const viewSupplierModal = document.getElementById('view-supplier-modal');
const toast = document.getElementById('toast');
const billSearchInput = document.getElementById('bill-search');
const supplierSearchInput = document.getElementById('supplier-search');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', initializeDashboard);

function initializeDashboard() {
    setUserName();
    updateDashboardStats();
    loadRecentBills();
    loadRecentSuppliers();
    loadAllBills();
    loadAllSuppliers();
    setupEventListeners();
}

function setUserName() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    userName.textContent = `Welcome ${currentUser.name}`;
}

// Event listeners setup
function setupEventListeners() {
    setupNavigationMenu();
    setupMenuToggle();
    setupMaterialFormHandlers();
    setupFormSubmissions();
    setupSearchFunctionality();
    setupModalCloseHandlers();
    setupUserProfileClick();
}

function setupNavigationMenu() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (item.id === 'logout') {
                handleLogout();
                return;
            }
            handleNavigationItemClick(item);
        });
    });
}

function handleNavigationItemClick(item) {
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    const sectionToShow = item.getAttribute('data-section');
    showSection(sectionToShow);
}

function showSection(sectionToShow) {
    sections.forEach(section => {
        section.classList.add('hidden');
        if (section.id === `${sectionToShow}-section`) {
            section.classList.remove('hidden');
        }
    });
}

function setupMenuToggle() {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
}

function setupMaterialFormHandlers() {
    document.getElementById('add-material').addEventListener('click', openMaterialModal);
    document.getElementById('add-material-save').addEventListener('click', saveMaterial);
    document.getElementById('add-material-cancel').addEventListener('click', closeMaterialModal);
}

function setupFormSubmissions() {
    document.getElementById('add-bill-form').addEventListener('submit', handleAddBill);
    document.getElementById('add-supplier-form').addEventListener('submit', handleAddSupplier);
}

function setupSearchFunctionality() {
    billSearchInput.addEventListener('input', filterBills);
    supplierSearchInput.addEventListener('input', filterSuppliers);
}

function setupModalCloseHandlers() {
    document.querySelectorAll('.close, .modal-close').forEach(el => {
        el.addEventListener('click', closeAllModals);
    });
    window.addEventListener('click', (e) => {
        if (e.target === materialModal) closeMaterialModal();
        if (e.target === viewBillModal) closeViewBillModal();
        if (e.target === viewSupplierModal) closeViewSupplierModal();
    });
}

// Dashboard stats
function updateDashboardStats() {
    document.getElementById('total-bills').textContent = bills.length;
    const totalExpense = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
    document.getElementById('total-expense').textContent = `${totalExpense.toFixed(2)}`;
    document.getElementById('total-suppliers').textContent = suppliers.length;
}

// Recent bills loading
function loadRecentBills() {
    const recentBillsTable = document.getElementById('recent-bills-data');
    recentBillsTable.innerHTML = '';
    const recentBills = [...bills].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    if (recentBills.length === 0) {
        recentBillsTable.innerHTML = `<tr><td colspan="3" class="empty-message">No bills added yet</td></tr>`;
        return;
    }
    recentBills.forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.shopName}</td>
            <td>${formatDate(bill.date)}</td>
            <td>${parseFloat(bill.amount).toFixed(2)}</td>
        `;
        recentBillsTable.appendChild(row);
    });
}

// Recent suppliers loading
function loadRecentSuppliers() {
    const recentSuppliersTable = document.getElementById('recent-suppliers-data');
    recentSuppliersTable.innerHTML = '';
    const recentSuppliers = [...suppliers].sort((a, b) => b.id - a.id).slice(0, 5);
    if (recentSuppliers.length === 0) {
        recentSuppliersTable.innerHTML = `<tr><td colspan="3" class="empty-message">No suppliers added yet</td></tr>`;
        return;
    }
    recentSuppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.shop}</td>
            <td>${supplier.contact}</td>
        `;
        recentSuppliersTable.appendChild(row);
    });
}

// Load all bills
function loadAllBills() {
    const allBillsTable = document.getElementById('all-bills-data');
    allBillsTable.innerHTML = '';
    if (bills.length === 0) {
        allBillsTable.innerHTML = `<tr><td colspan="5" class="empty-message">No bills added yet</td></tr>`;
        return;
    }
    bills.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.shopName}</td>
            <td>${formatDate(bill.date)}</td>
            <td>${parseFloat(bill.amount).toFixed(2)}</td>
            <td>${bill.location}</td>
            <td>
                <button class="action-btn view-bill" data-id="${bill.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-bill" data-id="${bill.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-bill" data-id="${bill.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        allBillsTable.appendChild(row);
    });
    setupBillActionButtons();
}

function setupBillActionButtons() {
    document.querySelectorAll('.view-bill').forEach(btn => {
        btn.addEventListener('click', () => viewBillDetails(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.edit-bill').forEach(btn => {
        btn.addEventListener('click', () => editBill(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.delete-bill').forEach(btn => {
        btn.addEventListener('click', () => deleteBill(btn.getAttribute('data-id')));
    });
}

// Load all suppliers
function loadAllSuppliers() {
    const allSuppliersTable = document.getElementById('all-suppliers-data');
    allSuppliersTable.innerHTML = '';
    if (suppliers.length === 0) {
        allSuppliersTable.innerHTML = `<tr><td colspan="5" class="empty-message">No suppliers added yet</td></tr>`;
        return;
    }
    suppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.shop}</td>
            <td>${supplier.contact}</td>
            <td>${supplier.location}</td>
            <td>
                <button class="action-btn view-supplier" data-id="${supplier.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-supplier" data-id="${supplier.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-supplier" data-id="${supplier.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        allSuppliersTable.appendChild(row);
    });
    setupSupplierActionButtons();
}

function setupSupplierActionButtons() {
    document.querySelectorAll('.view-supplier').forEach(btn => {
        btn.addEventListener('click', () => viewSupplierDetails(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.edit-supplier').forEach(btn => {
        btn.addEventListener('click', () => editSupplier(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.delete-supplier').forEach(btn => {
        btn.addEventListener('click', () => deleteSupplier(btn.getAttribute('data-id')));
    });
}

// Material modal functions
function openMaterialModal() {
    materialModal.style.display = 'block';
    document.getElementById('material-form').reset();
}

function closeMaterialModal() {
    materialModal.style.display = 'none';
}

function saveMaterial() {
    const name = document.getElementById('material-name').value;
    const quantity = document.getElementById('material-quantity').value;
    const price = document.getElementById('material-price').value;
    if (!name || !quantity || !price) {
        showToast('Please fill all material fields', 'error');
        return;
    }
    const material = {
        id: Date.now(),
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        total: (parseInt(quantity) * parseFloat(price)).toFixed(2)
    };
    materialsList.push(material);
    renderMaterialsList();
    closeMaterialModal();
    showToast('Material added successfully');
}

function renderMaterialsList() {
    const materialsListEl = document.getElementById('materials-list');
    materialsListEl.innerHTML = '';
    if (materialsList.length === 0) {
        materialsListEl.innerHTML = '<p class="empty-message">No materials added yet</p>';
        return;
    }
    materialsList.forEach(material => {
        const materialItem = document.createElement('div');
        materialItem.className = 'material-item';
        materialItem.innerHTML = `
            <div class="material-details">
                <span class="material-name">${material.name}</span>
                <span class="material-info">
                     ${material.quantity} × ${parseFloat(material.price).toFixed(2)} = ${material.total}
                </span>
            </div>
            <button type="button" class="material-remove" data-id="${material.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        materialsListEl.appendChild(materialItem);
    });
    setupMaterialRemoveButtons();
}

function setupMaterialRemoveButtons() {
    document.querySelectorAll('.material-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const materialId = parseInt(btn.getAttribute('data-id'));
            materialsList = materialsList.filter(item => item.id !== materialId);
            renderMaterialsList();
        });
    });
}

// Bill form submission
function handleAddBill(e) {
    e.preventDefault();
    const shopName = document.getElementById('shop-name').value;
    const date = document.getElementById('bill-date').value;
    const amount = document.getElementById('bill-amount').value;
    const location = document.getElementById('shop-location').value;
    const imageInput = document.getElementById('bill-image');
    if (!shopName || !date || !amount || !location) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    let imageData = null;
    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            imageData = event.target.result;
            saveBill(shopName, date, amount, location, imageData);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveBill(shopName, date, amount, location, imageData);
    }
}

function saveBill(shopName, date, amount, location, imageData) {
    const newBill = {
        id: Date.now(),
        shopName,
        date,
        amount: parseFloat(amount).toFixed(2),
        location,
        materials: [...materialsList],
        image: imageData
    };
    bills.push(newBill);
    localStorage.setItem('bills', JSON.stringify(bills));
    resetBillForm();
    updateDashboardStats();
    loadRecentBills();
    loadAllBills();
    showToast('Bill saved successfully');
}

function resetBillForm() {
    document.getElementById('add-bill-form').reset();
    materialsList = [];
    renderMaterialsList();
}

// Supplier form submission
function handleAddSupplier(e) {
    e.preventDefault();
    const name = document.getElementById('supplier-name').value;
    const shop = document.getElementById('supplier-shop').value;
    const contact = document.getElementById('supplier-contact').value;
    const location = document.getElementById('supplier-location').value;
    if (!name || !shop || !contact || !location) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    const newSupplier = {
        id: Date.now(),
        name,
        shop,
        contact,
        location
    };
    suppliers.push(newSupplier);
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    resetSupplierForm();
    updateDashboardStats();
    loadRecentSuppliers();
    loadAllSuppliers();
    showToast('Supplier saved successfully');
}

function resetSupplierForm() {
    document.getElementById('add-supplier-form').reset();
}

// View bill details
function viewBillDetails(billId) {
    const bill = bills.find(b => b.id == billId);
    if (!bill) return;
    const modalContent = document.getElementById('bill-details-content');
    let materialsHtml = '';
    if (bill.materials && bill.materials.length > 0) {
        materialsHtml = `
            <h3>Material List</h3>
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Material</th>
                        <th>Quantity</th>
                        <th>Price per item</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${bill.materials.map(material => `
                        <tr>
                            <td>${material.name}</td>
                            <td>${material.quantity}</td>
                            <td>${parseFloat(material.price).toFixed(2)}</td>
                            <td>${material.total}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    let imageHtml = '';
    if (bill.image) {
        imageHtml = `
            <h3>Bill Image</h3>
            <div class="bill-image">
                <img src="${bill.image}" alt="Bill Image">
            </div>
        `;
    }
    modalContent.innerHTML = `
        <div class="details-group">
            <div class="details-item">
                <label>Shop Name:</label>
                <span>${bill.shopName}</span>
            </div>
            <div class="details-item">
                <label>Date:</label>
                <span>${formatDate(bill.date)}</span>
            </div>
            <div class="details-item">
                <label>Amount:</label>
                <span>${parseFloat(bill.amount).toFixed(2)}</span>
            </div>
            <div class="details-item">
                <label>Location:</label>
                <span>${bill.location}</span>
            </div>
        </div>
        ${materialsHtml}
        ${imageHtml}
    `;
    viewBillModal.style.display = 'block';
}

// View supplier details
function viewSupplierDetails(supplierId) {
    const supplier = suppliers.find(s => s.id == supplierId);
    if (!supplier) return;
    const modalContent = document.getElementById('supplier-details-content');
    const supplierBills = bills.filter(bill => bill.shopName.toLowerCase() === supplier.shop.toLowerCase());
    let billsHtml = '';
    if (supplierBills.length > 0) {
        const totalSpent = supplierBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0).toFixed(2);
        billsHtml = `
            <h3>Purchase History</h3>
            <div class="summary-item">
                <label>Total Spent:</label>
                <span>${totalSpent}</span>
            </div>
            <div class="summary-item">
                <label>Total Bills:</label>
                <span>${supplierBills.length}</span>
            </div>
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${supplierBills.map(bill => `
                        <tr>
                            <td>${formatDate(bill.date)}</td>
                            <td>${parseFloat(bill.amount).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        billsHtml = `<p class="empty-message">No purchase history with this supplier</p>`;
    }
    modalContent.innerHTML = `
        <div class="details-group">
            <div class="details-item">
                <label>Supplier Name:</label>
                <span>${supplier.name}</span>
            </div>
            <div class="details-item">
                <label>Shop Name:</label>
                <span>${supplier.shop}</span>
            </div>
            <div class="details-item">
                <label>Contact:</label>
                <span>${supplier.contact}</span>
            </div>
            <div class="details-item">
                <label>Location:</label>
                <span>${supplier.location}</span>
            </div>
        </div>
        ${billsHtml}
    `;
    viewSupplierModal.style.display = 'block';
}

// Edit bill
function editBill(billId) {
    const bill = bills.find(b => b.id == billId);
    if (!bill) return;
    showSection('add-bill');
    fillBillForm(bill);
    materialsList = [...(bill.materials || [])];
    renderMaterialsList();
    deleteBill(billId, false);
    showToast('You can now edit the bill');
}

function fillBillForm(bill) {
    document.getElementById('shop-name').value = bill.shopName;
    document.getElementById('bill-date').value = bill.date;
    document.getElementById('bill-amount').value = bill.amount;
    document.getElementById('shop-location').value = bill.location;
}

// Edit supplier
function editSupplier(supplierId) {
    const supplier = suppliers.find(s => s.id == supplierId);
    if (!supplier) return;
    showSection('add-supplier');
    fillSupplierForm(supplier);
    deleteSupplier(supplierId, false);
    showToast('You can now edit the supplier');
}

function fillSupplierForm(supplier) {
    document.getElementById('supplier-name').value = supplier.name;
    document.getElementById('supplier-shop').value = supplier.shop;
    document.getElementById('supplier-contact').value = supplier.contact;
    document.getElementById('supplier-location').value = supplier.location;
}

// Delete bill
function deleteBill(billId, showConfirmation = true) {
    if (showConfirmation && !confirm('Are you sure you want to delete this bill?')) {
        return;
    }
    bills = bills.filter(bill => bill.id != billId);
    localStorage.setItem('bills', JSON.stringify(bills));
    updateDashboardStats();
    loadRecentBills();
    loadAllBills();
    if (showConfirmation) {
        showToast('Bill deleted successfully');
    }
}

// Delete supplier
function deleteSupplier(supplierId, showConfirmation = true) {
    if (showConfirmation && !confirm('Are you sure you want to delete this supplier?')) {
        return;
    }
    suppliers = suppliers.filter(supplier => supplier.id != supplierId);
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    updateDashboardStats();
    loadRecentSuppliers();
    loadAllSuppliers();
    if (showConfirmation) {
        showToast('Supplier deleted successfully');
    }
}

// Search and filter functions
function filterBills() {
    const searchTerm = billSearchInput.value.toLowerCase();
    const allBillsTable = document.getElementById('all-bills-data');
    allBillsTable.innerHTML = '';
    const filteredBills = bills.filter(bill => 
        bill.shopName.toLowerCase().includes(searchTerm) ||
        bill.location.toLowerCase().includes(searchTerm)
    );
    if (filteredBills.length === 0) {
        allBillsTable.innerHTML = `<tr><td colspan="5" class="empty-message">No matching bills found</td></tr>`;
        return;
    }
    filteredBills.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(bill => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bill.shopName}</td>
            <td>${formatDate(bill.date)}</td>
            <td>${parseFloat(bill.amount).toFixed(2)}</td>
            <td>${bill.location}</td>
            <td>
                <button class="action-btn view-bill" data-id="${bill.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-bill" data-id="${bill.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-bill" data-id="${bill.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        allBillsTable.appendChild(row);
    });
    setupBillActionButtons();
}

function filterSuppliers() {
    const searchTerm = supplierSearchInput.value.toLowerCase();
    const allSuppliersTable = document.getElementById('all-suppliers-data');
    allSuppliersTable.innerHTML = '';
    const filteredSuppliers = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm) ||
        supplier.shop.toLowerCase().includes(searchTerm) ||
        supplier.contact.toLowerCase().includes(searchTerm) ||
        supplier.location.toLowerCase().includes(searchTerm)
    );
    if (filteredSuppliers.length === 0) {
        allSuppliersTable.innerHTML = `<tr><td colspan="5" class="empty-message">No matching suppliers found</td></tr>`;
        return;
    }
    filteredSuppliers.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.shop}</td>
            <td>${supplier.contact}</td>
            <td>${supplier.location}</td>
            <td>
                <button class="action-btn view-supplier" data-id="${supplier.id}"><i class="fas fa-eye"></i></button>
                <button class="action-btn edit-supplier" data-id="${supplier.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-supplier" data-id="${supplier.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        allSuppliersTable.appendChild(row);
    });
    setupSupplierActionButtons();
}

// Modal functions
function closeViewBillModal() {
    viewBillModal.style.display = 'none';
}

function closeViewSupplierModal() {
    viewSupplierModal.style.display = 'none';
}

function closeAllModals() {
    materialModal.style.display = 'none';
    viewBillModal.style.display = 'none';
    viewSupplierModal.style.display = 'none';
}

// Toast notification
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastIcon = document.querySelector('.toast-icon');
    const toastMessage = document.querySelector('.toast-message');
    toastMessage.textContent = message;
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle toast-icon';
        toastElement.className = 'toast toast-success';
    } else if (type === 'error') {
        toastIcon.className = 'fas fa-exclamation-circle toast-icon';
        toastElement.className = 'toast toast-error';
    }
    toastElement.classList.add('show');
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// User profile click handler
function setupUserProfileClick() {
    const userProfileIcon = document.querySelector('.user-info i.fa-user-circle');
    userProfileIcon.addEventListener('click', showUserProfileToast);
}

function showUserProfileToast() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        showToast('User information not found', 'error');
        return;
    }
    const toast = document.getElementById('toast');
    const toastContent = document.querySelector('.toast-content');
    toastContent.innerHTML = `
        <div class="toast-message">
          <div><strong>Name:</strong> ${currentUser.name}</div>
          <div><strong>Email:</strong> ${currentUser.email}</div>
          <div><strong>Phone:</strong> ${currentUser.phone}</div> <br>
          <button id="updatePasswordBtn" class="btn btn-sm btn-primary mt-2">Update Password</button>
        </div>
    `;
    toast.classList.add('show');
    document.getElementById('updatePasswordBtn').addEventListener('click', () => {
        toast.classList.remove('show');
        showPasswordUpdateDialog(currentUser);
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.style.width = '';
          toast.style.maxWidth = '';
          toast.style.left = '';
          toast.style.transform = '';
        }, 300);
    }, 10000);
}

// Function to show password update dialog
function showPasswordUpdateDialog(user) {
    const modalHTML = `
      <div id="passwordUpdateModal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h3>Update Password</h3>
          <form id="passwordUpdateForm">
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input type="password" id="currentPassword" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input type="password" id="newPassword" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input type="password" id="confirmPassword" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Update Password</button>
          </form>
        </div>
      </div>
    `;
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    const modal = document.getElementById('passwordUpdateModal');
    const closeBtn = modal.querySelector('.close');
    const form = document.getElementById('passwordUpdateForm');
    modal.style.display = 'block';
    closeBtn.onclick = () => {
      modal.style.display = 'none';
      document.body.removeChild(modalContainer);
    };
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.removeChild(modalContainer);
      }
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
      user.password = newPassword;
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      modal.style.display = 'none';
      document.body.removeChild(modalContainer);
      showToast('Password updated successfully', 'success');
    });
}