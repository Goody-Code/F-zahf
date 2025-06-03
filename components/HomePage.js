// Home Page Component - Enhanced for Multi-Account Support
function HomePage({ setSessionData, setCurrentPage, saveSession, loading, setLoading }) {
    const [name, setName] = useState('');
    const [method, setMethod] = useState('crawl'); // Default to crawl
    const [errors, setErrors] = useState({});
    const [showCrawlerModal, setShowCrawlerModal] = useState(false);
    const [crawlerAccounts, setCrawlerAccounts] = useState([]);
    
    // Multi-account upload state
    const [uploadAccounts, setUploadAccounts] = useState([
        { profileFile: null, postsFile: null, accountName: '' }
    ]);

    const addUploadAccount = () => {
        setUploadAccounts([...uploadAccounts, { profileFile: null, postsFile: null, accountName: '' }]);
    };

    const removeUploadAccount = (index) => {
        if (uploadAccounts.length > 1) {
            const newAccounts = uploadAccounts.filter((_, i) => i !== index);
            setUploadAccounts(newAccounts);
        }
    };

    const updateUploadAccount = (index, field, value) => {
        const newAccounts = [...uploadAccounts];
        newAccounts[index][field] = value;
        setUploadAccounts(newAccounts);
    };

    const handleUploadSubmit = async () => {
        const validationUtils = ValidationUtils();
        const modalUtils = ModalUtils();

        if (!validationUtils.validateName(name)) {
            setErrors(prev => ({ ...prev, name: 'يرجى إدخال الاسم' }));
            return;
        }

        // Validate all accounts
        const validationErrors = {};
        let hasErrors = false;

        uploadAccounts.forEach((account, index) => {
            if (!account.profileFile) {
                validationErrors[`profile_${index}`] = 'يرجى اختيار ملف البيانات الشخصية';
                hasErrors = true;
            }
            if (!account.postsFile) {
                validationErrors[`posts_${index}`] = 'يرجى اختيار ملف المنشورات';
                hasErrors = true;
            }
            if (!account.accountName.trim()) {
                validationErrors[`accountName_${index}`] = 'يرجى إدخال اسم الحساب';
                hasErrors = true;
            }
        });

        if (hasErrors) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await modalUtils.showProcessingModal('بدء المعالجة', 'معالجة الحسابات المتعددة...', 1);
            
            const processedAccounts = [];
            
            for (let i = 0; i < uploadAccounts.length; i++) {
                const account = uploadAccounts[i];
                
                await modalUtils.showProcessingModal(
                    `معالجة الحساب ${i + 1}`, 
                    `قراءة بيانات ${account.accountName}...`, 
                    i + 2, 
                    uploadAccounts.length + 2
                );

                const profileText = await account.profileFile.text();
                const postsText = await account.postsFile.text();
                
                const profileData = validationUtils.parseAndValidateProfile(profileText);
                const postsData = validationUtils.parseAndValidatePosts(postsText);

                processedAccounts.push({
                    id: Date.now() + i,
                    name: account.accountName,
                    profile: profileData,
                    posts: postsData
                });
            }

            await modalUtils.showProcessingModal('حفظ البيانات', 'حفظ جميع الحسابات...', uploadAccounts.length + 2);

            const multiAccountSession = {
                id: Date.now().toString(),
                name: name,
                accounts: processedAccounts,
                created_at: new Date().toISOString()
            };

            // Save session
            await saveSession(name, { accounts: processedAccounts }, []);
            
            setSessionData(multiAccountSession);
            
            await modalUtils.showSuccessMessage();
            setTimeout(() => setCurrentPage('profile'), 2000);
            
        } catch (error) {
            console.error('Error processing files:', error);
            const modalUtils = ModalUtils();
            modalUtils.showErrorMessage(error);
            setErrors({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">إنشاء جلسة جديدة</h2>
                <p className="text-gray-600 text-lg">اختر طريقة الحصول على البيانات</p>
            </div>

            {/* Always visible name field */}
            <div className="info-card p-6 mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    <i className="fas fa-tag ml-2"></i>
                    اسم التقرير أو الجلسة
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل اسم التقرير (مثل: تقرير الشبكة المعادية)"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className={`info-card p-6 cursor-pointer transition-all ${
                    method === 'crawl' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`} onClick={() => setMethod('crawl')}>
                    <div className="text-center">
                        <div className={`text-6xl mb-4 ${method === 'crawl' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <i className="fas fa-download"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">القشط المباشر</h3>
                        <p className="text-gray-600">جلب البيانات مباشرة من فيسبوك</p>
                        <div className="mt-2 text-sm text-blue-600 font-medium">الطريقة المفضلة</div>
                    </div>
                </div>

                <div className={`info-card p-6 cursor-pointer transition-all ${
                    method === 'upload' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`} onClick={() => setMethod('upload')}>
                    <div className="text-center">
                        <div className={`text-6xl mb-4 ${method === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
                            <i className="fas fa-upload"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">رفع ملفات JSON</h3>
                        <p className="text-gray-600">رفع ملفات JSON المُصدرة من فيسبوك</p>
                    </div>
                </div>
            </div>

            {method === 'upload' && (
                <div className="info-card p-8 fade-in">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">رفع ملفات JSON - حسابات متعددة</h3>
                    
                    {uploadAccounts.map((account, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold text-gray-800">
                                    <i className="fab fa-facebook text-blue-600 ml-2"></i>
                                    حساب #{index + 1}
                                </h4>
                                {uploadAccounts.length > 1 && (
                                    <button
                                        onClick={() => removeUploadAccount(index)}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                )}
                            </div>

                            {/* Account Name */}
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    اسم الحساب
                                </label>
                                <input
                                    type="text"
                                    value={account.accountName}
                                    onChange={(e) => updateUploadAccount(index, 'accountName', e.target.value)}
                                    placeholder="اسم الشخص أو الصفحة"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {errors[`accountName_${index}`] && (
                                    <p className="text-red-500 text-sm mt-1">{errors[`accountName_${index}`]}</p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Profile File */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        ملف البيانات الشخصية
                                    </label>
                                    <FileUploadZone
                                        onFileSelect={(file) => updateUploadAccount(index, 'profileFile', file)}
                                        selectedFile={account.profileFile}
                                        error={errors[`profile_${index}`]}
                                        placeholder="اختر ملف البيانات الشخصية"
                                    />
                                </div>

                                {/* Posts File */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        ملف المنشورات
                                    </label>
                                    <FileUploadZone
                                        onFileSelect={(file) => updateUploadAccount(index, 'postsFile', file)}
                                        selectedFile={account.postsFile}
                                        error={errors[`posts_${index}`]}
                                        placeholder="اختر ملف المنشورات"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-between items-center">
                        <button
                            onClick={addUploadAccount}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                        >
                            <i className="fas fa-plus ml-2"></i>
                            إضافة حساب آخر
                        </button>

                        <button
                            onClick={handleUploadSubmit}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner w-5 h-5 ml-2"></div>
                                    جاري المعالجة...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-upload ml-2"></i>
                                    معالجة الحسابات ({uploadAccounts.length})
                                </>
                            )}
                        </button>
                    </div>

                    {errors.general && (
                        <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {errors.general}
                        </div>
                    )}
                </div>
            )}

            {method === 'crawl' && (
                <AccountInputForm 
                    onStartCrawling={(accounts, fullName) => {
                        const crawlerHandler = CrawlerHandler();
                        crawlerHandler.handleStartCrawling(accounts, setShowCrawlerModal, setCrawlerAccounts, name, fullName);
                    }} 
                />
            )}

            {showCrawlerModal && (
                <CrawlerStatusModal 
                    isOpen={showCrawlerModal}
                    accounts={crawlerAccounts}
                    sessionName={name}
                    onCancel={() => setShowCrawlerModal(false)}
                    onComplete={(results) => {
                        const crawlerHandler = CrawlerHandler();
                        crawlerHandler.handleCrawlingComplete(results, setSessionData, setCurrentPage, saveSession, name);
                        setShowCrawlerModal(false);
                    }}
                />
            )}
        </div>
    );
}

// Export for use in other files
window.HomePage = HomePage;