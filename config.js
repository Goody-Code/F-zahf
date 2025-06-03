// Application Configuration
const CONFIG = {
    // Supabase Configuration
    supabase: {
        url: 'https://your-project.supabase.co',
        key: 'your-anon-key'
    },
    
    // App Settings
    app: {
        name: 'أرشيف فيسبوك',
        version: '1.0.0',
        description: 'نظام إدارة البيانات الشخصية',
        author: 'Facebook Archive System',
        rtl: true,
        language: 'ar'
    },
    
    // Feature Flags
    features: {
        offlineMode: true,
        pdfExport: true,
        dataValidation: true,
        autoSave: true
    },
    
    // UI Configuration
    ui: {
        theme: 'light',
        primaryColor: '#1877f2',
        fontFamily: 'Cairo',
        animation: {
            duration: 300,
            easing: 'ease-in-out'
        }
    },
    
    // API Endpoints
    api: {
        baseUrl: '/api/v1',
        timeout: 30000
    },
    
    // File Upload Settings
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/json'],
        chunkSize: 1024 * 1024 // 1MB
    },
    
    // PDF Export Settings
    pdf: {
        format: 'a4',
        orientation: 'portrait',
        margin: 20,
        quality: 2
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}