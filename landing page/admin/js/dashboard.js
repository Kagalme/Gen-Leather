/**
 * GenLeather Admin Dashboard JavaScript
 * Handles all dashboard interactions and data management
 */

// ============================================================
// Initialization
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  loadAllData();
  initializeForms();
  initializeImageUploads();
  initializeReset();
  initializeModals();
});

// ============================================================
// Navigation
// ============================================================
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sectionTitle = document.getElementById('sectionTitle');
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  
  const titles = {
    dashboard: 'Dashboard',
    hero: 'Hero Section',
    kategori: 'Kategori',
    koleksi: 'Koleksi Produk',
    cerita: 'Cerita / About',
    ulasan: 'Ulasan',
    cta: 'CTA Section',
    footer: 'Footer'
  };
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const section = this.dataset.section;
      
      // Update active nav
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      // Update section title
      sectionTitle.textContent = titles[section] || 'Dashboard';
      
      // Show section
      document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active');
      });
      document.getElementById(`section-${section}`).classList.add('active');
      
      // Close mobile menu
      sidebar.classList.remove('mobile-open');
    });
  });
  
  // Mobile menu toggle
  menuToggle.addEventListener('click', function() {
    sidebar.classList.toggle('mobile-open');
  });
}

// ============================================================
// Load Data
// ============================================================
function loadAllData() {
  const data = ContentManager.getAll();
  
  // Load Hero
  loadHero(data.hero);
  
  // Load Kategori
  loadKategori(data.kategori);
  
  // Load Koleksi
  loadKoleksi(data.koleksi);
  
  // Load Cerita
  loadCerita(data.cerita);
  
  // Load Ulasan
  loadUlasan(data.ulasan);
  
  // Load CTA
  loadCta(data.cta);
  
  // Load Footer
  loadFooter(data.footer);
  
  // Update dashboard stats
  updateDashboardStats(data);
}

function updateDashboardStats(data) {
  document.getElementById('statProducts').textContent = data.koleksi.products.length;
  document.getElementById('statKategori').textContent = data.kategori.items.length;
  document.getElementById('statUlasan').textContent = data.ulasan.testimonials.length;
}

// ============================================================
// Hero Section
// ============================================================
function loadHero(hero) {
  document.getElementById('heroEnabled').checked = hero.enabled;
  document.getElementById('heroLabel').value = hero.label || '';
  document.getElementById('heroTitle').value = hero.title || '';
  document.getElementById('heroDesc').value = hero.description || '';
  document.getElementById('heroBadge').value = hero.badgeText || '';
  document.getElementById('heroBtn1Text').value = hero.buttonPrimaryText || '';
  document.getElementById('heroBtn1Link').value = hero.buttonPrimaryLink || '';
  document.getElementById('heroBtn2Text').value = hero.buttonSecondaryText || '';
  document.getElementById('heroBtn2Link').value = hero.buttonSecondaryLink || '';
  
  // Preview images
  if (hero.image) {
    showImagePreview('heroMainPreview', hero.image);
  }
  if (hero.secondaryImage) {
    showImagePreview('heroSecPreview', hero.secondaryImage);
  }
  
  // Stats
  renderHeroStats(hero.stats || []);
}

function renderHeroStats(stats) {
  const container = document.getElementById('heroStats');
  container.innerHTML = stats.map((stat, index) => `
    <div class="form-grid" style="margin-bottom: 1rem;">
      <div class="form-group">
        <label>Angka</label>
        <input type="text" id="heroStat${index}Num" value="${stat.number || ''}" placeholder="12">
      </div>
      <div class="form-group">
        <label>Suffix (opsional)</label>
        <input type="text" id="heroStat${index}Suffix" value='${stat.suffix || ''}' placeholder="<sup>+</sup> atau %">
      </div>
      <div class="form-group">
        <label>Label</label>
        <input type="text" id="heroStat${index}Label" value="${stat.label || ''}" placeholder="Tahun Pengalaman">
      </div>
    </div>
  `).join('');
}

function saveHero(e) {
  e.preventDefault();
  
  const stats = [];
  const statCount = 3; // Default 3 stats
  for (let i = 0; i < statCount; i++) {
    stats.push({
      number: document.getElementById(`heroStat${i}Num`)?.value || '',
      suffix: document.getElementById(`heroStat${i}Suffix`)?.value || '',
      label: document.getElementById(`heroStat${i}Label`)?.value || ''
    });
  }
  
  const heroData = {
    enabled: document.getElementById('heroEnabled').checked,
    label: document.getElementById('heroLabel').value,
    title: document.getElementById('heroTitle').value,
    description: document.getElementById('heroDesc').value,
    badgeText: document.getElementById('heroBadge').value,
    buttonPrimaryText: document.getElementById('heroBtn1Text').value,
    buttonPrimaryLink: document.getElementById('heroBtn1Link').value,
    buttonSecondaryText: document.getElementById('heroBtn2Text').value,
    buttonSecondaryLink: document.getElementById('heroBtn2Link').value,
    image: getImagePreviewSrc('heroMainPreview') || './asset/d1.png',
    secondaryImage: getImagePreviewSrc('heroSecPreview') || './asset/jam sc1.png',
    stats: stats
  };
  
  ContentManager.updateSection('hero', heroData);
  showToast('Hero section berhasil disimpan!', 'success');
}

// ============================================================
// Kategori Section
// ============================================================
function loadKategori(kategori) {
  document.getElementById('kategoriLabel').value = kategori.label || '';
  document.getElementById('kategoriTitle').value = kategori.title || '';
  
  const list = document.getElementById('kategoriList');
  list.innerHTML = kategori.items.map(item => `
    <div class="collection-item">
      <div class="collection-item__image">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='./asset/placeholder.png'">
      </div>
      <div class="collection-item__info">
        <p class="collection-item__name">${item.name}</p>
        <p class="collection-item__category">ID: ${item.id}</p>
      </div>
      <div class="collection-item__actions">
        <button class="delete-btn" onclick="deleteKategori(${item.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

function saveKategori(e) {
  e.preventDefault();
  
  const kategoriData = {
    label: document.getElementById('kategoriLabel').value,
    title: document.getElementById('kategoriTitle').value
  };
  
  ContentManager.updateSection('kategori', kategoriData);
  showToast('Kategori berhasil disimpan!', 'success');
}

function saveNewKategori() {
  const name = document.getElementById('newKategoriName').value;
  const image = document.getElementById('newKategoriImage').value || './asset/placeholder.png';
  
  if (!name) {
    showToast('Nama kategori harus diisi!', 'error');
    return;
  }
  
  ContentManager.addCategory({ name, image });
  ContentManager.getAll(); // Refresh
  loadKategori(ContentManager.getAll().kategori);
  updateDashboardStats(ContentManager.getAll());
  closeModal('kategoriModal');
  
  // Reset form
  document.getElementById('newKategoriName').value = '';
  document.getElementById('newKategoriImage').value = '';
  
  showToast('Kategori berhasil ditambahkan!', 'success');
}

function deleteKategori(id) {
  if (confirm('Yakin ingin menghapus kategori ini?')) {
    ContentManager.deleteCategory(id);
    loadKategori(ContentManager.getAll().kategori);
    updateDashboardStats(ContentManager.getAll());
    showToast('Kategori berhasil dihapus!', 'success');
  }
}

// ============================================================
// Koleksi Section
// ============================================================
function loadKoleksi(koleksi) {
  document.getElementById('koleksiLabel').value = koleksi.label || '';
  document.getElementById('koleksiTitle').value = koleksi.title || '';
  
  const list = document.getElementById('produkList');
  list.innerHTML = koleksi.products.map(product => `
    <div class="collection-item">
      <div class="collection-item__image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='./asset/placeholder.png'">
      </div>
      <div class="collection-item__info">
        <p class="collection-item__name">${product.name}</p>
        <p class="collection-item__category">${product.category}</p>
      </div>
      <div class="collection-item__actions">
        <button class="edit-btn" onclick="editProduk(${product.id})">Edit</button>
        <button class="delete-btn" onclick="deleteProduk(${product.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

function saveKoleksi(e) {
  e.preventDefault();
  
  const koleksiData = {
    label: document.getElementById('koleksiLabel').value,
    title: document.getElementById('koleksiTitle').value
  };
  
  ContentManager.updateSection('koleksi', koleksiData);
  showToast('Koleksi berhasil disimpan!', 'success');
}

function saveNewProduk() {
  const name = document.getElementById('newProdukName').value;
  const category = document.getElementById('newProdukCategory').value;
  const image = document.getElementById('newProdukImage').value || './asset/placeholder.png';
  const editId = document.getElementById('editProdukId').value;
  
  if (!name) {
    showToast('Nama produk harus diisi!', 'error');
    return;
  }
  
  if (editId) {
    // Update existing
    ContentManager.updateProduct(parseInt(editId), { name, category, image });
    document.getElementById('editProdukId').value = '';
    document.getElementById('produkModalTitle').textContent = 'Tambah Produk';
    showToast('Produk berhasil diupdate!', 'success');
  } else {
    // Add new
    ContentManager.addProduct({ name, category, image });
    showToast('Produk berhasil ditambahkan!', 'success');
  }
  
  loadKoleksi(ContentManager.getAll().koleksi);
  updateDashboardStats(ContentManager.getAll());
  closeModal('produkModal');
  
  // Reset form
  document.getElementById('newProdukName').value = '';
  document.getElementById('newProdukCategory').value = '';
  document.getElementById('newProdukImage').value = '';
}

function editProduk(id) {
  const data = ContentManager.getAll();
  const product = data.koleksi.products.find(p => p.id === id);
  
  if (product) {
    document.getElementById('editProdukId').value = id;
    document.getElementById('newProdukName').value = product.name;
    document.getElementById('newProdukCategory').value = product.category;
    document.getElementById('newProdukImage').value = product.image;
    document.getElementById('produkModalTitle').textContent = 'Edit Produk';
    openModal('produkModal');
  }
}

function deleteProduk(id) {
  if (confirm('Yakin ingin menghapus produk ini?')) {
    ContentManager.deleteProduct(id);
    loadKoleksi(ContentManager.getAll().koleksi);
    updateDashboardStats(ContentManager.getAll());
    showToast('Produk berhasil dihapus!', 'success');
  }
}

// ============================================================
// Cerita Section
// ============================================================
function loadCerita(cerita) {
  document.getElementById('ceritaEnabled').checked = cerita.enabled;
  document.getElementById('ceritaLabel').value = cerita.label || '';
  document.getElementById('ceritaTitle').value = cerita.title || '';
  document.getElementById('ceritaBody1').value = cerita.body?.[0] || '';
  document.getElementById('ceritaBody2').value = cerita.body?.[1] || '';
  document.getElementById('ceritaImage').value = cerita.image || '';
  document.getElementById('ceritaAccentNum').value = cerita.accentNumber || '';
  document.getElementById('ceritaAccentText').value = cerita.accentText || '';
  document.getElementById('ceritaCtaText').value = cerita.ctaText || '';
  document.getElementById('ceritaCtaLink').value = cerita.ctaLink || '';
  
  // Stats
  if (cerita.stats?.[0]) {
    document.getElementById('ceritaStat1Num').value = cerita.stats[0].number || '';
    document.getElementById('ceritaStat1Label').value = cerita.stats[0].label || '';
  }
  if (cerita.stats?.[1]) {
    document.getElementById('ceritaStat2Num').value = cerita.stats[1].number || '';
    document.getElementById('ceritaStat2Label').value = cerita.stats[1].label || '';
  }
  
  // Image preview
  if (cerita.image) {
    showImagePreview('ceritaImagePreview', cerita.image);
  }
}

function saveCerita(e) {
  e.preventDefault();
  
  const ceritaData = {
    enabled: document.getElementById('ceritaEnabled').checked,
    label: document.getElementById('ceritaLabel').value,
    title: document.getElementById('ceritaTitle').value,
    body: [
      document.getElementById('ceritaBody1').value,
      document.getElementById('ceritaBody2').value
    ],
    image: document.getElementById('ceritaImage').value || getImagePreviewSrc('ceritaImagePreview'),
    accentNumber: document.getElementById('ceritaAccentNum').value,
    accentText: document.getElementById('ceritaAccentText').value,
    stats: [
      {
        number: document.getElementById('ceritaStat1Num').value,
        label: document.getElementById('ceritaStat1Label').value
      },
      {
        number: document.getElementById('ceritaStat2Num').value,
        label: document.getElementById('ceritaStat2Label').value
      }
    ],
    ctaText: document.getElementById('ceritaCtaText').value,
    ctaLink: document.getElementById('ceritaCtaLink').value
  };
  
  ContentManager.updateSection('cerita', ceritaData);
  showToast('Cerita berhasil disimpan!', 'success');
}

// ============================================================
// Ulasan Section
// ============================================================
function loadUlasan(ulasan) {
  document.getElementById('ulasanLabel').value = ulasan.label || '';
  document.getElementById('ulasanTitle').value = ulasan.title || '';
  
  const list = document.getElementById('ulasanList');
  list.innerHTML = ulasan.testimonials.map(t => `
    <div class="testimonial-item">
      <div>
        <div class="testimonial-item__stars">${'★'.repeat(t.stars)}${'☆'.repeat(5 - t.stars)}</div>
        <p class="testimonial-item__quote">"${t.quote}"</p>
        <p class="testimonial-item__author">${t.name}</p>
        <p class="testimonial-item__role">${t.role}</p>
      </div>
      <div class="collection-item__actions" style="flex-direction: column;">
        <button class="edit-btn" onclick="editUlasan(${t.id})">Edit</button>
        <button class="delete-btn" onclick="deleteUlasan(${t.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

function saveUlasan(e) {
  e.preventDefault();
  
  const ulasanData = {
    label: document.getElementById('ulasanLabel').value,
    title: document.getElementById('ulasanTitle').value
  };
  
  ContentManager.updateSection('ulasan', ulasanData);
  showToast('Ulasan berhasil disimpan!', 'success');
}

function saveNewUlasan() {
  const stars = parseInt(document.getElementById('newUlasanStars').value);
  const quote = document.getElementById('newUlasanQuote').value;
  const name = document.getElementById('newUlasanName').value;
  const role = document.getElementById('newUlasanRole').value;
  const avatarColor = document.getElementById('newUlasanColor').value || '#c8b89a';
  const editId = document.getElementById('editUlasanId').value;
  
  if (!quote || !name) {
    showToast('Quote dan nama harus diisi!', 'error');
    return;
  }
  
  if (editId) {
    ContentManager.updateTestimonial(parseInt(editId), { stars, quote, name, role, avatarColor });
    document.getElementById('editUlasanId').value = '';
    document.getElementById('ulasanModalTitle').textContent = 'Tambah Ulasan';
    showToast('Ulasan berhasil diupdate!', 'success');
  } else {
    ContentManager.addTestimonial({ stars, quote, name, role, avatarColor });
    showToast('Ulasan berhasil ditambahkan!', 'success');
  }
  
  loadUlasan(ContentManager.getAll().ulasan);
  updateDashboardStats(ContentManager.getAll());
  closeModal('ulasanModal');
  
  // Reset form
  document.getElementById('newUlasanStars').value = '5';
  document.getElementById('newUlasanQuote').value = '';
  document.getElementById('newUlasanName').value = '';
  document.getElementById('newUlasanRole').value = '';
  document.getElementById('newUlasanColor').value = '';
}

function editUlasan(id) {
  const data = ContentManager.getAll();
  const testimonial = data.ulasan.testimonials.find(t => t.id === id);
  
  if (testimonial) {
    document.getElementById('editUlasanId').value = id;
    document.getElementById('newUlasanStars').value = testimonial.stars;
    document.getElementById('newUlasanQuote').value = testimonial.quote;
    document.getElementById('newUlasanName').value = testimonial.name;
    document.getElementById('newUlasanRole').value = testimonial.role;
    document.getElementById('newUlasanColor').value = testimonial.avatarColor;
    document.getElementById('ulasanModalTitle').textContent = 'Edit Ulasan';
    openModal('ulasanModal');
  }
}

function deleteUlasan(id) {
  if (confirm('Yakin ingin menghapus ulasan ini?')) {
    ContentManager.deleteTestimonial(id);
    loadUlasan(ContentManager.getAll().ulasan);
    updateDashboardStats(ContentManager.getAll());
    showToast('Ulasan berhasil dihapus!', 'success');
  }
}

// ============================================================
// CTA Section
// ============================================================
function loadCta(cta) {
  document.getElementById('ctaEnabled').checked = cta.enabled;
  document.getElementById('ctaLabel').value = cta.label || '';
  document.getElementById('ctaTitle').value = cta.title || '';
  document.getElementById('ctaDesc').value = cta.description || '';
  document.getElementById('ctaBtnText').value = cta.buttonText || '';
  document.getElementById('ctaBtnLink').value = cta.buttonLink || '';
}

function saveCta(e) {
  e.preventDefault();
  
  const ctaData = {
    enabled: document.getElementById('ctaEnabled').checked,
    label: document.getElementById('ctaLabel').value,
    title: document.getElementById('ctaTitle').value,
    description: document.getElementById('ctaDesc').value,
    buttonText: document.getElementById('ctaBtnText').value,
    buttonLink: document.getElementById('ctaBtnLink').value
  };
  
  ContentManager.updateSection('cta', ctaData);
  showToast('CTA berhasil disimpan!', 'success');
}

// ============================================================
// Footer Section
// ============================================================
function loadFooter(footer) {
  document.getElementById('footerLogo').value = footer.logo || '';
  document.getElementById('footerTagline').value = footer.tagline || '';
  document.getElementById('footerInstagram').value = footer.socials?.instagram || '';
  document.getElementById('footerFacebook').value = footer.socials?.facebook || '';
  document.getElementById('footerWhatsapp').value = footer.socials?.whatsapp || '';
  document.getElementById('footerEmail').value = footer.contact?.email || '';
  document.getElementById('footerPhone').value = footer.contact?.phone || '';
  document.getElementById('footerAddress').value = footer.contact?.address || '';
  document.getElementById('footerCopyright').value = footer.copyright || '';
}

function saveFooter(e) {
  e.preventDefault();
  
  const footerData = {
    logo: document.getElementById('footerLogo').value,
    tagline: document.getElementById('footerTagline').value,
    socials: {
      instagram: document.getElementById('footerInstagram').value,
      facebook: document.getElementById('footerFacebook').value,
      whatsapp: document.getElementById('footerWhatsapp').value
    },
    contact: {
      email: document.getElementById('footerEmail').value,
      phone: document.getElementById('footerPhone').value,
      address: document.getElementById('footerAddress').value
    },
    copyright: document.getElementById('footerCopyright').value
  };
  
  ContentManager.updateSection('footer', footerData);
  showToast('Footer berhasil disimpan!', 'success');
}

// ============================================================
// Form Initialization
// ============================================================
function initializeForms() {
  // Hero Form
  document.getElementById('heroForm').addEventListener('submit', saveHero);
  
  // Kategori Form
  document.getElementById('kategoriForm').addEventListener('submit', saveKategori);
  
  // Koleksi Form
  document.getElementById('koleksiForm').addEventListener('submit', saveKoleksi);
  
  // Cerita Form
  document.getElementById('ceritaForm').addEventListener('submit', saveCerita);
  
  // Ulasan Form
  document.getElementById('ulasanForm').addEventListener('submit', saveUlasan);
  
  // CTA Form
  document.getElementById('ctaForm').addEventListener('submit', saveCta);
  
  // Footer Form
  document.getElementById('footerForm').addEventListener('submit', saveFooter);
}

// ============================================================
// Image Upload
// ============================================================
function initializeImageUploads() {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  fileInputs.forEach(input => {
    input.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        const previewId = this.id.replace('Img', '') + 'Preview';
        
        reader.onload = function(e) {
          showImagePreview(previewId, e.target.result);
        };
        
        reader.readAsDataURL(file);
      }
    });
  });
  
  // Drag and drop
  const uploadAreas = document.querySelectorAll('.image-upload');
  uploadAreas.forEach(area => {
    area.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('dragover');
    });
    
    area.addEventListener('dragleave', function() {
      this.classList.remove('dragover');
    });
    
    area.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('dragover');
      
      const fileInput = this.querySelector('input[type="file"]');
      const file = e.dataTransfer.files[0];
      
      if (file && file.type.startsWith('image/')) {
        fileInput.files = e.dataTransfer.files;
        const reader = new FileReader();
        const previewId = fileInput.id.replace('Img', '') + 'Preview';
        
        reader.onload = function(ev) {
          showImagePreview(previewId, ev.target.result);
        };
        
        reader.readAsDataURL(file);
      }
    });
  });
}

function showImagePreview(containerId, src) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <img src="${src}" alt="Preview">
      <button class="remove-btn" onclick="removeImagePreview('${containerId}')">×</button>
    `;
  }
}

function removeImagePreview(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }
}

function getImagePreviewSrc(containerId) {
  const container = document.getElementById(containerId);
  const img = container?.querySelector('img');
  return img ? img.src : null;
}

// ============================================================
// Modal
// ============================================================
function initializeModals() {
  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
  
  // Initialize image upload for modals
  initializeModalImageUpload('kategoriModal', 'newKategoriImage', 'kategoriImagePreview');
  initializeModalImageUpload('produkModal', 'newProdukImage', 'produkImagePreview');
}

function initializeModalImageUpload(modalId, inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  if (!input || !preview) return;
  
  // Create hidden file input for upload
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  fileInput.id = inputId + 'File';
  
  // Replace text input with clickable area
  const uploadArea = document.createElement('div');
  uploadArea.className = 'image-upload';
  uploadArea.innerHTML = `
    <div class="image-upload__icon">📁</div>
    <div class="image-upload__text">Klik untuk upload atau <span>drag file</span></div>
    <div class="image-preview" id="${previewId}"></div>
  `;
  
  uploadArea.addEventListener('click', () => fileInput.click());
  
  // Replace original input container
  input.parentElement.appendChild(fileInput);
  input.parentElement.insertBefore(uploadArea, input);
  input.style.display = 'none';
  
  // File input change handler
  fileInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        ImageUploader.showPreview(previewId, e.target.result);
        input.value = e.target.result; // Store base64 in the hidden input
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      fileInput.files = e.dataTransfer.files;
      const reader = new FileReader();
      reader.onload = function(ev) {
        ImageUploader.showPreview(previewId, ev.target.result);
        input.value = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ============================================================
// Reset
// ============================================================
function initializeReset() {
  document.getElementById('resetBtn').addEventListener('click', function(e) {
    e.preventDefault();
    
    if (confirm('Yakin ingin mereset semua konten ke default? Semua perubahan Anda akan hilang!')) {
      ContentManager.reset();
      loadAllData();
      showToast('Konten berhasil direset ke default!', 'success');
    }
  });
}

// ============================================================
// Toast Notifications
// ============================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================
// Expose functions globally
// ============================================================
window.openModal = openModal;
window.closeModal = closeModal;
window.deleteKategori = deleteKategori;
window.editProduk = editProduk;
window.deleteProduk = deleteProduk;
window.saveNewProduk = saveNewProduk;
window.editUlasan = editUlasan;
window.deleteUlasan = deleteUlasan;
window.saveNewUlasan = saveNewUlasan;
window.removeImagePreview = removeImagePreview;
