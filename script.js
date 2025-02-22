// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.md\\:hidden');
    const header = document.querySelector('header');
    let mobileMenu = null;

    // Create mobile menu
    function createMobileMenu() {
        const menu = document.createElement('div');
        menu.className = 'mobile-menu fixed top-0 right-0 w-4/5 h-full bg-white shadow-lg z-50 transform translate-x-full transition-transform duration-300 ease-in-out';
        menu.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-8">
                    <div class="text-2xl font-bold">AlgoZ</div>
                    <button class="mobile-close">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <nav class="space-y-4">
                    <a href="#features" class="block py-2 hover:text-blue-600">Features</a>
                    <a href="#brokers" class="block py-2 hover:text-blue-600">Broker Integration</a>
                    <a href="#bots" class="block py-2 hover:text-blue-600">Trading Bots</a>
                    <a href="login.html" class="block py-2 hover:text-blue-600">Login</a>
                    <a href="signup.html" class="block bg-blue-600 text-white px-6 py-2 rounded-full text-center hover:bg-blue-700 transition duration-300">Sign Up</a>
                </nav>
            </div>
        `;
        document.body.appendChild(menu);
        return menu;
    }

    // Toggle mobile menu
    function toggleMobileMenu() {
        if (!mobileMenu) {
            mobileMenu = createMobileMenu();
            const closeButton = mobileMenu.querySelector('.mobile-close');
            closeButton.addEventListener('click', toggleMobileMenu);
        }

        mobileMenu.classList.toggle('translate-x-full');
        document.body.classList.toggle('overflow-hidden');
    }

    mobileMenuButton.addEventListener('click', toggleMobileMenu);

    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('shadow-md');
            return;
        }
        
        if (currentScroll > lastScroll) {
            // Scrolling down
            header.classList.add('-translate-y-full');
            header.classList.add('transition-transform');
            header.classList.add('duration-300');
        } else {
            // Scrolling up
            header.classList.remove('-translate-y-full');
            header.classList.add('shadow-md');
        }
        
        lastScroll = currentScroll;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
                    toggleMobileMenu();
                }
            }
        });
    });

    // Add loading state to buttons
    document.querySelectorAll('a[href="#"], button:not(.mobile-close)').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('btn-loading')) return;
            
            const isSignUp = this.textContent.trim().toLowerCase() === 'sign up';
            if (isSignUp) {
                e.preventDefault();
                this.classList.add('btn-loading');
                
                // Simulate loading state
                setTimeout(() => {
                    this.classList.remove('btn-loading');
                }, 1500);
            }
        });
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}); 