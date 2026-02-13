// Authentication Module

// Check auth state on page load
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showApp(user);
    } else {
        // User is signed out
        showAuth();
    }
});

// Switch to Signup Form
function switchToSignup() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
    document.getElementById('reset-form').classList.remove('active');
}

// Switch to Login Form
function switchToLogin() {
    document.getElementById('login-form').classList.add('active');
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('reset-form').classList.remove('active');
}

// Show Reset Password Form
function showResetPassword() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('reset-form').classList.add('active');
}

// Login Function
async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    // Validation
    if (!email || !password) {
        showToast('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 'error');
        return;
    }

    showLoading('جاري تسجيل الدخول...');

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showToast('تم تسجيل الدخول بنجاح! 🎉', 'success');
        // Auth state change will handle UI update
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Signup Function
async function signup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showToast('الرجاء ملء جميع الحقول', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('كلمة المرور غير متطابقة', 'error');
        return;
    }

    showLoading('جاري إنشاء الحساب...');

    try {
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update profile with name
        await user.updateProfile({
            displayName: name
        });

        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            filesCount: 0
        });

        showToast('تم إنشاء الحساب بنجاح! 🎉', 'success');
        // Auth state change will handle UI update
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Reset Password Function
async function resetPassword() {
    const email = document.getElementById('reset-email').value.trim();

    if (!email) {
        showToast('الرجاء إدخال البريد الإلكتروني', 'error');
        return;
    }

    showLoading('جاري إرسال رابط إعادة التعيين...');

    try {
        await auth.sendPasswordResetEmail(email);
        hideLoading();
        showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني', 'success');
        setTimeout(() => {
            switchToLogin();
        }, 2000);
    } catch (error) {
        hideLoading();
        handleAuthError(error);
    }
}

// Logout Function
async function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        showLoading('جاري تسجيل الخروج...');
        try {
            await auth.signOut();
            showToast('تم تسجيل الخروج بنجاح', 'success');
            // Auth state change will handle UI update
        } catch (error) {
            hideLoading();
            showToast('حدث خطأ أثناء تسجيل الخروج', 'error');
        }
    }
}

// Show App Screen
function showApp(user) {
    hideLoading();
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    
    // Update user name
    const userName = user.displayName || user.email.split('@')[0];
    document.getElementById('user-name').textContent = userName;
    
    // Load user files
    loadUserFiles();
}

// Show Auth Screen
function showAuth() {
    hideLoading();
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('app-screen').classList.remove('active');
    
    // Clear forms
    clearAuthForms();
}

// Clear Auth Forms
function clearAuthForms() {
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm-password').value = '';
    document.getElementById('reset-email').value = '';
}

// Handle Auth Errors
function handleAuthError(error) {
    console.error('Auth error:', error);
    
    let message = 'حدث خطأ غير متوقع';
    
    switch (error.code) {
        case 'auth/email-already-in-use':
            message = 'البريد الإلكتروني مستخدم بالفعل';
            break;
        case 'auth/invalid-email':
            message = 'البريد الإلكتروني غير صحيح';
            break;
        case 'auth/operation-not-allowed':
            message = 'العملية غير مسموح بها';
            break;
        case 'auth/weak-password':
            message = 'كلمة المرور ضعيفة جداً';
            break;
        case 'auth/user-disabled':
            message = 'هذا الحساب معطل';
            break;
        case 'auth/user-not-found':
            message = 'البريد الإلكتروني غير مسجل';
            break;
        case 'auth/wrong-password':
            message = 'كلمة المرور غير صحيحة';
            break;
        case 'auth/too-many-requests':
            message = 'محاولات كثيرة جداً. حاول لاحقاً';
            break;
        case 'auth/network-request-failed':
            message = 'خطأ في الاتصال بالإنترنت';
            break;
        default:
            message = error.message;
    }
    
    showToast(message, 'error');
}