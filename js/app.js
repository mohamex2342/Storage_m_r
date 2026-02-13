// Main App Initialization

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Cloud Hunter App Initialized');
    
    // Initialize upload zone
    initializeUploadZone();
    
    // Add keyboard shortcuts
    addKeyboardShortcuts();
    
    // Check for service worker support
    if ('serviceWorker' in navigator) {
        // Register service worker for PWA capabilities (optional)
        // navigator.serviceWorker.register('/sw.js');
    }
    
    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add online/offline listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initialize tooltips
    initializeTooltips();
});

// Handle Visibility Change
function handleVisibilityChange() {
    if (document.hidden) {
        console.log('App hidden');
    } else {
        console.log('App visible');
        // Refresh files if user is authenticated
        if (isAuthenticated() && document.querySelector('.tab-btn[data-tab="files"]').classList.contains('active')) {
            loadUserFiles();
        }
    }
}

// Handle Online
function handleOnline() {
    showToast('تم الاتصال بالإنترنت', 'success');
}

// Handle Offline
function handleOffline() {
    showToast('لا يوجد اتصال بالإنترنت', 'warning');
}

// Add Keyboard Shortcuts
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K: Focus search (if implemented)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Focus search input if exists
        }
        
        // Ctrl/Cmd + U: Open upload
        if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
            e.preventDefault();
            if (isAuthenticated()) {
                switchTab('upload');
            }
        }
        
        // Ctrl/Cmd + F: Open files
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            if (isAuthenticated()) {
                switchTab('files');
            }
        }
        
        // Escape: Close modals/overlays
        if (e.key === 'Escape') {
            // Close any open modals
        }
    });
}

// Initialize Tooltips
function initializeTooltips() {
    // Add tooltips to buttons and elements
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    
    elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

// Show Tooltip
function showTooltip(e) {
    const element = e.currentTarget;
    const tooltipText = element.dataset.tooltip;
    
    if (!tooltipText) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    tooltip.id = 'active-tooltip';
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
}

// Hide Tooltip
function hideTooltip() {
    const tooltip = document.getElementById('active-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Handle Errors Globally
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    
    // Don't show error toast for every little thing
    // Only for critical errors
    if (e.error && e.error.message && !e.error.message.includes('ResizeObserver')) {
        // showToast('حدث خطأ غير متوقع', 'error');
    }
});

// Handle Unhandled Promise Rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Don't show error for network errors (they're handled elsewhere)
    if (e.reason && e.reason.message && !e.reason.message.includes('network')) {
        // showToast('حدث خطأ في العملية', 'error');
    }
});

// Prevent default drag and drop on document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Log app version and info
console.log(`
╔════════════════════════════════════════╗
║     🌌 CLOUD HUNTER v1.0             ║
║     التخزين السحابي المستقبلي        ║
║                                        ║
║     Developed by: General MRT          ║
║     Telegram: @General_MRT             ║
╚════════════════════════════════════════╝
`);

// Export functions for global access
window.cloudHunter = {
    switchTab,
    loadUserFiles,
    refreshFiles,
    logout,
    getCurrentUser,
    isAuthenticated
};

// Performance monitoring (optional)
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page loaded in ${pageLoadTime}ms`);
    });
}