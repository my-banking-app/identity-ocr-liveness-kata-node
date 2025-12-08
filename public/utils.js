const API_URL = '/api';

const Utils = {
    async request(endpoint, method = 'GET', body = null, isFormData = false) {
        const token = localStorage.getItem('accessToken');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers,
        };

        if (body) {
            if (isFormData) {
                options.body = body;
            } else {
                headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/index.html';
                return;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Request failed', error);
            throw error;
        }
    },

    saveAuth(token, user) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    },

    checkAuth() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = '/index.html';
        }
        return JSON.parse(localStorage.getItem('user'));
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    },

    showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.classList.remove('hidden');
            el.classList.add('error', 'alert');
        }
    },

    showSuccess(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.classList.remove('hidden');
            el.classList.add('success', 'alert');
        }
    }
};
