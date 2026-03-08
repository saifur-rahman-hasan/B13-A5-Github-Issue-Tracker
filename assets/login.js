// Fixed credentials for login
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'admin123';

// Get form element and input fields
const loginForm = document.querySelector('form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Function to display error message
function displayError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = `
        <p class="font-bold">Error</p>
        <p>${message}</p>
    `;

    // Insert error message after the form
    loginForm.insertAdjacentElement('afterend', errorDiv);

    // Auto-remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Function to clear error message
function clearError() {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
}

// Handle form submission
loginForm.addEventListener('submit', function(event) {
    // Prevent default form submission
    event.preventDefault();

    // Clear any existing errors
    clearError();

    // Get input values and trim whitespace
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate that fields are not empty
    if (!username || !password) {
        displayError('Please enter both username and password.');
        return;
    }

    // Check credentials
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        // Credentials are correct - redirect to issue tracker page
        window.location.href = 'issue-tracker.html';
    } else {
        // Credentials are incorrect - display error
        displayError('Invalid username or password. Please try again.');
        
        // Clear password field for security
        passwordInput.value = '';
        passwordInput.focus();
    }
});

// Clear error message when user starts typing
usernameInput.addEventListener('input', clearError);
passwordInput.addEventListener('input', clearError);
