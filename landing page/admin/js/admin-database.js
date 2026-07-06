/**
 * Admin Database Integration
 * Connects admin panel with IndexedDB
 * Manages content and image sync
 */

const AdminDB = {
  /**
   * Initialize admin database connection
   */
  async init() {
    await GenLeatherDB.init();
    console.log('Admin database initialized');
  },

  /**
   * Load all images for admin panel display
   */
  async loadAdminImages() {
    return await GenLeatherDB.getAllImages();
  },

  /**
   * Get image statistics
   */
  async getImageStats() {
    const images = await GenLeatherDB.getAllImages();
    const totalSize = images.reduce((sum, img) => sum + (img.size || 0), 0);
    
    return {
      total: images.length,
      totalSize: totalSize,
      formattedSize: this.formatBytes(totalSize),
      bySection: this.groupBySection(images)
    };
  },

  /**
   * Group images by section
   */
  groupBySection(images) {
    const grouped = {};
    images.forEach(img => {
      const section = img.used_in || 'unassigned';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(img);
    });
    return grouped;
  },

  /**
   * Format bytes to readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Save content section to database
   */
  async saveSection(section, data) {
    for (const [key, value] of Object.entries(data)) {
      await GenLeatherDB.setContent(section, key, value);
    }
    console.log(`Section "${section}" saved to database`);
  },

  /**
   * Load content section from database
   */
  async loadSection(section) {
    return await GenLeatherDB.getContentBySection(section);
  },

  /**
   * Delete image and its references
   */
  async deleteImage(imageId) {
    // First delete the image
    await GenLeatherDB.deleteImage(imageId);
    
    // Also delete any content references
    const allContent = await GenLeatherDB.getAllContent();
    for (const content of allContent) {
      if (content.image_id === imageId) {
        // Delete the content reference
        const transaction = GenLeatherDB.db.transaction(['content'], 'readwrite');
        transaction.objectStore('content').delete(content.id);
      }
    }
    
    console.log(`Image ${imageId} and references deleted`);
  },

  /**
   * Search images by name
   */
  async searchImages(query) {
    const images = await GenLeatherDB.getAllImages();
    const lowerQuery = query.toLowerCase();
    
    return images.filter(img => 
      img.original_name.toLowerCase().includes(lowerQuery) ||
      img.filename.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Export database backup
   */
  async exportBackup() {
    const data = await GenLeatherDB.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `genleather-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('Backup exported');
  },

  /**
   * Import database backup
   */
  async importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Clear existing data
          await GenLeatherDB.clearAll();
          
          // Import images
          if (data.images) {
            for (const img of data.images) {
              await GenLeatherDB.addImage(img);
            }
          }
          
          // Import content
          if (data.content) {
            for (const c of data.content) {
              await GenLeatherDB.addContent(c.section, c.field_key, c.value, c.image_id);
            }
          }
          
          console.log('Backup imported successfully');
          resolve(true);
        } catch (error) {
          console.error('Import error:', error);
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * Clear all database
   */
  async clearDatabase() {
    if (confirm('Are you sure you want to clear all database? This cannot be undone.')) {
      await GenLeatherDB.clearAll();
      console.log('Database cleared');
      return true;
    }
    return false;
  }
};

// Auto-initialize
AdminDB.init().catch(console.error);

// Export for global use
window.AdminDB = AdminDB;
