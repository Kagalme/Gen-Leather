/**
 * GenLeather Database Module
 * IndexedDB wrapper for image and content management
 * Replaces localStorage with structured database
 */

const GenLeatherDB = {
  dbName: 'GenLeatherDB',
  dbVersion: 1,
  db: null,

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.createStores(db);
      };
    });
  },

  // Create object stores
  createStores(db) {
    // Store for images metadata
    if (!db.objectStoreNames.contains('images')) {
      const imageStore = db.createObjectStore('images', { keyPath: 'id', autoIncrement: true });
      imageStore.createIndex('filename', 'filename', { unique: true });
      imageStore.createIndex('used_in', 'used_in', { unique: false });
      imageStore.createIndex('uploaded_at', 'uploaded_at', { unique: false });
      console.log('Created images store');
    }

    // Store for content/sections
    if (!db.objectStoreNames.contains('content')) {
      const contentStore = db.createObjectStore('content', { keyPath: 'id', autoIncrement: true });
      contentStore.createIndex('section', 'section', { unique: false });
      contentStore.createIndex('field_key', 'field_key', { unique: false });
      console.log('Created content store');
    }

    // Store for settings
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
      console.log('Created settings store');
    }
  },

  // ==================== IMAGE OPERATIONS ====================

  // Add new image
  async addImage(imageData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');

      const data = {
        ...imageData,
        uploaded_at: new Date().toISOString()
      };

      const request = store.add(data);
      request.onsuccess = () => {
        data.id = request.result;
        console.log('Image added:', data.filename);
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Get all images
  async getAllImages() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Get image by ID
  async getImageById(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Get image by filename
  async getImageByFilename(filename) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const index = store.index('filename');
      const request = index.get(filename);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Get images by section (used_in)
  async getImagesBySection(section) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const index = store.index('used_in');
      const request = index.getAll(section);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Update image metadata
  async updateImage(id, updates) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = { ...getRequest.result, ...updates, updated_at: new Date().toISOString() };
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve(data);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  // Delete image
  async deleteImage(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('Image deleted:', id);
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // ==================== CONTENT OPERATIONS ====================

  // Add content
  async addContent(section, fieldKey, value, imageId = null) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['content'], 'readwrite');
      const store = transaction.objectStore('content');

      const data = {
        section,
        field_key: fieldKey,
        value,
        image_id: imageId,
        updated_at: new Date().toISOString()
      };

      const request = store.add(data);
      request.onsuccess = () => {
        data.id = request.result;
        resolve(data);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Get all content for a section
  async getContentBySection(section) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['content'], 'readonly');
      const store = transaction.objectStore('content');
      const index = store.index('section');
      const request = index.getAll(section);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Get single content field
  async getContentField(section, fieldKey) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['content'], 'readonly');
      const store = transaction.objectStore('content');
      const index = store.index('section');
      const request = index.getAll(section);

      request.onsuccess = () => {
        const results = request.result.filter(c => c.field_key === fieldKey);
        resolve(results.length > 0 ? results[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // Update or insert content
  async setContent(section, fieldKey, value, imageId = null) {
    const existing = await this.getContentField(section, fieldKey);

    if (existing) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['content'], 'readwrite');
        const store = transaction.objectStore('content');
        const data = { ...existing, value, image_id: imageId, updated_at: new Date().toISOString() };
        const request = store.put(data);
        request.onsuccess = () => resolve(data);
        request.onerror = () => reject(request.error);
      });
    } else {
      return this.addContent(section, fieldKey, value, imageId);
    }
  },

  // Get all content
  async getAllContent() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['content'], 'readonly');
      const store = transaction.objectStore('content');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // ==================== SETTINGS OPERATIONS ====================

  // Set setting
  async setSetting(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  },

  // Get setting
  async getSetting(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value ?? null);
      request.onerror = () => reject(request.error);
    });
  },

  // ==================== UTILITY ====================

  // Generate unique filename
  generateFilename(originalName, extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
    return `${safeName}-${timestamp}-${random}.${extension}`;
  },

  // Clear all data (for reset)
  async clearAll() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['images', 'content', 'settings'], 'readwrite');
      
      transaction.objectStore('images').clear();
      transaction.objectStore('content').clear();
      transaction.objectStore('settings').clear();

      transaction.oncomplete = () => {
        console.log('All data cleared');
        resolve(true);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  },

  // Export all data (for backup)
  async exportData() {
    const images = await this.getAllImages();
    const content = await this.getAllContent();
    return { images, content, exported_at: new Date().toISOString() };
  }
};

// Auto-initialize when loaded
GenLeatherDB.init().catch(console.error);

// Export for global use
window.GenLeatherDB = GenLeatherDB;
