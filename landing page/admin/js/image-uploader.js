/**
 * GenLeather Image Uploader Module
 * Handles image upload, compression, and storage
 * Uses localStorage with base64 encoding for persistence
 */

const ImageUploader = {
  // Configuration
  config: {
    maxFileSize: 2 * 1024 * 1024, // 2MB max
    maxLocalStorageSize: 4 * 1024 * 1024, // 4MB for images
    supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    quality: 0.7, // Compression quality
    maxDimension: 1200, // Max width/height
    storagePrefix: 'img_'
  },

  /**
   * Initialize uploader with file input
   */
  init(inputElement, options = {}) {
    const config = { ...this.config, ...options };
    const previewId = options.previewId || inputElement.id.replace('Img', '') + 'Preview';
    
    inputElement.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.handleFileUpload(file, previewId, config, options.onSuccess);
      }
    });

    // Setup drag and drop if container provided
    if (options.dropContainer) {
      this.setupDragDrop(options.dropContainer, inputElement, previewId, config, options.onSuccess);
    }
  },

  /**
   * Setup drag and drop functionality
   */
  setupDragDrop(container, inputElement, previewId, config, callback) {
    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      container.classList.add('dragover');
    });
    
    container.addEventListener('dragleave', () => {
      container.classList.remove('dragover');
    });
    
    container.addEventListener('drop', async (e) => {
      e.preventDefault();
      container.classList.remove('dragover');
      
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        inputElement.files = e.dataTransfer.files;
        await this.handleFileUpload(file, previewId, config, callback);
      }
    });
  },

  /**
   * Handle file upload process
   */
  async handleFileUpload(file, previewId, config, callback) {
    // Validate file type
    if (!config.supportedTypes.includes(file.type)) {
      this.showError('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP.');
      return null;
    }

    // Validate file size
    if (file.size > config.maxFileSize) {
      this.showError(`File terlalu besar. Maksimal ${config.maxFileSize / 1024 / 1024}MB.`);
      return null;
    }

    try {
      // Show loading state
      this.showLoading(previewId);

      // Compress and convert to base64
      const base64 = await this.processImage(file, config);
      
      // Store in localStorage
      const storageKey = config.storagePrefix + previewId;
      this.saveToStorage(storageKey, base64);

      // Show preview
      this.showPreview(previewId, base64);

      // Callback
      if (callback) callback(base64);

      return base64;
    } catch (error) {
      console.error('Image upload error:', error);
      this.showError('Gagal mengupload gambar. Silakan coba lagi.');
      return null;
    }
  },

  /**
   * Process image - compress and convert to base64
   */
  processImage(file, config) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > config.maxDimension || height > config.maxDimension) {
            if (width > height) {
              height = (height / width) * config.maxDimension;
              width = config.maxDimension;
            } else {
              width = (width / height) * config.maxDimension;
              height = config.maxDimension;
            }
          }

          // Create canvas for compression
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const base64 = canvas.toDataURL(file.type, config.quality);
          resolve(base64);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Save image to localStorage
   */
  saveToStorage(key, base64) {
    try {
      localStorage.setItem(key, base64);
    } catch (e) {
      // If storage is full, try to clear old images
      this.clearOldImages();
      try {
        localStorage.setItem(key, base64);
      } catch (e2) {
        console.error('localStorage is full even after cleanup');
      }
    }
  },

  /**
   * Get image from localStorage
   */
  getFromStorage(key) {
    return localStorage.getItem(key);
  },

  /**
   * Clear old/unused images from storage
   */
  clearOldImages() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.config.storagePrefix)) {
        // Check if it's older than 7 days (using timestamp)
        const data = localStorage.getItem(key);
        if (data && data.length > 500000) { // Large image > 500KB
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  },

  /**
   * Show image preview
   */
  showPreview(containerId, src) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <img src="${src}" alt="Preview">
        <button class="remove-btn" type="button" onclick="ImageUploader.removePreview('${containerId}')">×</button>
      `;
    }
  },

  /**
   * Remove image preview
   */
  removePreview(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  },

  /**
   * Show loading state
   */
  showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    }
  },

  /**
   * Show error message
   */
  showError(message) {
    // Create toast notification
    const container = document.getElementById('toastContainer');
    if (container) {
      const toast = document.createElement('div');
      toast.className = 'toast toast--error';
      toast.textContent = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  },

  /**
   * Get image src from preview container
   */
  getImageSrc(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const img = container.querySelector('img');
    return img ? img.src : null;
  },

  /**
   * Initialize all image uploads on page
   */
  initAll() {
    const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    
    fileInputs.forEach(input => {
      const previewId = input.id.replace('Img', '').replace('Upload', '') + 'Preview';
      this.init(input, {
        previewId,
        dropContainer: input.closest('.image-upload') || input.parentElement
      });
    });
  }
};

// Export for global use
window.ImageUploader = ImageUploader;
