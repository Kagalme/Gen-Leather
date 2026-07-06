/**
 * GenLeather Image Uploader Module
 * Handles image upload, compression, and IndexedDB storage
 * Images are stored as blobs with logical paths to ./asset/
 */

const ImageUploader = {
  // Configuration
  config: {
    maxFileSize: 5 * 1024 * 1024, // 5MB max
    supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    quality: 0.8, // Compression quality
    maxDimension: 1200, // Max width/height
    assetPath: './asset/' // Logical path prefix
  },

  /**
   * Initialize uploader with file input
   */
  init(inputElement, options = {}) {
    const config = { ...this.config, ...options };
    const previewId = options.previewId || inputElement.id.replace('Img', '') + 'Preview';
    const section = options.section || 'general';
    
    inputElement.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.handleFileUpload(file, previewId, config, {
          ...options,
          section
        });
      }
    });

    // Setup drag and drop if container provided
    if (options.dropContainer) {
      this.setupDragDrop(options.dropContainer, inputElement, previewId, config, {
        ...options,
        section
      });
    }
  },

  /**
   * Setup drag and drop functionality
   */
  setupDragDrop(container, inputElement, previewId, config, options) {
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
        await this.handleFileUpload(file, previewId, config, options);
      }
    });
  },

  /**
   * Handle file upload process
   */
  async handleFileUpload(file, previewId, config, options = {}) {
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

      // Compress image
      const { blob, dataUrl } = await this.processImage(file, config);
      
      // Generate unique filename
      const extension = file.type.split('/')[1];
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      const filename = this.generateFilename(originalName, extension);
      const logicalPath = config.assetPath + filename;

      // Store in IndexedDB
      const imageData = {
        filename,
        original_name: file.name,
        path: logicalPath,
        size: blob.size,
        mime_type: file.type,
        width: config.maxDimension,
        height: config.maxDimension,
        used_in: options.section || 'general',
        blob: blob // Store actual image data
      };

      const savedImage = await GenLeatherDB.addImage(imageData);

      // Show preview
      this.showPreview(previewId, dataUrl, savedImage.id);

      // Callback
      if (options.onSuccess) {
        options.onSuccess({
          id: savedImage.id,
          filename,
          path: logicalPath,
          blobUrl: dataUrl
        });
      }

      return savedImage;
    } catch (error) {
      console.error('Image upload error:', error);
      this.showError('Gagal mengupload gambar. Silakan coba lagi.');
      return null;
    }
  },

  /**
   * Process image - compress and return blob + dataUrl
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
              height = Math.round((height / width) * config.maxDimension);
              width = config.maxDimension;
            } else {
              width = Math.round((width / height) * config.maxDimension);
              height = config.maxDimension;
            }
          }

          // Create canvas for compression
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob and dataUrl
          canvas.toBlob(
            (blob) => {
              const dataUrl = canvas.toDataURL(file.type, config.quality);
              resolve({ blob, dataUrl });
            },
            file.type,
            config.quality
          );
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Generate unique filename
   */
  generateFilename(originalName, extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
    return `${safeName}-${timestamp}-${random}.${extension}`;
  },

  /**
   * Show image preview with remove button
   */
  showPreview(containerId, src, imageId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <img src="${src}" alt="Preview" data-image-id="${imageId}">
        <button class="remove-btn" type="button" onclick="ImageUploader.removePreview('${containerId}', ${imageId})">×</button>
      `;
    }
  },

  /**
   * Remove image preview
   */
  async removePreview(containerId, imageId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    
    // Delete from IndexedDB if imageId exists
    if (imageId) {
      try {
        await GenLeatherDB.deleteImage(imageId);
        console.log('Image deleted from database:', imageId);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
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
   * Get image data from database
   */
  async getImage(imageId) {
    return await GenLeatherDB.getImageById(imageId);
  },

  /**
   * Get all images
   */
  async getAllImages() {
    return await GenLeatherDB.getAllImages();
  },

  /**
   * Get images by section
   */
  async getImagesBySection(section) {
    return await GenLeatherDB.getImagesBySection(section);
  },

  /**
   * Load image from IndexedDB and create URL
   */
  async loadImageUrl(imageId) {
    const imageData = await this.getImage(imageId);
    if (imageData && imageData.blob) {
      return URL.createObjectURL(imageData.blob);
    }
    return null;
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
