// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpBNXPgfC8oKwH_hcESZd1OSjxkuZ3qP8",
  authDomain: "cmanagementweb-53319.firebaseapp.com",
  projectId: "cmanagementweb-53319",
  storageBucket: "cmanagementweb-53319.firebasestorage.app",
  messagingSenderId: "98416562035",
  appId: "1:98416562035:web:f083d012b694d971d17f06",
  measurementId: "G-NG15WBG6EH"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const errorToast = new bootstrap.Toast(document.getElementById('errorToast'));

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Show loading state
    loginText.textContent = 'Signing in...';
    loginSpinner.style.display = 'inline-block';
    loginBtn.disabled = true;
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Check for custom claims (admin role)
        const idTokenResult = await userCredential.user.getIdTokenResult();
        
        if (idTokenResult.claims.admin) {
            window.location.href = 'dashboard.html';
        } else {
            // Regular user - redirect to appropriate page
            window.location.href = 'add_student.html';
        }
        
    } catch (error) {
        console.error("Login error:", error);
        showError(getErrorMessage(error.code));
        
        // Reset button state
        loginText.textContent = 'Sign In';
        loginSpinner.style.display = 'none';
        loginBtn.disabled = false;
    }
});

// Error message mapping
function getErrorMessage(code) {
    const messages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'Account disabled',
        'auth/user-not-found': 'Account not found',
        'auth/wrong-password': 'Incorrect password',
        'auth/too-many-requests': 'Too many attempts. Try again later',
        'auth/network-request-failed': 'Network error. Check your connection'
    };
    return messages[code] || 'Login failed. Please try again.';
}

// Show error toast
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    errorToast.show();
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in, redirect to dashboard
        window.location.href = 'html/dashboardown.html';
    }
});
