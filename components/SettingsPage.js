// Settings Page Component
function SettingsPage() {
    const [showApiModal, setShowApiModal] = useState(false);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('apify_api_key');
        if (stored) {
            setApiKey(stored);
        }
    }, []);

    const maskKey = (key) => {
        if (!key) return 'لم يتم تعيين مفتاح';
        return key.substring(0, 12) + '******' + key.substring(key.length - 8);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">الإعدادات العامة</h2>
                <p className="text-gray-600 text-lg">إدارة إعدادات النظام والاتصالات الخارجية</p>
            </div>

            <div className="space-y-6">
                {/* API Key Settings */}
                <div className="info-card p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-key text-blue-600 ml-2"></i>
                        إعدادات Apify API
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">المفتاح الحالي</h4>
                            <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                                {maskKey(apiKey)}
                            </div>
                        </div>
                        
                        <div className="flex flex-col justify-center space-y-3">
                            <button
                                onClick={() => setShowApiModal(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <i className="fas fa-edit ml-2"></i>
                                تعديل المفتاح
                            </button>
                            
                            {apiKey && (
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('apify_api_key');
                                        setApiKey('');
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    <i className="fas fa-trash ml-2"></i>
                                    حذف المفتاح
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                            <i className="fas fa-exclamation-triangle ml-2"></i>
                            معلومات مهمة
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• مفتاح API مطلوب لاستخدام ميزة القشط المباشر</li>
                            <li>• يمكنك الحصول على المفتاح من console.apify.com</li>
                            <li>• المفتاح محفوظ محلياً ولن يتم مشاركته</li>
                        </ul>
                    </div>
                </div>

                {/* Storage Settings */}
                <div className="info-card p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-database text-green-600 ml-2"></i>
                        إدارة التخزين
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">استخدام التخزين</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>الجلسات المحفوظة:</span>
                                    <span>{JSON.parse(localStorage.getItem('facebook_sessions') || '[]').length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>حجم البيانات:</span>
                                    <span>{(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col justify-center">
                            <button
                                onClick={() => {
                                    if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
                                        localStorage.clear();
                                        location.reload();
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <i className="fas fa-eraser ml-2"></i>
                                مسح جميع البيانات
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="info-card p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <i className="fas fa-info-circle text-purple-600 ml-2"></i>
                        معلومات النظام
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">الإصدار</h4>
                            <p className="text-gray-600">Facebook Archive System v1.0.0</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">آخر تحديث</h4>
                            <p className="text-gray-600">2025-01-28</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">المطور</h4>
                            <p className="text-gray-600">نظام الاستخبارات الرقمية</p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">الحالة</h4>
                            <p className="text-green-600 font-semibold">نشط</p>
                        </div>
                    </div>
                </div>
            </div>

            <ApiKeyManager 
                isOpen={showApiModal} 
                onClose={() => setShowApiModal(false)} 
            />
        </div>
    );
}

window.SettingsPage = SettingsPage;