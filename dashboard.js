document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Elements
    const userNameElement = document.getElementById('userName');
    const clientCodeElement = document.getElementById('clientCode');
    const userCoinsElement = document.getElementById('userCoins');
    const themeToggle = document.getElementById('themeToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const pricingSection = document.getElementById('pricingSection');
    const welcomeSection = document.getElementById('welcomeSection');
    const logoutButton = document.getElementById('logoutButton');

    // Load user data
    try {
        const userData = await api.getProfile();
        
        // Update UI with user data
        userNameElement.textContent = userData.email.split('@')[0];
        clientCodeElement.textContent = userData.clientCode;
        userCoinsElement.textContent = `${userData.coins} Z Coins`;

        // Set initial theme
        document.documentElement.classList.toggle('dark', userData.theme === 'dark');
        themeToggle.checked = userData.theme === 'dark';
    } catch (error) {
        console.error('Error loading user data:', error);
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
    }

    // Theme toggle
    themeToggle?.addEventListener('change', async () => {
        const isDark = themeToggle.checked;
        document.documentElement.classList.toggle('dark', isDark);
        try {
            await api.updateTheme(isDark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error updating theme:', error);
        }
    });

    // Sidebar toggle for mobile
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
    });

    // Handle navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            
            // Hide all sections
            document.querySelectorAll('section[id$="Section"]').forEach(s => {
                s.classList.add('hidden');
            });

            // Show selected section
            document.getElementById(`${section}Section`)?.classList.remove('hidden');

            // Close sidebar on mobile
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });

    // Load coin packages
    if (pricingSection) {
        try {
            const packages = await api.getCoinPackages();
            const packagesContainer = document.getElementById('coinPackages');
            
            packages.forEach(pkg => {
                const card = document.createElement('div');
                card.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg';
                card.innerHTML = `
                    <h3 class="text-xl font-bold mb-4">${pkg.amount} Z Coins</h3>
                    <p class="text-2xl font-bold mb-6">₹${pkg.price}</p>
                    <button class="buy-now-btn w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                            data-package-id="${pkg.id}">
                        Buy Now
                    </button>
                `;
                packagesContainer.appendChild(card);
            });

            // Handle coin purchase
            packagesContainer.addEventListener('click', async (e) => {
                if (e.target.classList.contains('buy-now-btn')) {
                    const packageId = parseInt(e.target.dataset.packageId);
                    const button = e.target;

                    try {
                        button.disabled = true;
                        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

                        const response = await api.purchaseCoins(packageId);
                        
                        // Poll for transaction status
                        const checkStatus = async () => {
                            const status = await api.getTransactionStatus(response.transactionId);
                            if (status.status === 'completed') {
                                button.innerHTML = '<i class="fas fa-check"></i> Purchase Complete!';
                                // Refresh user data
                                const userData = await api.getProfile();
                                userCoinsElement.textContent = `${userData.coins} Z Coins`;
                                setTimeout(() => {
                                    button.disabled = false;
                                    button.textContent = 'Buy Now';
                                }, 2000);
                            } else if (status.status === 'failed') {
                                button.innerHTML = '<i class="fas fa-times"></i> Purchase Failed';
                                setTimeout(() => {
                                    button.disabled = false;
                                    button.textContent = 'Buy Now';
                                }, 2000);
                            } else {
                                setTimeout(checkStatus, 1000);
                            }
                        };

                        checkStatus();
                    } catch (error) {
                        console.error('Error purchasing coins:', error);
                        button.innerHTML = '<i class="fas fa-times"></i> Error';
                        setTimeout(() => {
                            button.disabled = false;
                            button.textContent = 'Buy Now';
                        }, 2000);
                    }
                }
            });
        } catch (error) {
            console.error('Error loading coin packages:', error);
        }
    }

    // Handle logout
    logoutButton?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/login.html';
    });
}); 