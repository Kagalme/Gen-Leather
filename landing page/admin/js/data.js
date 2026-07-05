/**
 * GenLeather Content Management System
 * Handles all content data for the landing page
 * Uses localStorage for persistence
 */

const ContentManager = {
  STORAGE_KEY: 'genleather_content',
  
  // Default content data
  defaultData: {
    hero: {
      enabled: true,
      label: 'Karya tangan pilihan',
      title: 'Simfoni <em>Tekstur</em><br>& Waktu yang<br>Terjahit <em>Tangan.</em>',
      description: 'Setiap produk kami lahir dari tangan pengrajin berpengalaman, menggunakan bahan pilihan yang menceritakan kisahnya sendiri.',
      buttonPrimaryText: 'Lihat Koleksi',
      buttonPrimaryLink: '#koleksi',
      buttonSecondaryText: 'Tentang Kami',
      buttonSecondaryLink: '#cerita',
      image: './asset/d1.png',
      secondaryImage: './asset/jam sc1.png',
      badgeText: 'Edisi\nTerbatas',
      stats: [
        { number: '12', suffix: '<sup>+</sup>', label: 'Tahun Pengalaman' },
        { number: '3K', suffix: '<sup>+</sup>', label: 'Pelanggan Puas' },
        { number: '100', suffix: '%', label: 'Buatan Tangan' }
      ]
    },
    
    kategori: {
      enabled: true,
      label: 'Apa yang kami buat',
      title: 'Pilih bentuk yang<br>menemani hari Anda.',
      items: [
        { id: 1, name: 'Tas', image: './asset/tas sc.png' },
        { id: 2, name: 'Dompet', image: './asset/domper sc.png' },
        { id: 3, name: 'Sabuk', image: './asset/sabuk.png' },
        { id: 4, name: 'Lanyard', image: './asset/lanyard.png' }
      ]
    },
    
    koleksi: {
      enabled: true,
      label: 'Produk unggulan',
      title: 'Koleksi yang dijahit<br>tangan dengan hati.',
      viewAllLink: '#',
      products: [
        {
          id: 1,
          name: 'Tas Kulit Klasik',
          category: 'Full Grain Leather',
          image: './asset/tas kulit.png'
        },
        {
          id: 2,
          name: 'Dompet Trifold',
          category: 'Cowhide Premium',
          image: './asset/dompet kulit.png'
        },
        {
          id: 3,
          name: 'Lanyard Kulit',
          category: 'Vegetable Tanned',
          image: './asset/lanyard.png'
        },
        {
          id: 4,
          name: 'Pouch Persegi',
          category: 'Saddle Leather',
          image: './asset/dompet besar.png'
        }
      ]
    },
    
    cerita: {
      enabled: true,
      label: 'Filosofi kami',
      title: 'Di balik setiap<br>jahitan, ada <em>tangan</em><br>yang bercerita.',
      body: [
        'Kami percaya bahwa benda yang indah lahir dari proses yang jujur. Setiap potongan kulit dipilih dengan teliti, setiap jahitan diukur dengan penuh kesadaran. Bukan produksi massal — melainkan sebuah ritual pengerjaan yang telah kami jaga selama lebih dari satu dekade.',
        'Pengrajin kami bukan sekadar tenaga kerja; mereka adalah seniman yang meneruskan tradisi kerajinan tangan yang kaya dan penuh makna.'
      ],
      image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=700&q=80',
      accentNumber: '28',
      accentText: 'Pengrajin berpengalaman di balik setiap karya',
      stats: [
        { number: '12', label: 'Tahun berdiri' },
        { number: '3K+', label: 'Karya terjual' }
      ],
      ctaText: 'Kenali Lebih Jauh',
      ctaLink: '#kontak'
    },
    
    ulasan: {
      enabled: true,
      label: 'Dari mereka',
      title: 'Suara dari mereka<br>yang memakai kami.',
      testimonials: [
        {
          id: 1,
          stars: 5,
          quote: 'Kualitas jahitannya luar biasa. Tas yang saya beli dua tahun lalu masih terasa seperti baru — bahkan semakin indah seiring waktu.',
          name: 'Reza Mahendra',
          role: 'Pengusaha, Jakarta',
          avatarColor: '#c8b89a'
        },
        {
          id: 2,
          stars: 5,
          quote: 'Belanja di sini seperti mendapatkan karya seni. Setiap detail terasa disengaja dan penuh kasih — produk terbaik yang pernah saya miliki.',
          name: 'Sari Kusuma',
          role: 'Desainer Interior, Yogyakarta',
          avatarColor: '#a08060'
        },
        {
          id: 3,
          stars: 5,
          quote: 'Saya sudah coba banyak brand tas kulit, tapi Kulit Karya benar-benar berbeda. Bahannya premium, jahitannya rapi, dan servicenya memuaskan.',
          name: 'Bagas Pratama',
          role: 'Arsitek, Bandung',
          avatarColor: '#7a6040'
        }
      ]
    },
    
    cta: {
      enabled: true,
      label: 'Siap bergabung?',
      title: 'Mulai cerita<br>Anda bersama<br><em>kami.</em>',
      description: 'Jadikan setiap hari lebih bermakna dengan karya yang benar-benar dibuat untuk Anda.',
      buttonText: 'Mulai Berbelanja',
      buttonLink: '#koleksi'
    },
    
    footer: {
      logo: 'Kulit Karya',
      tagline: 'Kerajinan tangan premium<br>dari hati pengrajin Indonesia.',
      socials: {
        instagram: 'https://www.instagram.com/genleather.id_/',
        facebook: '#',
        whatsapp: '#'
      },
      contact: {
        email: 'GenLeather@gmail.com',
        phone: '+62 812-345-678',
        address: 'Jl. Kerajinan No. 14\nYogyakarta, Indonesia'
      },
      copyright: '© 2025 Kulit Karya. Semua hak dilindungi.'
    }
  },
  
  // Initialize with default data if empty
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultData));
    }
  },
  
  // Get all content
  getAll() {
    // Auto-initialize if needed
    this.init();
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored data:', e);
        return this.defaultData;
      }
    }
    return this.defaultData;
  },
  
  // Save all content
  saveAll(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // Reset to default
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.defaultData;
  },
  
  // Update specific section
  updateSection(section, data) {
    const all = this.getAll();
    all[section] = { ...all[section], ...data };
    this.saveAll(all);
    return all;
  },
  
  // Add product to koleksi
  addProduct(product) {
    const all = this.getAll();
    product.id = Date.now();
    all.koleksi.products.push(product);
    this.saveAll(all);
    return all;
  },
  
  // Update product
  updateProduct(id, data) {
    const all = this.getAll();
    const index = all.koleksi.products.findIndex(p => p.id === id);
    if (index !== -1) {
      all.koleksi.products[index] = { ...all.koleksi.products[index], ...data };
      this.saveAll(all);
    }
    return all;
  },
  
  // Delete product
  deleteProduct(id) {
    const all = this.getAll();
    all.koleksi.products = all.koleksi.products.filter(p => p.id !== id);
    this.saveAll(all);
    return all;
  },
  
  // Add testimonial
  addTestimonial(testimonial) {
    const all = this.getAll();
    testimonial.id = Date.now();
    all.ulasan.testimonials.push(testimonial);
    this.saveAll(all);
    return all;
  },
  
  // Update testimonial
  updateTestimonial(id, data) {
    const all = this.getAll();
    const index = all.ulasan.testimonials.findIndex(t => t.id === id);
    if (index !== -1) {
      all.ulasan.testimonials[index] = { ...all.ulasan.testimonials[index], ...data };
      this.saveAll(all);
    }
    return all;
  },
  
  // Delete testimonial
  deleteTestimonial(id) {
    const all = this.getAll();
    all.ulasan.testimonials = all.ulasan.testimonials.filter(t => t.id !== id);
    this.saveAll(all);
    return all;
  },
  
  // Add category
  addCategory(item) {
    const all = this.getAll();
    item.id = Date.now();
    all.kategori.items.push(item);
    this.saveAll(all);
    return all;
  },
  
  // Delete category
  deleteCategory(id) {
    const all = this.getAll();
    all.kategori.items = all.kategori.items.filter(i => i.id !== id);
    this.saveAll(all);
    return all;
  }
};

// Export for use
window.ContentManager = ContentManager;
