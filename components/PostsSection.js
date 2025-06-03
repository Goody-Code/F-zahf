// Posts Section Component - Enhanced with Smart Date Filtering
function PostsSection({ sessionData, searchTerm, setSearchTerm, filteredPosts, formatDate, renderTextWithReferences, accountIndex = 0, separatedMode = false }) {
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    const [sortBy, setSortBy] = useState('date'); // 'date', 'engagement', 'incitement'
    const [currentFilteredPosts, setCurrentFilteredPosts] = useState(filteredPosts);
    const [dateConversionInfo, setDateConversionInfo] = useState(null);

    // Smart date conversion utility
    const convertDate = (dateString) => {
        if (!dateString) return null;
        
        try {
            // Try to parse as timestamp first
            if (typeof dateString === 'number') {
                return new Date(dateString * 1000);
            }
            
            // Check if it's already a valid ISO date
            const isoDate = new Date(dateString);
            if (!isNaN(isoDate.getTime())) {
                return isoDate;
            }
            
            // Check for Hijri date patterns (Arabic months)
            const hijriMonths = {
                'محرم': 1, 'صفر': 2, 'ربيع الأول': 3, 'ربيع الآخر': 4,
                'جمادى الأولى': 5, 'جمادى الآخرة': 6, 'رجب': 7, 'شعبان': 8,
                'رمضان': 9, 'شوال': 10, 'ذو القعدة': 11, 'ذو الحجة': 12
            };
            
            // Simple Hijri to Gregorian approximation (for filtering purposes)
            for (const [monthName, monthNum] of Object.entries(hijriMonths)) {
                if (dateString.includes(monthName)) {
                    const yearMatch = dateString.match(/\d{4}/);
                    if (yearMatch) {
                        const hijriYear = parseInt(yearMatch[0]);
                        // Approximate conversion: Hijri year - 578/579 = Gregorian year
                        const gregorianYear = hijriYear - 578;
                        return new Date(gregorianYear, monthNum - 1, 1);
                    }
                }
            }
            
            // Fall back to trying to parse as-is
            return new Date(dateString);
        } catch (error) {
            console.error('Date conversion error:', error);
            return null;
        }
    };

    // AI Analysis for incitement detection
    const analyzeIncitement = async (text) => {
        if (!text || !window.websim?.chat?.completions?.create) return 0;
        
        try {
            const completion = await window.websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `أنت محلل ذكي للمحتوى التحريضي. قم بتحليل النص وإعطاء درجة من 0 إلى 100 للمحتوى التحريضي.
                        0 = لا يوجد تحريض
                        100 = تحريض شديد
                        أرسل فقط الرقم بدون أي نص إضافي.`
                    },
                    {
                        role: "user",
                        content: text
                    }
                ],
                json: false
            });
            
            const score = parseInt(completion.content) || 0;
            return Math.min(Math.max(score, 0), 100);
        } catch (error) {
            console.error('Incitement analysis error:', error);
            return 0;
        }
    };

    // Enhanced filter and sort posts
    useEffect(() => {
        let filtered = [...filteredPosts];

        // Apply date filter with smart conversion
        if (dateFilter.startDate || dateFilter.endDate) {
            filtered = filtered.filter(post => {
                const postDate = convertDate(post.timestamp || post.created_at || post.date);
                if (!postDate) return false;
                
                const start = dateFilter.startDate ? new Date(dateFilter.startDate) : new Date('1970-01-01');
                const end = dateFilter.endDate ? new Date(dateFilter.endDate) : new Date();
                
                return postDate >= start && postDate <= end;
            });

            // Show conversion info if filtering applied
            if (dateFilter.startDate || dateFilter.endDate) {
                const sampleDates = filteredPosts.slice(0, 3).map(p => ({
                    original: p.timestamp || p.created_at || p.date,
                    converted: convertDate(p.timestamp || p.created_at || p.date)
                }));
                setDateConversionInfo({ sampleDates, totalFiltered: filtered.length });
            }
        } else {
            setDateConversionInfo(null);
        }

        // Apply sorting
        if (sortBy === 'engagement') {
            filtered.sort((a, b) => {
                const engagementA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
                const engagementB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
                return engagementB - engagementA;
            });
        } else if (sortBy === 'incitement') {
            // For demo purposes, we'll use a simple keyword-based scoring
            filtered.sort((a, b) => {
                const getIncitementScore = (text) => {
                    if (!text) return 0;
                    const incitementKeywords = ['حرب', 'قتال', 'عدو', 'ثورة', 'انتقام', 'دمار', 'موت', 'تحرض', 'يستهدف', 'يهدد'];
                    let score = 0;
                    incitementKeywords.forEach(keyword => {
                        if (text.includes(keyword)) score += 10;
                    });
                    return Math.min(score, 100);
                };
                
                return getIncitementScore(b.text || '') - getIncitementScore(a.text || '');
            });
        } else {
            // Sort by date (newest first)
            filtered.sort((a, b) => {
                const dateA = convertDate(a.timestamp || a.created_at || a.date) || new Date(0);
                const dateB = convertDate(b.timestamp || b.created_at || b.date) || new Date(0);
                return dateB - dateA;
            });
        }

        setCurrentFilteredPosts(filtered);
    }, [filteredPosts, dateFilter, sortBy]);

    if (!sessionData.posts || sessionData.posts.length === 0) {
        return (
            <div className="info-card p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fas fa-file-alt text-blue-600 ml-2"></i>
                    المنشورات
                    {separatedMode && ` - ${sessionData.name}`}
                </h3>
                <div className="text-center py-12">
                    <i className="fas fa-file-alt text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg">لا توجد منشورات متاحة</p>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const totalPosts = sessionData.posts.length;
    const postsWithMedia = sessionData.posts.filter(post => post.media && post.media.length > 0).length;
    const totalLikes = sessionData.posts.reduce((sum, post) => sum + (post.likes || post.reactions || 0), 0);
    const totalComments = sessionData.posts.reduce((sum, post) => sum + (post.comments || post.commentsCount || 0), 0);

    return (
        <div className="info-card p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <i className="fas fa-newspaper text-blue-600 ml-2"></i>
                        المنشورات
                        {separatedMode && ` - ${sessionData.name}`}
                    </h3>
                    <p className="text-gray-600 mt-1">
                        {currentFilteredPosts.length} من أصل {totalPosts} منشور
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stats-card bg-gradient-to-br from-blue-500 to-blue-600">
                    <i className="fas fa-file-alt text-3xl mb-3 opacity-90"></i>
                    <p className="text-2xl font-bold">{totalPosts}</p>
                    <p className="text-sm opacity-90">إجمالي المنشورات</p>
                </div>
                <div className="stats-card bg-gradient-to-br from-green-500 to-green-600">
                    <i className="fas fa-images text-3xl mb-3 opacity-90"></i>
                    <p className="text-2xl font-bold">{postsWithMedia}</p>
                    <p className="text-sm opacity-90">منشورات بوسائط</p>
                </div>
                <div className="stats-card bg-gradient-to-br from-red-500 to-red-600">
                    <i className="fas fa-heart text-3xl mb-3 opacity-90"></i>
                    <p className="text-2xl font-bold">{totalLikes.toLocaleString('ar-SA')}</p>
                    <p className="text-sm opacity-90">إجمالي الإعجابات</p>
                </div>
                <div className="stats-card bg-gradient-to-br from-purple-500 to-purple-600">
                    <i className="fas fa-comments text-3xl mb-3 opacity-90"></i>
                    <p className="text-2xl font-bold">{totalComments.toLocaleString('ar-SA')}</p>
                    <p className="text-sm opacity-90">إجمالي التعليقات</p>
                </div>
            </div>

            {/* Enhanced Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="البحث في المنشورات..."
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    />
                    <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>

                {/* Date Filter with Smart Conversion */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-calendar-alt ml-1"></i>
                            من تاريخ
                        </label>
                        <input
                            type="date"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-calendar-alt ml-1"></i>
                            إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Date Conversion Info */}
                {dateConversionInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-semibold text-blue-800 mb-2">
                            <i className="fas fa-info-circle ml-1"></i>
                            نتائج الفلترة
                        </h4>
                        <p className="text-sm text-blue-700">
                            تم العثور على {dateConversionInfo.totalFiltered} منشور في الفترة المحددة
                        </p>
                        {dateConversionInfo.sampleDates && (
                            <div className="mt-2 text-xs text-blue-600">
                                عينة من التواريخ المحولة:
                                {dateConversionInfo.sampleDates.map((date, i) => (
                                    <div key={i} className="truncate">
                                        {date.original} → {date.converted?.toLocaleDateString('ar-SA')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Sort Options */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <i className="fas fa-sort ml-1"></i>
                        ترتيب المنشورات
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                        <option value="date">الأحدث أولاً</option>
                        <option value="engagement">الأكثر تفاعلاً</option>
                        <option value="incitement">الأكثر تحريضاً (تحليل ذكي)</option>
                    </select>
                </div>

                {/* Clear Filters Button */}
                {(dateFilter.startDate || dateFilter.endDate || sortBy !== 'date') && (
                    <button
                        onClick={() => {
                            setDateFilter({ startDate: '', endDate: '' });
                            setSortBy('date');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                        <i className="fas fa-times ml-1"></i>
                        مسح الفلاتر
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {currentFilteredPosts.map((post, index) => (
                    <PostCard
                        key={post.postId || post.id || index}
                        post={post}
                        formatDate={formatDate}
                        renderTextWithReferences={renderTextWithReferences}
                    />
                ))}
                
                {currentFilteredPosts.length === 0 && (searchTerm || dateFilter.startDate || dateFilter.endDate) && (
                    <div className="text-center py-12">
                        <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                        <p className="text-gray-500 text-lg">لا توجد منشورات تطابق المعايير المحددة</p>
                        <p className="text-gray-400 text-sm mt-2">جرب تعديل الفلاتر أو البحث بكلمات أخرى</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export for use in other files
window.PostsSection = PostsSection;