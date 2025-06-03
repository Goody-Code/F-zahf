// API Key Management Component
function ApiKeyManager({ isOpen, onClose }) {
    const [apiKey, setApiKey] = useState('');
    const [savedKey, setSavedKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const stored = localStorage.getItem('apify_api_key');
            if (stored) {
                setSavedKey(stored);
                setApiKey(stored);
            }
        }
    }, [isOpen]);

    const maskKey = (key) => {
        if (!key) return '';
        return key.substring(0, 12) + '******' + key.substring(key.length - 8);
    };

    const saveApiKey = () => {
        if (!apiKey.trim()) {
            alert('يرجى إدخال مفتاح API صحيح');
            return;
        }
        
        if (!apiKey.startsWith('apify_api_')) {
            alert('مفتاح API يجب أن يبدأ بـ apify_api_');
            return;
        }

        localStorage.setItem('apify_api_key', apiKey.trim());
        setSavedKey(apiKey.trim());
        
        // Show success modal
        const successModal = document.createElement('div');
        successModal.className = 'modal-overlay';
        successModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-green-500 text-6xl mb-4">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">تم حفظ المفتاح بنجاح</h3>
                    <p class="text-gray-600 mb-4">يمكنك الآن استخدام ميزة القشط المباشر</p>
                    <button onclick="this.closest('.modal-overlay').remove()" class="bg-green-500 text-white px-6 py-2 rounded-lg">
                        حسناً
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
        setTimeout(() => successModal.remove(), 2000);
        
        onClose();
    };

    const deleteApiKey = () => {
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal-overlay';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-red-500 text-6xl mb-4">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">حذف مفتاح API</h3>
                    <p class="text-gray-600 mb-4">هل أنت متأكد من حذف مفتاح API؟</p>
                    <div class="flex gap-4 justify-center">
                        <button onclick="this.closest('.modal-overlay').remove()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">
                            إلغاء
                        </button>
                        <button onclick="confirmDelete()" class="bg-red-500 text-white px-6 py-2 rounded-lg">
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        window.confirmDelete = () => {
            localStorage.removeItem('apify_api_key');
            setApiKey('');
            setSavedKey('');
            confirmModal.remove();
            onClose();
        };
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">إعدادات Apify API</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <i className="fas fa-times text-xl"></i>
                    </button>
                </div>

                <div className="space-y-4">
                    {savedKey && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">
                                <i className="fas fa-key ml-2"></i>
                                المفتاح المحفوظ
                            </h4>
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-sm text-green-700">
                                    {showKey ? savedKey : maskKey(savedKey)}
                                </span>
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="text-green-600 hover:text-green-800"
                                >
                                    <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            <i className="fas fa-key ml-2"></i>
                            مفتاح Apify API
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="apify_api_..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            يمكنك الحصول على المفتاح من console.apify.com
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={saveApiKey}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors"
                        >
                            <i className="fas fa-save ml-2"></i>
                            حفظ المفتاح
                        </button>
                        {savedKey && (
                            <button
                                onClick={deleteApiKey}
                                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">
                            <i className="fas fa-info-circle ml-2"></i>
                            معلومات مهمة
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• المفتاح محفوظ محلياً في متصفحك</li>
                            <li>• لن يتم مشاركته مع أي طرف ثالث</li>
                            <li>• يُستخدم فقط لعمليات القشط</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.ApiKeyManager = ApiKeyManager;

