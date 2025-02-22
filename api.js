const API_BASE_URL = '/api';

const api = {
    // Auth endpoints
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            // Log the response for debugging
            console.log('Server response:', response);
            
            // Check if response is empty
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (!responseText) {
                throw new Error('Empty response from server');
            }
            
            // Try parsing the JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid response format from server');
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            return data;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },

    async signup(email, password, phone) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, phone })
            });
            
            // Log the response for debugging
            console.log('Server response:', response);
            
            // Check if response is empty
            const responseText = await response.text();
            console.log('Response text:', responseText);
            
            if (!responseText) {
                throw new Error('Empty response from server');
            }
            
            // Try parsing the JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('JSON parse error:', e);
                throw new Error('Invalid response format from server');
            }
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            
            return data;
        } catch (error) {
            console.error('Signup API error:', error);
            throw error;
        }
    },

    async getProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get profile');
            }
            
            return response.json();
        } catch (error) {
            console.error('Get profile API error:', error);
            throw error;
        }
    },

    async updateTheme(theme) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/auth/theme`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ theme })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update theme');
            }
            
            return response.json();
        } catch (error) {
            console.error('Update theme API error:', error);
            throw error;
        }
    },

    // Coin endpoints
    async getCoinPackages() {
        try {
            const response = await fetch(`${API_BASE_URL}/coins/packages`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get coin packages');
            }
            
            return response.json();
        } catch (error) {
            console.error('Get coin packages API error:', error);
            throw error;
        }
    },

    async purchaseCoins(packageId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/coins/purchase`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ packageId })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to purchase coins');
            }
            
            return response.json();
        } catch (error) {
            console.error('Purchase coins API error:', error);
            throw error;
        }
    },

    async getTransactionStatus(transactionId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/coins/transaction/${transactionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get transaction status');
            }
            
            return response.json();
        } catch (error) {
            console.error('Get transaction status API error:', error);
            throw error;
        }
    },

    async getTransactionHistory() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/coins/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to get transaction history');
            }
            
            return response.json();
        } catch (error) {
            console.error('Get transaction history API error:', error);
            throw error;
        }
    }
};

// Export the API object
window.api = api; 