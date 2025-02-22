// Local Storage Keys
const STORAGE_KEYS = {
    USER_PROFILE: 'user_profile',
    TRADING_PREFERENCES: 'trading_preferences',
    CUSTOM_BOTS: 'custom_bots',
    THEME: 'theme',
    AUTH_TOKEN: 'auth_token'
};

// Storage Manager Class
class StorageManager {
    // Save data to local storage
    static setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to local storage:', error);
            return false;
        }
    }

    // Get data from local storage
    static getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from local storage:', error);
            return null;
        }
    }

    // Remove item from local storage
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from local storage:', error);
            return false;
        }
    }

    // Clear all data from local storage
    static clearAll() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing local storage:', error);
            return false;
        }
    }

    // User specific methods
    static saveUserProfile(userProfile) {
        return this.setItem(STORAGE_KEYS.USER_PROFILE, userProfile);
    }

    static getUserProfile() {
        return this.getItem(STORAGE_KEYS.USER_PROFILE);
    }

    static saveTradingPreferences(preferences) {
        return this.setItem(STORAGE_KEYS.TRADING_PREFERENCES, preferences);
    }

    static getTradingPreferences() {
        return this.getItem(STORAGE_KEYS.TRADING_PREFERENCES);
    }

    static saveCustomBots(bots) {
        return this.setItem(STORAGE_KEYS.CUSTOM_BOTS, bots);
    }

    static getCustomBots() {
        return this.getItem(STORAGE_KEYS.CUSTOM_BOTS);
    }

    static saveAuthToken(token) {
        return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }

    static getAuthToken() {
        return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    // Check if user is logged in
    static isLoggedIn() {
        return !!this.getAuthToken();
    }
}

// Export the StorageManager class
export default StorageManager; 