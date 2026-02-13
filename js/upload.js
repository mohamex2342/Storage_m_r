// Upload Module

let selectedFile = null;

// Initialize Upload Zone
function initializeUploadZone() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');

    // Click to select file
    uploadZone.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });

    // Drag and Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    });
}

// Handle File Selection
function handleFileSelect(file) {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        showToast('حجم الملف يتجاوز الحد المسموح (2 جيجابايت)', 'error');
        return;
    }

    selectedFile = file;
    uploadFile(file);
}

// Upload File to Telegram
async function uploadFile(file) {
    const user = auth.currentUser;
    if (!user) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        return;
    }

    // Show progress
    const progressContainer = document.getElementById('upload-progress');
    const fileNameElement = document.getElementById('file-name');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    const uploadStatus = document.getElementById('upload-status');

    progressContainer.classList.remove('hidden');
    fileNameElement.textContent = file.name;
    uploadStatus.textContent = 'جاري الرفع...';
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('document', file);
        formData.append('chat_id', TELEGRAM_CONFIG.chatId);
        formData.append('caption', `📁 ${file.name}\n👤 ${user.email}\n📅 ${new Date().toLocaleString('ar-EG')}`);

        // Upload to Telegram
        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendDocument`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (!data.ok) {
            throw new Error(data.description || 'فشل رفع الملف');
        }

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = progress + '%';
                progressPercent.textContent = progress + '%';
            }
        }, 100);

        // Get file info from Telegram response
        const document = data.result.document;
        const fileId = document.file_id;
        
        // Get file download link
        const fileResponse = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/getFile?file_id=${fileId}`
        );
        const fileData = await fileResponse.json();
        
        if (!fileData.ok) {
            throw new Error('فشل الحصول على رابط الملف');
        }

        const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_CONFIG.botToken}/${fileData.result.file_path}`;

        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressPercent.textContent = '100%';
        uploadStatus.textContent = 'جاري حفظ البيانات...';

        // Save file info to Firestore
        await db.collection('files').add({
            userId: user.uid,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileId: fileId,
            fileUrl: fileUrl,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
            telegram: {
                fileId: fileId,
                filePath: fileData.result.file_path
            }
        });

        // Update user files count
        await db.collection('users').doc(user.uid).update({
            filesCount: firebase.firestore.FieldValue.increment(1)
        });

        uploadStatus.textContent = 'تم الرفع بنجاح! ✅';
        showToast('تم رفع الملف بنجاح! 🎉', 'success');

        // Reset after 2 seconds
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            selectedFile = null;
            document.getElementById('file-input').value = '';
            loadUserFiles();
        }, 2000);

    } catch (error) {
        console.error('Upload error:', error);
        uploadStatus.textContent = 'فشل الرفع ❌';
        showToast('حدث خطأ أثناء رفع الملف: ' + error.message, 'error');
        
        setTimeout(() => {
            progressContainer.classList.add('hidden');
        }, 3000);
    }
}