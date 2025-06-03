// Combined Profile and Posts Page Component - Enhanced for Multi-Account Support
function ProfilePage({ sessionData }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentFilteredPosts, setCurrentFilteredPosts] = useState([]);
    const [intelligenceReport, setIntelligenceReport] = useState(null);
    const [threatBadge, setThreatBadge] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [displayMode, setDisplayMode] = useState('stacked'); // 'stacked' or 'separated'
    const [analysisMode, setAnalysisMode] = useState('individual'); // 'individual' or 'unified'
    const [editingReport, setEditingReport] = useState(false);
    const [editedReport, setEditedReport] = useState('');

    // Enhanced safe data access for multi-account support
    const safeSessionData = {
        name: sessionData?.name || sessionData?.title || 'ملف شخصي',
        accounts: Array.isArray(sessionData?.accounts) ? sessionData.accounts : 
                 sessionData?.profile ? [{
                     id: sessionData.id || Date.now().toString(),
                     name: sessionData.name || 'حساب رئيسي',
                     profile: Array.isArray(sessionData.profile) ? sessionData.profile : [sessionData.profile],
                     posts: Array.isArray(sessionData.posts) ? sessionData.posts : []
                 }] : [],
        created_at: sessionData?.created_at || new Date().toISOString(),
        id: sessionData?.id || Date.now().toString()
    };

    const { formatDate, renderTextWithReferences } = DateUtils();
    
    // Updated PDF exporter to use current display mode and filtered posts
    const { exportToPDF } = PDFExporter({
        ...safeSessionData,
        displayMode,
        analysisMode,
        intelligenceReport,
        currentFilteredPosts
    });

    // Enhanced Intelligence Analysis for multi-account
    const runIntelligenceAnalysis = async (mode = 'individual') => {
        setAnalysisLoading(true);
        try {
            const analyzer = IntelligenceAnalyzer();
            
            if (mode === 'individual') {
                const reports = {};
                const badges = {};
                
                for (const account of safeSessionData.accounts) {
                    const report = await analyzer.analyzeProfile({
                        name: account.name,
                        profile: account.profile,
                        posts: account.posts
                    });
                    const badge = await analyzer.generateThreatBadge(report);
                    
                    reports[account.id] = report;
                    badges[account.id] = badge;
                }
                
                setIntelligenceReport(reports);
                setThreatBadge(badges);
                
                // Save to localStorage
                localStorage.setItem(`intelligence_report_${safeSessionData.id}`, JSON.stringify({
                    report: reports,
                    badge: badges,
                    mode: 'individual',
                    timestamp: Date.now()
                }));
            } else {
                // Unified analysis
                const unifiedReport = await analyzer.analyzeMultipleProfiles(safeSessionData);
                setIntelligenceReport(unifiedReport);
                setThreatBadge(null); // No individual badges for unified
                
                // Save to localStorage
                localStorage.setItem(`intelligence_report_${safeSessionData.id}`, JSON.stringify({
                    report: unifiedReport,
                    badge: null,
                    mode: 'unified',
                    timestamp: Date.now()
                }));
            }
        } catch (error) {
            console.error('Intelligence analysis failed:', error);
            showErrorModal(error);
        } finally {
            setAnalysisLoading(false);
        }
    };

    // Load existing report on component mount
    useEffect(() => {
        const savedReport = localStorage.getItem(`intelligence_report_${safeSessionData.id}`);
        if (savedReport) {
            try {
                const { report, badge, mode } = JSON.parse(savedReport);
                setIntelligenceReport(report);
                setThreatBadge(badge);
                setAnalysisMode(mode || 'individual');
            } catch (error) {
                console.error('Failed to load saved report:', error);
            }
        }
        
        // Set up report update function
        window.updateIntelligenceReport = (accountId, newContent) => {
            if (analysisMode === 'individual') {
                setIntelligenceReport(prevReports => {
                    const updatedReports = { ...prevReports };
                    updatedReports[accountId] = newContent;
                    return updatedReports;
                });
            } else {
                setIntelligenceReport(newContent);
            }
        };
        
        return () => {
            window.updateIntelligenceReport = null;
        };
    }, [safeSessionData.id, analysisMode]);

    const saveEditedReport = () => {
        if (analysisMode === 'individual') {
            // For individual mode, update specific account report
            const updatedReports = { ...intelligenceReport };
            // Logic to identify which account's report is being edited
            setIntelligenceReport(updatedReports);
        } else {
            setIntelligenceReport(editedReport);
        }
        setEditingReport(false);
        
        // Save to localStorage
        localStorage.setItem(`intelligence_report_${safeSessionData.id}`, JSON.stringify({
            report: intelligenceReport,
            badge: threatBadge,
            mode: analysisMode,
            timestamp: Date.now()
        }));
    };

    const showErrorModal = (error) => {
        const errorModal = document.createElement('div');
        errorModal.className = 'modal-overlay';
        errorModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-red-500 text-6xl mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">فشل التحليل الاستخباراتي</h3>
                    <p class="text-gray-600 mb-4">${error.message}</p>
                    <button onclick="this.closest('.modal-overlay').remove()" class="bg-red-500 text-white px-6 py-2 rounded-lg">
                        حسناً
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Enhanced Header with Display Mode Toggle */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                        <i className="fas fa-user-circle text-blue-600 ml-2"></i>
                        {safeSessionData.name}
                    </h2>
                    <p className="text-gray-600">
                        {safeSessionData.accounts.length > 1 ? `${safeSessionData.accounts.length} حسابات` : 'حساب واحد'}
                    </p>
                </div>
                
                <div className="flex gap-3 items-center">
                    {/* Display Mode Toggle */}
                    {safeSessionData.accounts.length > 1 && (
                        <div className="bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setDisplayMode('stacked')}
                                className={`px-3 py-2 rounded text-sm transition-all ${
                                    displayMode === 'stacked' ? 'bg-blue-600 text-white' : 'text-gray-600'
                                }`}
                            >
                                عرض متتالي
                            </button>
                            <button
                                onClick={() => setDisplayMode('separated')}
                                className={`px-3 py-2 rounded text-sm transition-all ${
                                    displayMode === 'separated' ? 'bg-blue-600 text-white' : 'text-gray-600'
                                }`}
                            >
                                عرض منفصل
                            </button>
                        </div>
                    )}
                    
                    {/* Analysis Mode Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setAnalysisMode('individual');
                                runIntelligenceAnalysis('individual');
                            }}
                            disabled={analysisLoading}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                        >
                            <i className="fas fa-user-shield"></i>
                            <span>تحليل منفرد</span>
                        </button>
                        
                        {safeSessionData.accounts.length > 1 && (
                            <button
                                onClick={() => {
                                    setAnalysisMode('unified');
                                    runIntelligenceAnalysis('unified');
                                }}
                                disabled={analysisLoading}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all flex items-center space-x-2 space-x-reverse disabled:opacity-50"
                            >
                                <i className="fas fa-shield-alt"></i>
                                <span>تحليل موحد</span>
                            </button>
                        )}
                    </div>
                    
                    <button
                        onClick={exportToPDF}
                        className="btn-export flex items-center space-x-2 space-x-reverse"
                    >
                        <i className="fas fa-download"></i>
                        <span>تحميل PDF</span>
                    </button>
                </div>
            </div>

            {analysisLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="loading-spinner w-6 h-6 ml-3"></div>
                        <span className="text-blue-700">جاري إجراء التحليل الاستخباراتي...</span>
                    </div>
                </div>
            )}

            <div id="complete-profile-content" className="space-y-8">
                {/* Unified Intelligence Report (for unified mode) */}
                {analysisMode === 'unified' && intelligenceReport && (
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6 mb-8 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-red-800">
                                <i className="fas fa-shield-alt text-red-600 ml-2"></i>
                                التقرير الاستخباراتي الموحد
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditedReport(typeof intelligenceReport === 'string' ? intelligenceReport : JSON.stringify(intelligenceReport, null, 2));
                                        setEditingReport(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    <i className="fas fa-edit ml-1"></i>
                                    تعديل التقرير
                                </button>
                            </div>
                        </div>
                        
                        {editingReport ? (
                            <div className="space-y-4">
                                <textarea
                                    value={editedReport}
                                    onChange={(e) => setEditedReport(e.target.value)}
                                    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                                    placeholder="محتوى التقرير..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={saveEditedReport}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        حفظ التحديث
                                    </button>
                                    <button
                                        onClick={() => setEditingReport(false)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {typeof intelligenceReport === 'string' ? intelligenceReport : JSON.stringify(intelligenceReport, null, 2)}
                            </div>
                        )}
                    </div>
                )}

                {/* Render accounts based on display mode */}
                {displayMode === 'stacked' ? (
                    // Stacked Display - Each account fully rendered one after another
                    safeSessionData.accounts.map((account, index) => (
                        <div key={account.id} className="space-y-6">
                            <div className="bg-white rounded-lg shadow-lg overflow-hidden fade-in">
                                <ProfileHeader 
                                    profile={account.profile[0]} 
                                    sessionData={{...account, name: account.name}}
                                    threatBadge={analysisMode === 'individual' ? threatBadge?.[account.id] : null}
                                />
                                <ProfileInfo profile={account.profile[0]} />
                            </div>

                            {/* Individual Intelligence Report */}
                            {analysisMode === 'individual' && intelligenceReport?.[account.id] && (
                                <IntelligenceReport 
                                    reportContent={intelligenceReport[account.id]} 
                                    threatBadge={threatBadge?.[account.id]}
                                    accountId={account.id}
                                    onEdit={(content) => {
                                        setEditedReport(content);
                                        setEditingReport(true);
                                    }}
                                />
                            )}

                            <PostsSection 
                                sessionData={account}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filteredPosts={account.posts || []}
                                formatDate={formatDate}
                                renderTextWithReferences={renderTextWithReferences}
                                accountIndex={index}
                            />
                        </div>
                    ))
                ) : (
                    // Separated Display - All profiles first, then all posts
                    <>
                        {/* All Profile Sections */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-800">المعلومات التعريفية</h3>
                            {safeSessionData.accounts.map((account) => (
                                <div key={`profile-${account.id}`} className="bg-white rounded-lg shadow-lg overflow-hidden fade-in">
                                    <ProfileHeader 
                                        profile={account.profile[0]} 
                                        sessionData={{...account, name: account.name}}
                                        threatBadge={analysisMode === 'individual' ? threatBadge?.[account.id] : null}
                                    />
                                    <ProfileInfo profile={account.profile[0]} />
                                    
                                    {/* Individual Intelligence Report */}
                                    {analysisMode === 'individual' && intelligenceReport?.[account.id] && (
                                        <div className="p-6 border-t">
                                            <IntelligenceReport 
                                                reportContent={intelligenceReport[account.id]} 
                                                threatBadge={threatBadge?.[account.id]}
                                                accountId={account.id}
                                                onEdit={(content) => {
                                                    setEditedReport(content);
                                                    setEditingReport(true);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* All Posts Sections */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-bold text-gray-800">المنشورات</h3>
                            {safeSessionData.accounts.map((account, index) => (
                                <div key={`posts-${account.id}`}>
                                    <h4 className="text-xl font-semibold text-gray-700 mb-4 border-r-4 border-blue-500 pr-4">
                                        منشورات {account.name}
                                    </h4>
                                    <PostsSection 
                                        sessionData={account}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        filteredPosts={account.posts || []}
                                        formatDate={formatDate}
                                        renderTextWithReferences={renderTextWithReferences}
                                        accountIndex={index}
                                        separatedMode={true}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Export for use in other files
window.ProfilePage = ProfilePage;