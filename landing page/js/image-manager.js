/**
 * GenLeather Image Manager
 * Handles loading images from IndexedDB and caching URLs
 * Used by content-loader.js for landing page
 */

const ImageManager = {
  // Cache for blob URLs to avoid recreating
  urlCache: new Map(),
  
  /**
   * Get image URL from IndexedDB
   * @param {number|string} imageId - Image ID in database
   * @returns {Promise<string|null>} Blob URL or null
   */
  async getImageUrl(imageId) {
    if (!imageId) return null;
    
    // Check cache first
    if (this.urlCache.has(imageId)) {
      return this.urlCache.get(imageId);
    }
    
    try {
      const imageData = await GenLeatherDB.getImageById(imageId);
      
      if (imageData && imageData.blob) {
        const blobUrl = URL.createObjectURL(imageData.blob);
        this.urlCache.set(imageId, blobUrl);
        return blobUrl;
      }
      
      // Fallback to path if no blob (for static images)
      if (imageData && imageData.path) {
        return imageData.path;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  },

  /**
   * Get multiple image URLs
   * @param {Array} imageIds - Array of image IDs
   * @returns {Promise<Array>} Array of URL strings
   */
  async getImageUrls(imageIds) {
    const urls = [];
    for (const id of imageIds) {
      const url = await this.getImageUrl(id);
      urls.push(url);
    }
    return urls;
  },

  /**
   * Preload images into cache
   * @param {Array} imageIds - Array of image IDs to preload
   */
  async preloadImages(imageIds) {
    for (const id of imageIds) {
      if (!this.urlCache.has(id)) {
        await this.getImageUrl(id);
      }
    }
  },

  /**
   * Clear URL cache (call when navigating away)
   */
  clearCache() {
    for (const [id, url] of this.urlCache) {
      URL.revokeObjectURL(url);
    }
    this.urlCache.clear();
    console.log('Image URL cache cleared');
  },

  /**
   * Load section images and return mapping
   * @param {string} section - Section name (hero, koleksi, kategori, etc.)
   * @returns {Promise<Object>} Mapping of field names to URLs
   */
  async loadSectionImages(section) {
    const images = await GenLeatherDB.getImagesBySection(section);
    const mapping = {};
    
    for (const img of images) {
      const url = img.blob ? URL.createObjectURL(img.blob) : img.path;
      mapping[img.field_key] = {
        id: img.id,
        url: url,
        path: img.path
      };
      this.urlCache.set(img.id, url);
    }
    
    return mapping;
  },

  /**
   * Find image by path and return its blob URL
   * @param {string} path - Logical path like './asset/dompet.png'
   * @returns {Promise<string|null>} Blob URL
   */
  async getImageByPath(path) {
    const allImages = await GenLeatherDB.getAllImages();
    const image = allImages.find(img => img.path === path);
    
    if (image && image.blob) {
      const blobUrl = URL.createObjectURL(image.blob);
      this.urlCache.set(image.id, blobUrl);
      return blobUrl;
    }
    
    // Return original path if not found in DB
    return path;
  },

  /**
   * Update or set an image for a section
   * @param {string} section - Section name
   * @param {string} fieldKey - Field name
   * @param {number} imageId - Image ID
   */
  async setSectionImage(section, fieldKey, imageId) {
    await GenLeatherDB.setContent(section, fieldKey, null, imageId);
    
    // Update image's used_in field
    await GenLeatherDB.updateImage(imageId, { used_in: section, field_key: fieldKey });
  },

  /**
   * Get all images for landing page
   * Combines database images with static fallback
   * @returns {Promise<Object>} All images by section
   */
  async getAllLandingImages() {
    const result = {
      hero: {},
      koleksi: [],
      kategori: []
    };
    
    // Load hero images
    const heroImages = await GenLeatherDB.getImagesBySection('hero');
    for (const img of heroImages) {
      if (img.blob) {
        result.hero[img.field_key] = URL.createObjectURL(img.blob);
        this.urlCache.set(img.id, result.hero[img.field_key]);
      }
    }
    
    // Load koleksi products
    const koleksiImages = await GenLeatherDB.getImagesBySection('koleksi');
    for (const img of koleksiImages) {
      result.koleksi.push({
        id: img.id,
        url: img.blob ? URL.createObjectURL(img.blob) : img.path
      });
    }
    
    // Load kategori
    const kategoriImages = await GenLeatherDB.getImagesBySection('kategori');
    for (const img of kategoriImages) {
      result.kategori.push({
        id: img.id,
        url: img.blob ? URL.createObjectURL(img.blob) : img.path
      });
    }
    
    return result;
  }
};

// Export for global use
window.ImageManager = ImageManager;
