// Files Management Module

// Load User Files
async function loadUserFiles() {
    const user = auth.currentUser;
    if (!user) return;

    const filesContainer = document.getElementById('files-container');
    filesContainer.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>جاري تحميل الملفات...</p>
        </div>
    `;

    try {
        const filesSnapshot = await db.collection('files')
            .where('userId', '==', user.uid)
            .orderBy('uploadedAt', 'desc')
            .get();

        if (filesSnapshot.empty) {
            filesContainer.innerHTML = `
                <div class="no-files">
                    <i class="fas fa-folder-open"></i>
                    <h3>لا توجد ملفات حتى الآن</h3>
                    <p>قم برفع ملفاتك من قسم "رفع الملفات"</p>
                </div>
            `;
            return;
        }

        filesContainer.innerHTML = '';
        
        filesSnapshot.forEach((doc) => {
            const fileData = doc.data();
            const fileCard = createFileCard(doc.id, fileData);
            filesContainer.appendChild(fileCard);
        });

    } catch (error) {
        console.error('Error loading files:', error);
        filesContainer.innerHTML = `
            <div class="no-files">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>حدث خطأ أثناء تحميل الملفات</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// Create File Card
function createFileCard(fileId, fileData) {
    const card = document.createElement('div');
    card.className = 'file-card';
    
    // Get file icon based on type
    const icon = getFileIcon(fileData.fileType, fileData.fileName);
    
    // Format file size
    const fileSize = formatFileSize(fileData.fileSize);
    
    // Format date
    const uploadDate = fileData.uploadedAt ? 
        fileData.uploadedAt.toDate().toLocaleDateString('ar-EG') : 
        'غير متوفر';
    
    card.innerHTML = `
        <div class="file-icon">
            <i class="${icon}"></i>
        </div>
        <div class="file-name">${fileData.fileName}</div>
        <div class="file-meta">
            <span><i class="fas fa-hdd"></i> ${fileSize}</span>
            <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
        </div>
        <div class="file-actions">
            <button class="cyber-btn primary" onclick="downloadFile('${fileData.fileUrl}', '${fileData.fileName}')">
                <i class="fas fa-download"></i>
                تحميل
            </button>
            <button class="cyber-btn secondary" onclick="copyShortLink('${fileData.fileUrl}', '${fileId}')">
                <i class="fas fa-link"></i>
                نسخ
            </button>
            <button class="cyber-btn secondary small" onclick="deleteFile('${fileId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Get File Icon
function getFileIcon(fileType, fileName) {
    if (!fileType && fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        
        const iconMap = {
            // Images
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image',
            'bmp': 'fas fa-file-image',
            'svg': 'fas fa-file-image',
            // Videos
            'mp4': 'fas fa-file-video',
            'avi': 'fas fa-file-video',
            'mov': 'fas fa-file-video',
            'mkv': 'fas fa-file-video',
            'wmv': 'fas fa-file-video',
            // Audio
            'mp3': 'fas fa-file-audio',
            'wav': 'fas fa-file-audio',
            'ogg': 'fas fa-file-audio',
            'flac': 'fas fa-file-audio',
            // Documents
            'pdf': 'fas fa-file-pdf',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'xls': 'fas fa-file-excel',
            'xlsx': 'fas fa-file-excel',
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint',
            'txt': 'fas fa-file-alt',
            // Archives
            'zip': 'fas fa-file-archive',
            'rar': 'fas fa-file-archive',
            '7z': 'fas fa-file-archive',
            'tar': 'fas fa-file-archive',
            'gz': 'fas fa-file-archive',
            // Code
            'html': 'fas fa-file-code',
            'css': 'fas fa-file-code',
            'js': 'fas fa-file-code',
            'json': 'fas fa-file-code',
            'xml': 'fas fa-file-code',
            'php': 'fas fa-file-code',
            'py': 'fas fa-file-code'
        };
        
        return iconMap[ext] || 'fas fa-file';
    }
    
    if (fileType) {
        if (fileType.startsWith('image/')) return 'fas fa-file-image';
        if (fileType.startsWith('video/')) return 'fas fa-file-video';
        if (fileType.startsWith('audio/')) return 'fas fa-file-audio';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('word')) return 'fas fa-file-word';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
        if (fileType.includes('zip') || fileType.includes('compressed')) return 'fas fa-file-archive';
        if (fileType.includes('text')) return 'fas fa-file-alt';
    }
    
    return 'fas fa-file';
}

// Format File Size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Download File
function downloadFile(fileUrl, fileName) {
    showToast('جاري فتح رابط التحميل...', 'info');
    window.open(fileUrl, '_blank');
}

// Copy Short Link
async function copyShortLink(fileUrl, fileId) {
    showLoading('جاري اختصار الرابط...');
    
    try {
        // Check if we already have a short link
        const fileDoc = await db.collection('files').doc(fileId).get();
        const fileData = fileDoc.data();
        
        if (fileData.shortUrl) {
            // Use existing short link
            await navigator.clipboard.writeText(fileData.shortUrl);
            hideLoading();
            showToast('تم نسخ الرابط المختصر! 📋', 'success');
            return;
        }
        
        // Create short link using Bit.ly
        const shortUrl = await shortenUrl(fileUrl);
        
        // Save short URL to Firestore
        await db.collection('files').doc(fileId).update({
            shortUrl: shortUrl
        });
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shortUrl);
        hideLoading();
        showToast('تم نسخ الرابط المختصر! 📋', 'success');
        
    } catch (error) {
        console.error('Error creating short link:', error);
        hideLoading();
        
        // Fallback: copy original URL
        try {
            await navigator.clipboard.writeText(fileUrl);
            showToast('تم نسخ الرابط الأصلي', 'warning');
        } catch (clipboardError) {
            showToast('فشل نسخ الرابط', 'error');
        }
    }
}

// Shorten URL using Bit.ly
async function shortenUrl(longUrl) {
    try {
        const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BITLY_CONFIG.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                long_url: longUrl
            })
        });
        
        const data = await response.json();
        
        if (data.link) {
            return data.link;
        } else {
            throw new Error('فشل اختصار الرابط');
        }
    } catch (error) {
        console.error('Bit.ly error:', error);
        throw error;
    }
}

// Delete File
async function deleteFile(fileId) {
    if (!confirm('هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    showLoading('جاري حذف الملف...');
    
    try {
        const user = auth.currentUser;
        
        // Delete from Firestore
        await db.collection('files').doc(fileId).delete();
        
        // Update user files count
        await db.collection('users').doc(user.uid).update({
            filesCount: firebase.firestore.FieldValue.increment(-1)
        });
        
        hideLoading();
        showToast('تم حذف الملف بنجاح', 'success');
        
        // Reload files
        loadUserFiles();
        
    } catch (error) {
        console.error('Error deleting file:', error);
        hideLoading();
        showToast('حدث خطأ أثناء حذف الملف', 'error');
    }
}

// Refresh Files
function refreshFiles() {
    showToast('جاري تحديث الملفات...', 'info');
    loadUserFiles();
}