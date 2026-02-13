// Configuration Template
// نسخ هذا الملف وإعادة تسميته إلى config.js
// ثم قم بتعديل القيم بإعداداتك الخاصة

// Firebase Configuration
// احصل على هذه المعلومات من: https://console.firebase.google.com
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Telegram Bot Configuration
// كيفية الحصول على هذه المعلومات:
// 1. Bot Token: أنشئ بوت عبر @BotFather على تليجرام
// 2. Chat ID: أرسل رسالة لبوتك ثم افتح:
//    https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
const TELEGRAM_CONFIG = {
    botToken: "YOUR_BOT_TOKEN",
    chatId: "YOUR_CHAT_ID"
};

// Bit.ly Configuration
// احصل على Access Token من: https://app.bitly.com/settings/api/
const BITLY_CONFIG = {
    accessToken: "YOUR_BITLY_ACCESS_TOKEN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Constants
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes

// ملاحظات:
// 1. لا تشارك هذا الملف علناً بعد إضافة بياناتك الحقيقية
// 2. تأكد من تفعيل Authentication و Firestore في مشروع Firebase
// 3. تأكد من أن البوت لديه صلاحيات إرسال الملفات
// 4. تأكد من صحة جميع المفاتيح قبل الاختبار