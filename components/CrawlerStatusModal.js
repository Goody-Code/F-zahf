// Crawler Status Modal Component
function CrawlerStatusModal({ isOpen, accounts, onCancel, onComplete }) {
    const [currentAccount, setCurrentAccount] = useState(0);
    const [status, setStatus] = useState('preparing'); // preparing, profile, posts, analysis, complete, error
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('ar-SA');
        setLogs(prev => [...prev, { message, type, timestamp }]);
    };

    const updateProgress = (newProgress) => {
        setProgress(newProgress);
    };

    useEffect(() => {
        if (isOpen && accounts.length > 0) {
            startCrawling();
        }
    }, [isOpen, accounts]);

    const startCrawling = async () => {
        setStatus('preparing');
        setProgress(0);
        setLogs([]);
        addLog('بدء عملية القشط المباشر...', 'info');
        
        const apiKey = localStorage.getItem('apify_api_key');
        if (!apiKey) {
            setError('مفتاح API غير موجود');
            setStatus('error');
            return;
        }

        const crawlerService = ApifyCrawlerService();
        const allResults = [];

        for (let i = 0; i < accounts.length; i++) {
            setCurrentAccount(i);
            const account = accounts[i];
            addLog(`بدء معالجة الحساب ${i + 1}: ${account.url}`, 'info');

            try {
                // Step 1: Profile Crawling
                setStatus('profile');
                updateProgress((i / accounts.length) * 100 + (1 / (accounts.length * 3)) * 100);
                addLog(`قشط البيانات التعريفية للحساب ${i + 1}...`, 'working');
                
                const profileData = await crawlerService.crawlProfile(account.url, apiKey, (msg) => {
                    addLog(msg, 'working');
                });

                addLog(`✅ تم قشط البيانات التعريفية للحساب ${i + 1}`, 'success');

                // Step 2: Posts Crawling
                setStatus('posts');
                updateProgress((i / accounts.length) * 100 + (2 / (accounts.length * 3)) * 100);
                addLog(`قشط المنشورات للحساب ${i + 1} (${account.postsLimit} منشور)...`, 'working');
                
                const postsData = await crawlerService.crawlPosts(account.url, account.postsLimit, apiKey, (msg) => {
                    addLog(msg, 'working');
                });

                addLog(`✅ تم قشط ${postsData.length} منشور للحساب ${i + 1}`, 'success');

                // Step 3: Process Data
                setStatus('analysis');
                updateProgress((i / accounts.length) * 100 + (3 / (accounts.length * 3)) * 100);
                addLog(`معالجة وتحليل البيانات للحساب ${i + 1}...`, 'working');

                const processedResult = {
                    id: Date.now() + i,
                    name: profileData[0]?.title || `حساب ${i + 1}`,
                    profile: profileData,
                    posts: postsData,
                    created_at: new Date().toISOString(),
                    source: 'apify_crawler'
                };

                allResults.push(processedResult);
                addLog(`✅ تم الانتهاء من معالجة الحساب ${i + 1}`, 'success');

            } catch (error) {
                console.error(`Error crawling account ${i + 1}:`, error);
                addLog(`❌ خطأ في معالجة الحساب ${i + 1}: ${error.message}`, 'error');
                
                // Continue with other accounts even if one fails
                continue;
            }
        }

        if (allResults.length > 0) {
            setStatus('complete');
            setProgress(100);
            setResults(allResults);
            addLog(`🎉 تم الانتهاء من قشط ${allResults.length} حساب بنجاح`, 'success');
            
            // Auto-close and return results after 3 seconds
            setTimeout(() => {
                onComplete(allResults);
            }, 3000);
        } else {
            setStatus('error');
            setError('فشل في قشط جميع الحسابات');
            addLog('❌ فشل في قشط أي حساب', 'error');
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'preparing': return 'fas fa-cog fa-spin';
            case 'profile': return 'fas fa-user fa-pulse';
            case 'posts': return 'fas fa-file-alt fa-pulse';
            case 'analysis': return 'fas fa-brain fa-pulse';
            case 'complete': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-cog';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'preparing': return 'جاري التحضير...';
            case 'profile': return `قشط البيانات التعريفية (${currentAccount + 1}/${accounts.length})`;
            case 'posts': return `قشط المنشورات (${currentAccount + 1}/${accounts.length})`;
            case 'analysis': return `تحليل البيانات (${currentAccount + 1}/${accounts.length})`;
            case 'complete': return 'تم الانتهاء بنجاح';
            case 'error': return 'حدث خطأ';
            default: return 'معالجة...';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
                <div className="text-center mb-6">
                    <div className={`text-6xl mb-4 ${status === 'error' ? 'text-red-500' : status === 'complete' ? 'text-green-500' : 'text-blue-500'}`}>
                        <i className={getStatusIcon()}></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">قشط البيانات من فيسبوك</h3>
                    <p className="text-gray-600">{getStatusText()}</p>
                </div>

                {/* Progress Bar */}
                <div className="progress-container advanced-progress mb-6">
                    <div className="advanced-bar" style={{ width: `${progress}%` }}></div>
                    <div className="progress-glow" style={{ left: `${progress}%` }}></div>
                </div>
                <p className="text-center text-sm text-gray-500 mb-6">
                    {progress.toFixed(0)}% مكتمل
                </p>

                {/* Logs */}
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm mb-6">
                    {logs.map((log, index) => (
                        <div key={index} className={`mb-1 ${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'success' ? 'text-green-400' : 
                            log.type === 'working' ? 'text-yellow-400' : 'text-gray-300'
                        }`}>
                            <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    {status !== 'complete' && status !== 'error' && (
                        <button
                            onClick={onCancel}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            <i className="fas fa-stop ml-2"></i>
                            إيقاف العملية
                        </button>
                    )}
                    
                    {(status === 'complete' || status === 'error') && (
                        <button
                            onClick={() => status === 'complete' ? onComplete(results) : onCancel()}
                            className={`px-8 py-2 rounded-lg transition-colors text-white ${
                                status === 'complete' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                            }`}
                        >
                            <i className={`fas ${status === 'complete' ? 'fa-arrow-right' : 'fa-times'} ml-2`}></i>
                            {status === 'complete' ? 'عرض النتائج' : 'إغلاق'}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-semibold">خطأ: {error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

window.CrawlerStatusModal = CrawlerStatusModal;