// Intelligence Report Display Component - Enhanced with Edit Capability
function IntelligenceReport({ reportContent, threatBadge, accountId, onEdit }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [currentReportContent, setCurrentReportContent] = useState(reportContent);

    // Update current content when reportContent prop changes
    useEffect(() => {
        setCurrentReportContent(reportContent);
    }, [reportContent]);

    if (!currentReportContent) return null;

    const startEditing = () => {
        setEditedContent(currentReportContent);
        setIsEditing(true);
        if (onEdit) onEdit(currentReportContent);
    };

    const saveEdit = () => {
        // Update the local state immediately
        setCurrentReportContent(editedContent);
        
        // Update the report content
        // Save to localStorage with account ID
        localStorage.setItem(`edited_report_${accountId}`, editedContent);
        
        // Also update the session data if available
        const currentSession = JSON.parse(localStorage.getItem('current_session_data') || '{}');
        if (currentSession.intelligenceReport) {
            if (typeof currentSession.intelligenceReport === 'object') {
                currentSession.intelligenceReport[accountId] = editedContent;
            } else {
                currentSession.intelligenceReport = editedContent;
            }
            localStorage.setItem('current_session_data', JSON.stringify(currentSession));
        }
        
        // Update the displayed content
        if (window.updateIntelligenceReport) {
            window.updateIntelligenceReport(accountId, editedContent);
        }
        
        // Exit editing mode without hiding the report
        setIsEditing(false);
        
        // Show success message
        const successModal = document.createElement('div');
        successModal.className = 'modal-overlay';
        successModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-green-500 text-6xl mb-4">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">تم حفظ التعديلات</h3>
                    <p class="text-gray-600 mb-4">تم تحديث التقرير الاستخباراتي بنجاح</p>
                    <button onclick="this.closest('.modal-overlay').remove()" class="bg-green-500 text-white px-6 py-2 rounded-lg">
                        حسناً
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
        setTimeout(() => successModal.remove(), 2000);
    };

    // Parse the report into sections
    const parseReport = (content) => {
        const sections = {};
        const lines = content.split('\n');
        let currentSection = 'general';
        let currentContent = [];

        lines.forEach(line => {
            if (line.includes('البيانات العامة للمذكور:')) {
                sections[currentSection] = currentContent.join('\n');
                currentSection = 'basicData';
                currentContent = [];
            } else if (line.includes('ملخص النشاط التحريضي العام:')) {
                sections[currentSection] = currentContent.join('\n');
                currentSection = 'incitementActivity';
                currentContent = [];
            } else if (line.includes('التحليل العام لنشاط المذكور:')) {
                sections[currentSection] = currentContent.join('\n');
                currentSection = 'generalAnalysis';
                currentContent = [];
            } else if (line.includes('التوصيات والإجراءات:')) {
                sections[currentSection] = currentContent.join('\n');
                currentSection = 'recommendations';
                currentContent = [];
            } else {
                currentContent.push(line);
            }
        });
        sections[currentSection] = currentContent.join('\n');
        
        return sections;
    };

    const reportSections = parseReport(currentReportContent);

    return (
        <div className="intelligence-report-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-shield-alt text-white text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-red-800 flex items-center">
                            <i className="fas fa-exclamation-triangle text-red-600 ml-2"></i>
                            التقرير الاستخباراتي
                        </h3>
                        <p className="text-red-600 font-medium">تحليل أمني متقدم - مصنف سري</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={startEditing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all text-sm"
                    >
                        <i className="fas fa-edit ml-1"></i>
                        تعديل التقرير
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                    >
                        <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2`}></i>
                        {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                    </button>
                </div>
            </div>

            {/* Threat Level Indicator */}
            {threatBadge && (
                <div className={`p-4 rounded-lg mb-4 bg-${threatBadge.color}-100 border border-${threatBadge.color}-300`}>
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className={`w-8 h-8 bg-${threatBadge.color}-500 rounded-full flex items-center justify-center`}>
                            <i className="fas fa-user-secret text-white text-sm"></i>
                        </div>
                        <div>
                            <h4 className={`font-bold text-${threatBadge.color}-800`}>
                                مستوى التهديد: {threatBadge.level}
                            </h4>
                            <p className={`text-${threatBadge.color}-700 text-sm`}>{threatBadge.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {isEditing ? (
                <div className="space-y-4">
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="محتوى التقرير..."
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={saveEdit}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            <i className="fas fa-save ml-1"></i>
                            حفظ التحديث
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                            <i className="fas fa-times ml-1"></i>
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : isExpanded && (
                <div className="space-y-6">
                    {/* Basic Data Section */}
                    {reportSections.basicData && (
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                <i className="fas fa-id-card text-blue-600 ml-2"></i>
                                البيانات العامة للمذكور
                            </h4>
                            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {reportSections.basicData}
                            </div>
                        </div>
                    )}

                    {/* Incitement Activity Section */}
                    {reportSections.incitementActivity && (
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                            <h4 className="font-bold text-red-800 mb-3 flex items-center">
                                <i className="fas fa-bullhorn text-red-600 ml-2"></i>
                                ملخص النشاط التحريضي العام
                            </h4>
                            <div className="text-red-700 whitespace-pre-line leading-relaxed">
                                {reportSections.incitementActivity}
                            </div>
                        </div>
                    )}

                    {/* General Analysis Section */}
                    {reportSections.generalAnalysis && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                                <i className="fas fa-chart-line text-purple-600 ml-2"></i>
                                التحليل العام لنشاط المذكور
                            </h4>
                            <div className="text-purple-700 whitespace-pre-line leading-relaxed">
                                {reportSections.generalAnalysis}
                            </div>
                        </div>
                    )}

                    {/* Recommendations Section */}
                    {reportSections.recommendations && (
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
                            <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                                <i className="fas fa-tasks text-orange-600 ml-2"></i>
                                التوصيات والإجراءات
                            </h4>
                            <div className="text-orange-700 whitespace-pre-line leading-relaxed">
                                {reportSections.recommendations}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

window.IntelligenceReport = IntelligenceReport;