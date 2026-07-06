/**
 * Content Loader for GenLeather Landing Page
 * Loads content from IndexedDB and renders to the page
 * Falls back to static data if database is empty
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Wait for database to be ready
  await GenLeatherDB.init();
  
  // Load dynamic content
  loadDynamicContent();
});

function loadDynamicContent() {
  // Use ContentManager fallback data first (from data.js)
  const data = ContentManager.getAll();
  
  // Try to enhance with database images
  enhanceWithDatabaseImages(data).then(() => {
    console.log('Content loaded with database integration');
  });
}

async function enhanceWithDatabaseImages(data) {
  try {
    // Get all images from database
    const allImages = await GenLeatherDB.getAllImages();
    
    // If database has images, merge them
    if (allImages && allImages.length > 0) {
      console.log(`Found ${allImages.length} images in database`);
      
      // Group images by section
      for (const img of allImages) {
        if (img.blob && img.used_in) {
          // Create blob URL for the image
          const blobUrl = URL.createObjectURL(img.blob);
          
          switch (img.used_in) {
            case 'hero':
              if (img.field_key === 'image') data.hero.image = blobUrl;
              if (img.field_key === 'secondaryImage') data.hero.secondaryImage = blobUrl;
              break;
            case 'kategori':
              // Find matching kategori item
              const katItem = data.kategori.items.find(i => i.id == img.id || i.name === img.original_name);
              if (katItem) katItem.image = blobUrl;
              break;
            case 'koleksi':
              // Find matching product
              const product = data.koleksi.products.find(p => p.id == img.id || p.name === img.original_name);
              if (product) product.image = blobUrl;
              break;
            case 'cerita':
              if (img.field_key === 'image') data.cerita.image = blobUrl;
              break;
          }
        }
      }
    }
    
    // Load content sections
    loadHeroContent(data.hero);
    loadKategoriContent(data.kategori);
    loadKoleksiContent(data.koleksi);
    loadCeritaContent(data.cerita);
    loadUlasanContent(data.ulasan);
    loadCtaContent(data.cta);
    loadFooterContent(data.footer);
    
  } catch (error) {
    console.error('Error enhancing with database:', error);
    // Load with default data if database fails
    const data = ContentManager.getAll();
    loadHeroContent(data.hero);
    loadKategoriContent(data.kategori);
    loadKoleksiContent(data.koleksi);
    loadCeritaContent(data.cerita);
    loadUlasanContent(data.ulasan);
    loadCtaContent(data.cta);
    loadFooterContent(data.footer);
  }
}

function loadHeroContent(hero) {
  if (!hero.enabled) {
    const heroSection = document.getElementById('hero');
    if (heroSection) heroSection.style.display = 'none';
    return;
  }
  
  // Label
  const heroLabel = document.querySelector('.hero .label');
  if (heroLabel) heroLabel.textContent = hero.label;
  
  // Title
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) heroTitle.innerHTML = hero.title;
  
  // Description
  const heroDesc = document.querySelector('.hero__desc');
  if (heroDesc) heroDesc.textContent = hero.description;
  
  // Badge
  const heroBadge = document.querySelector('.hero__badge');
  if (heroBadge) heroBadge.innerHTML = hero.badgeText.replace(/\n/g, '<br>');
  
  // Images
  const heroMainImg = document.querySelector('.hero__img-wrap img');
  if (heroMainImg) heroMainImg.src = hero.image;
  
  const heroSecImg = document.querySelector('.hero__secondary-img img');
  if (heroSecImg) heroSecImg.src = hero.secondaryImage;
  
  // Buttons
  const btnPrimary = document.querySelector('.hero__actions .btn--dark');
  if (btnPrimary) {
    btnPrimary.textContent = hero.buttonPrimaryText;
    btnPrimary.href = hero.buttonPrimaryLink;
  }
  
  const btnSecondary = document.querySelector('.hero__actions .btn--ghost');
  if (btnSecondary) {
    btnSecondary.textContent = hero.buttonSecondaryText;
    btnSecondary.href = hero.buttonSecondaryLink;
  }
  
  // Stats
  const statNums = document.querySelectorAll('.stat__num');
  const statLabels = document.querySelectorAll('.stat__label');
  
  hero.stats.forEach((stat, i) => {
    if (statNums[i]) {
      statNums[i].innerHTML = stat.number + (stat.suffix || '');
    }
    if (statLabels[i]) {
      statLabels[i].textContent = stat.label;
    }
  });
}

function loadKategoriContent(kategori) {
  if (!kategori.enabled) {
    const kategoriSection = document.getElementById('kategori');
    if (kategoriSection) kategoriSection.style.display = 'none';
    return;
  }
  
  // Label & Title
  const kategoriSection = document.getElementById('kategori');
  if (kategoriSection) {
    const label = kategoriSection.querySelector('.label');
    if (label) label.textContent = kategori.label;
    
    const title = kategoriSection.querySelector('.section-title');
    if (title) title.innerHTML = kategori.title;
  }
  
  // Items
  const grid = document.querySelector('.kategori__grid');
  if (grid) {
    grid.innerHTML = kategori.items.map(item => `
      <a href="#koleksi" class="kategori__item">
        <div class="kategori__icon">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <span>${item.name}</span>
      </a>
    `).join('');
  }
}

function loadKoleksiContent(koleksi) {
  console.log('Loading koleksi content:', koleksi);
  
  if (!koleksi.enabled) {
    const koleksiSection = document.getElementById('koleksi');
    if (koleksiSection) koleksiSection.style.display = 'none';
    return;
  }
  
  const koleksiSection = document.getElementById('koleksi');
  if (koleksiSection) {
    // Label & Title
    const label = koleksiSection.querySelector('.label');
    if (label) label.textContent = koleksi.label;
    
    const title = koleksiSection.querySelector('.section-title');
    if (title) title.innerHTML = koleksi.title;
  }
  
  // Products Grid
  const grid = document.querySelector('.koleksi__grid');
  if (grid) {
    // Ensure products is an array
    const products = koleksi.products || [];
    console.log('Products to render:', products.length);
    
    if (products.length > 0) {
      grid.innerHTML = products.map((product, index) => `
        <div class="koleksi__card fade-up" style="--d:${0.1 * (index + 1)}s">
          <div class="koleksi__img">
            <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'" />
            <div class="koleksi__overlay"><span>Lihat Detail</span></div>
          </div>
          <div class="koleksi__info">
            <p class="koleksi__name">${product.name}</p>
            <p class="koleksi__sub">${product.category}</p>
          </div>
        </div>
      `).join('');
    } else {
      console.log('No products found, keeping default HTML');
    }
  } else {
    console.error('Grid element not found');
  }
}

function loadCeritaContent(cerita) {
  if (!cerita.enabled) {
    const ceritaSection = document.getElementById('cerita');
    if (ceritaSection) ceritaSection.style.display = 'none';
    return;
  }
  
  const ceritaSection = document.getElementById('cerita');
  if (ceritaSection) {
    // Label & Title
    const label = ceritaSection.querySelector('.label');
    if (label) label.textContent = cerita.label;
    
    const title = ceritaSection.querySelector('.section-title');
    if (title) title.innerHTML = cerita.title;
    
    // Body paragraphs
    const bodies = ceritaSection.querySelectorAll('.cerita__body');
    if (bodies[0]) bodies[0].textContent = cerita.body[0] || '';
    if (bodies[1]) bodies[1].textContent = cerita.body[1] || '';
    
    // Image
    const mainImg = ceritaSection.querySelector('.cerita__main-img');
    if (mainImg) mainImg.src = cerita.image;
    
    // Accent card
    const accentNum = ceritaSection.querySelector('.cerita__accent-num');
    if (accentNum) accentNum.textContent = cerita.accentNumber;
    
    const accentText = ceritaSection.querySelector('.cerita__accent-text');
    if (accentText) accentText.textContent = cerita.accentText;
    
    // Stats
    const statNums = ceritaSection.querySelectorAll('.cerita__stat-num');
    const statLabels = ceritaSection.querySelectorAll('.cerita__stat-label');
    
    cerita.stats.forEach((stat, i) => {
      if (statNums[i]) statNums[i].textContent = stat.number;
      if (statLabels[i]) statLabels[i].textContent = stat.label;
    });
    
    // CTA Button
    const ctaBtn = ceritaSection.querySelector('.btn--dark');
    if (ctaBtn) {
      ctaBtn.textContent = cerita.ctaText;
      ctaBtn.href = cerita.ctaLink;
    }
  }
}

function loadUlasanContent(ulasan) {
  if (!ulasan.enabled) {
    const section = document.getElementById('ulasan');
    if (section) section.style.display = 'none';
    return;
  }
  
  const section = document.getElementById('ulasan');
  if (section) {
    // Label & Title
    const label = section.querySelector('.label');
    if (label) label.textContent = ulasan.label;
    
    const title = section.querySelector('.section-title');
    if (title) title.innerHTML = ulasan.title;
  }
  
  // Testimonials
  const track = document.getElementById('ulasanTrack');
  if (track) {
    track.innerHTML = ulasan.testimonials.map(t => `
      <div class="ulasan__card">
        <div class="ulasan__stars">${'★'.repeat(t.stars)}</div>
        <blockquote class="ulasan__quote">
          "${t.quote}"
        </blockquote>
        <div class="ulasan__author">
          <div class="ulasan__avatar" style="background:${t.avatarColor}"></div>
          <div>
            <p class="ulasan__name">${t.name}</p>
            <p class="ulasan__role">${t.role}</p>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function loadCtaContent(cta) {
  if (!cta.enabled) {
    const ctaSection = document.getElementById('kontak');
    if (ctaSection) ctaSection.style.display = 'none';
    return;
  }
  
  const ctaSection = document.querySelector('.cta');
  if (ctaSection) {
    // Label
    const label = ctaSection.querySelector('.label');
    if (label) label.textContent = cta.label;
    
    // Title
    const title = ctaSection.querySelector('.cta__title');
    if (title) title.innerHTML = cta.title;
    
    // Description
    const desc = ctaSection.querySelector('.cta__desc');
    if (desc) desc.textContent = cta.description;
    
    // Button
    const btn = ctaSection.querySelector('.btn--cream');
    if (btn) {
      btn.textContent = cta.buttonText;
      btn.href = cta.buttonLink;
    }
  }
}

function loadFooterContent(footer) {
  const footerSection = document.querySelector('.footer');
  if (footerSection) {
    // Logo
    const logo = footerSection.querySelector('.footer__logo');
    if (logo) logo.textContent = footer.logo;
    
    // Tagline
    const tagline = footerSection.querySelector('.footer__tagline');
    if (tagline) tagline.innerHTML = footer.tagline.replace(/\n/g, '<br>');
    
    // Socials
    const socials = footerSection.querySelectorAll('.footer__socials a');
    if (socials[0]) socials[0].href = footer.socials.instagram;
    if (socials[1]) socials[1].href = footer.socials.facebook;
    if (socials[2]) socials[2].href = footer.socials.whatsapp;
    
    // Contact
    const emailLink = footerSection.querySelector('.footer__col:nth-child(4) a');
    if (emailLink) emailLink.href = 'mailto:' + footer.contact.email;
    emailLink.textContent = footer.contact.email;
    
    const phoneLink = footerSection.querySelector('.footer__col:nth-child(4) a:nth-child(2)');
    if (phoneLink) {
      phoneLink.href = 'tel:' + footer.contact.phone.replace(/\s/g, '');
      phoneLink.textContent = footer.contact.phone;
    }
    
    const address = footerSection.querySelector('.footer__col:nth-child(4) p');
    if (address) address.innerHTML = footer.contact.address.replace(/\n/g, '<br>');
    
    // Copyright
    const copyright = footerSection.querySelector('.footer__bottom p');
    if (copyright) copyright.textContent = footer.copyright;
  }
}

// Export for global use
window.loadDynamicContent = loadDynamicContent;
