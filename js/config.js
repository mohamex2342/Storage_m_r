// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxdASHknRYzzHqXQ7zFH5VFZVK_SjrVmI",
    authDomain: "hunter-8ce43.firebaseapp.com",
    projectId: "hunter-8ce43",
    storageBucket: "hunter-8ce43.appspot.com",
    messagingSenderId: "hunter-8ce43",
    appId: "hunter-8ce43"
};

// Telegram Bot Configuration
const TELEGRAM_CONFIG = {
    botToken: "8504436823:AAGtOM8nmDoAGAKazGxUvgo5VuOKDxlv1TA",
    chatId: "7061549022"
};

// Bit.ly Configuration
const BITLY_CONFIG = {
    accessToken: "0e72662aabbe540ce5fe5270d7b05fa609fde556"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Constants
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes