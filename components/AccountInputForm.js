// Account Input Form Component for Multiple Facebook URLs
function AccountInputForm({ onStartCrawling }) {
    const [accounts, setAccounts] = useState([{ url: '', postsLimit: 300 }]);
    const [fullName, setFullName] = useState('');
    const [errors, setErrors] = useState({});
    const [isValidating, setIsValidating] = useState(false);

    const validateFacebookUrl = (url) => {
        if (!url.trim()) return 'يرجى إدخال رابط الحساب';
        
        const fbUrlPattern = /^https?:\/\/(www\.)?(facebook\.com|fb\.com|m\.facebook\.com)\/.+/i;
        if (!fbUrlPattern.test(url)) {
            return 'يرجى إدخال رابط فيسبوك صحيح';
        }
        
        // Check if it's a valid profile/page URL
        if (url.includes('/posts/') || url.includes('/photos/') || url.includes('/videos/')) {
            return 'يرجى إدخال رابط الصفحة الرئيسية وليس منشور محدد';
        }
        
        return null;
    };

    const addAccount = () => {
        setAccounts([...accounts, { url: '', postsLimit: 300 }]);
    };

    const removeAccount = (index) => {
        if (accounts.length > 1) {
            const newAccounts = accounts.filter((_, i) => i !== index);
            setAccounts(newAccounts);
            
            // Clear errors for removed account
            const newErrors = { ...errors };
            delete newErrors[`url_${index}`];
            delete newErrors[`limit_${index}`];
            setErrors(newErrors);
        }
    };

    const updateAccount = (index, field, value) => {
        const newAccounts = [...accounts];
        newAccounts[index][field] = value;
        setAccounts(newAccounts);
        
        // Clear error for this field
        const errorKey = `${field}_${index}`;
        if (errors[errorKey]) {
            const newErrors = { ...errors };
            delete newErrors[errorKey];
            setErrors(newErrors);
        }
    };

    const validateAll = () => {
        const newErrors = {};
        let hasErrors = false;

        accounts.forEach((account, index) => {
            // Validate URL
            const urlError = validateFacebookUrl(account.url);
            if (urlError) {
                newErrors[`url_${index}`] = urlError;
                hasErrors = true;
            }

            // Validate posts limit
            if (!account.postsLimit || account.postsLimit < 1 || account.postsLimit > 1000) {
                newErrors[`limit_${index}`] = 'العدد يجب أن يكون بين 1 و 1000';
                hasErrors = true;
            }
        });

        // Check for duplicate URLs
        const urls = accounts.map(acc => acc.url.trim().toLowerCase());
        const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
        if (duplicates.length > 0) {
            accounts.forEach((account, index) => {
                if (duplicates.includes(account.url.trim().toLowerCase())) {
                    newErrors[`url_${index}`] = 'هذا الرابط مكرر';
                    hasErrors = true;
                }
            });
        }

        setErrors(newErrors);
        return !hasErrors;
    };

    const handleStartCrawling = async () => {
        if (!validateAll()) return;

        // Check API key
        const apiKey = localStorage.getItem('apify_api_key');
        if (!apiKey) {
            const errorModal = document.createElement('div');
            errorModal.className = 'modal-overlay';
            errorModal.innerHTML = `
                <div class="modal-content">
                    <div class="text-center">
                        <div class="text-orange-500 text-6xl mb-4">
                            <i class="fas fa-key"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">مفتاح API مطلوب</h3>
                        <p class="text-gray-600 mb-4">يرجى إدخال مفتاح Apify API أولاً من الإعدادات</p>
                        <button onclick="this.closest('.modal-overlay').remove()" class="bg-orange-500 text-white px-6 py-2 rounded-lg">
                            حسناً
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorModal);
            return;
        }

        setIsValidating(true);
        
        // Final validation and start crawling
        const validAccounts = accounts.map(acc => ({
            url: acc.url.trim(),
            postsLimit: parseInt(acc.postsLimit),
            fullName: fullName.trim() || null
        }));

        await onStartCrawling(validAccounts, fullName);
        setIsValidating(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">القشط المباشر من فيسبوك</h2>
                <p className="text-gray-600 text-lg">أدخل روابط حسابات فيسبوك للحصول على البيانات مباشرة</p>
            </div>

            <div className="info-card p-8 fade-in">
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-gray-700 font-semibold mb-2">
                        <i className="fas fa-user ml-2"></i>
                        الاسم الكامل (اختياري)
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="اسم الشخص أو الجهة المستهدفة..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-blue-600 mt-1">
                        سيتم استخدام هذا الاسم في التقرير النهائي والتحليل الاستخباراتي
                    </p>
                </div>

                <div className="space-y-6">
                    {accounts.map((account, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    <i className="fab fa-facebook text-blue-600 ml-2"></i>
                                    حساب #{index + 1}
                                </h3>
                                {accounts.length > 1 && (
                                    <button
                                        onClick={() => removeAccount(index)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        <i className="fas fa-link ml-2"></i>
                                        رابط حساب فيسبوك
                                    </label>
                                    <input
                                        type="url"
                                        value={account.url}
                                        onChange={(e) => updateAccount(index, 'url', e.target.value)}
                                        placeholder="https://www.facebook.com/username"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors[`url_${index}`] ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors[`url_${index}`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`url_${index}`]}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        <i className="fas fa-hashtag ml-2"></i>
                                        عدد المنشورات
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={account.postsLimit}
                                        onChange={(e) => updateAccount(index, 'postsLimit', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            errors[`limit_${index}`] ? 'border-red-400' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors[`limit_${index}`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`limit_${index}`]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={addAccount}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                    >
                        <i className="fas fa-plus ml-2"></i>
                        إضافة حساب آخر
                    </button>

                    <button
                        onClick={handleStartCrawling}
                        disabled={isValidating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center disabled:opacity-50"
                    >
                        {isValidating ? (
                            <>
                                <div className="loading-spinner w-5 h-5 ml-2"></div>
                                جاري التحقق...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-download ml-2"></i>
                                بدء القشط ({accounts.length} حساب)
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">
                        <i className="fas fa-info-circle ml-2"></i>
                        تعليمات مهمة
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• استخدم روابط الصفحات الرئيسية فقط (ليس منشورات محددة)</li>
                        <li>• العدد الأقصى للمنشورات: 1000 لكل حساب</li>
                        <li>• ستستغرق العملية 2-5 دقائق لكل حساب</li>
                        <li>• تأكد من اتصال إنترنت مستقر</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

window.AccountInputForm = AccountInputForm;