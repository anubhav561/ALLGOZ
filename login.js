document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Handle login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            const response = await api.login(email, password);

            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('userData', JSON.stringify(response.user));
                window.location.href = 'dashboard.html';
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Login';
        }
    });

    // Handle signup form submission
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const phone = document.getElementById('signupPhone').value;
        const submitButton = signupForm.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

            const response = await api.signup(email, password, phone);

            if (response.token) {
                successMessage.textContent = 'Account created successfully! Redirecting to login...';
                successMessage.classList.remove('hidden');
                errorMessage.classList.add('hidden');

                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                throw new Error(response.message || 'Signup failed');
            }
        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
            successMessage.classList.add('hidden');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
    });
}); 