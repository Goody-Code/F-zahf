// Sessions Page Component
function SessionsPage({ sessions, setSessionData, setCurrentPage, setSessions }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Add decompression utility
    const decompressData = (compressedData) => {
        try {
            const decompressed = decodeURIComponent(atob(compressedData));
            return JSON.parse(decompressed);
        } catch (error) {
            console.error('Decompression failed:', error);
            return null;
        }
    };

    // Enhanced AI analysis for session summary
    const generateSessionSummary = async (session) => {
        try {
            let profileData = session.profile_data;
            let postsData = session.posts_data;
            
            if (session.compressed && !profileData && !postsData) {
                profileData = decompressData(session.compressed_profile);
                postsData = decompressData(session.compressed_posts);
            }

            if (!profileData || !postsData || !window.websim?.chat?.completions?.create) {
                return null;
            }

            const profile = Array.isArray(profileData) ? profileData[0] : profileData;
            const posts = Array.isArray(postsData) ? postsData : [];

            const completion = await window.websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `أنت محلل استخباراتي متقدم. قم بتحليل البيانات واستخراج معلومات محددة بصيغة JSON:

{
  "fullName": "الاسم الكامل الحقيقي للشخص",
  "currentLocation": "محافظة/مدينة الإقامة الحالية",
  "workDescription": "وصف العمل والنشاط المهني",
  "incitementSummary": "ملخص النشاط التحريضي في 2-3 جمل",
  "topIncitementPosts": [
    {
      "text": "نص المنشور التحريضي",
      "excerpt": "مقتطف من المنشور 150-250 حرف",
      "timestamp": "تاريخ المنشور",
      "incitementLevel": "مستوى التحريض من 1-10"
    }
  ],
  "recommendations": "التوصيات والإجراءات المقترحة",
  "socialLinks": [
    {"platform": "Facebook", "url": "رابط الحساب"},
    {"platform": "Instagram", "url": "رابط الحساب"}
  ],
  "threatLevel": "منخفض/متوسط/عالي"
}`
                    },
                    {
                        role: "user",
                        content: `تحليل البيانات التالية:
الملف الشخصي: ${JSON.stringify(profile)}
عدد المنشورات: ${posts.length}
عينة المنشورات: ${JSON.stringify(posts.slice(0, 20).map(p => p.text))}`
                    }
                ],
                json: true
            });

            return JSON.parse(completion.content);
        } catch (error) {
            console.error('AI summary generation failed:', error);
            return null;
        }
    };

    // Enhanced function to extract comprehensive profile summary
    const getEnhancedProfileSummary = (session) => {
        try {
            let profile = session.profile_data;
            let posts = session.posts_data;
            
            if (session.compressed && !profile) {
                profile = decompressData(session.compressed_profile);
                posts = decompressData(session.compressed_posts);
            }
            
            if (Array.isArray(profile)) profile = profile[0];
            if (!profile) return null;
            
            // Get saved custom fields
            const accountId = profile.pageId || profile.facebookId || session.id;
            const savedPhone = localStorage.getItem(`profile_${accountId}_phone`);
            const savedLocation = localStorage.getItem(`profile_${accountId}_location`);
            
            // Get saved session metadata
            const sessionMeta = JSON.parse(localStorage.getItem(`session_meta_${session.id}`) || '{}');
            
            // Extract social media links
            const socialLinks = [];
            if (profile.facebookUrl || profile.pageUrl) {
                socialLinks.push({ platform: 'Facebook', url: profile.facebookUrl || profile.pageUrl });
            }
            if (profile.websites && Array.isArray(profile.websites)) {
                profile.websites.forEach(website => {
                    if (website.includes('instagram')) {
                        socialLinks.push({ platform: 'Instagram', url: website });
                    } else if (website.includes('twitter')) {
                        socialLinks.push({ platform: 'Twitter', url: website });
                    } else if (website.includes('youtube')) {
                        socialLinks.push({ platform: 'YouTube', url: website });
                    } else {
                        socialLinks.push({ platform: 'Website', url: website });
                    }
                });
            }

            // Extract top inciting posts
            const topIncitingPosts = posts ? posts
                .filter(post => post.text && (
                    post.text.includes('حرب') || post.text.includes('قتال') || 
                    post.text.includes('عدو') || post.text.includes('ثورة') ||
                    post.text.includes('انتقام') || post.text.includes('تحرض')
                ))
                .slice(0, 3)
                .map(post => ({
                    text: post.text,
                    excerpt: post.text.substring(0, 200) + '...',
                    timestamp: post.timestamp || post.created_at,
                    url: post.url || '#'
                })) : [];
            
            // Get AI-generated summary if available
            const aiSummaryKey = `ai_summary_${session.id}`;
            const savedAISummary = localStorage.getItem(aiSummaryKey);
            let aiSummary = null;
            if (savedAISummary) {
                try {
                    aiSummary = JSON.parse(savedAISummary);
                } catch (e) {
                    console.error('Failed to parse AI summary:', e);
                }
            }

            return {
                // Use actual person name, not session name
                fullName: sessionMeta.fullName || aiSummary?.fullName || profile.title || profile.name || 'غير محدد',
                sessionName: session.name, // Keep session name separate
                location: sessionMeta.location || savedLocation || profile.LOCATION || aiSummary?.currentLocation || 'غير محدد',
                currentLocation: sessionMeta.currentLocation || aiSummary?.currentLocation || 'غير محدد',
                work: sessionMeta.work || profile.WORK || aiSummary?.workDescription || 'غير محدد',
                phone: sessionMeta.phone || savedPhone || profile.phone || 'غير محدد',
                incitementSummary: sessionMeta.incitementSummary || aiSummary?.incitementSummary || 'لم يتم التحليل بعد',
                socialLinks: sessionMeta.socialLinks || aiSummary?.socialLinks || socialLinks,
                topIncitingPosts: sessionMeta.topIncitingPosts || aiSummary?.topIncitementPosts || topIncitingPosts,
                followers: profile.followers || profile.likes || 0,
                recommendations: sessionMeta.recommendations || aiSummary?.recommendations || 'لم يتم تحديد التوصيات بعد',
                aiSummary: aiSummary,
                threatLevel: sessionMeta.threatLevel || aiSummary?.threatLevel || 'غير محدد'
            };
        } catch (error) {
            console.error('Error extracting enhanced summary:', error);
            return null;
        }
    };

    const loadSession = (session) => {
        try {
            let profileData = session.profile_data;
            let postsData = session.posts_data;
            
            // If data is compressed, decompress it
            if (session.compressed && !profileData && !postsData) {
                profileData = decompressData(session.compressed_profile);
                postsData = decompressData(session.compressed_posts);
                
                if (!profileData || !postsData) {
                    throw new Error('فشل في استرجاع البيانات المضغوطة');
                }
            }
            
            // Load edited reports if any
            const sessionId = session.id;
            const editedReport = localStorage.getItem(`edited_report_${sessionId}`);
            
            const sessionData = {
                id: session.id,
                name: session.name,
                profile: profileData,
                posts: postsData,
                created_at: session.created_at,
                intelligenceReport: editedReport || session.intelligence_report
            };
            
            // Store current session for report editing
            localStorage.setItem('current_session_data', JSON.stringify(sessionData));
            
            setSessionData(sessionData);
            setCurrentPage('profile');
        } catch (error) {
            console.error('Load session error:', error);
            // Show error modal
            const errorModal = document.createElement('div');
            errorModal.className = 'modal-overlay';
            errorModal.innerHTML = `
                <div class="modal-content">
                    <div class="text-center">
                        <div class="text-red-500 text-6xl mb-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">خطأ في تحميل الجلسة</h3>
                        <p class="text-gray-600 mb-4">فشل في استرجاع بيانات الجلسة</p>
                        <button onclick="this.closest('.modal-overlay').remove()" class="bg-red-500 text-white px-6 py-2 rounded-lg">
                            حسناً
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(errorModal);
        }
    };

    const loadSessions = async () => {
        try {
            // Load from localStorage only
            const storedSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
            if (setSessions) {
                setSessions(storedSessions);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
            // Clear corrupted data
            localStorage.removeItem('facebook_sessions');
            if (setSessions) {
                setSessions([]);
            }
        }
    };

    const deleteSession = (sessionId, event) => {
        event.stopPropagation();
        
        const session = sessions.find(s => s.id === sessionId);
        const sessionSize = session?.size || 0;
        
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal-overlay';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-orange-500 text-6xl mb-4">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">حذف الجلسة</h3>
                    <p class="text-gray-600 mb-2">هل أنت متأكد من حذف هذه الجلسة؟</p>
                    <p class="text-sm text-gray-500 mb-4">حجم الجلسة: ${formatBytes(sessionSize)}</p>
                    <div class="flex gap-4 justify-center">
                        <button onclick="this.closest('.modal-overlay').remove()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">
                            إلغاء
                        </button>
                        <button onclick="deleteSessionConfirmed('${sessionId}')" class="bg-red-500 text-white px-6 py-2 rounded-lg">
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        // Helper function to format bytes
        function formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        window.deleteSessionConfirmed = (id) => {
            try {
                const existingSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
                const updatedSessions = existingSessions.filter(s => s.id !== id);
                localStorage.setItem('facebook_sessions', JSON.stringify(updatedSessions));
                if (setSessions) {
                    setSessions(updatedSessions);
                }
                confirmModal.remove();
                
                // Show success message with storage info
                const storageSize = JSON.stringify(updatedSessions).length;
                const successModal = document.createElement('div');
                successModal.className = 'modal-overlay';
                successModal.innerHTML = `
                    <div class="modal-content">
                        <div class="text-center">
                            <div class="text-green-500 text-6xl mb-4">
                                <i class="fas fa-check-circle"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">تم الحذف</h3>
                            <p class="text-gray-600 mb-2">تم حذف الجلسة بنجاح</p>
                            <p class="text-sm text-gray-500">مساحة التخزين المستخدمة: ${formatBytes(storageSize)}</p>
                        </div>
                    </div>
                `;
                document.body.appendChild(successModal);
                setTimeout(() => successModal.remove(), 2000);
            } catch (error) {
                console.error('Delete session error:', error);
            }
        };
    };

    // Function to generate AI summary for a session
    const generateAISummaryForSession = async (session, summary) => {
        const loadingModal = document.createElement('div');
        loadingModal.className = 'modal-overlay';
        loadingModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">جاري التحليل الذكي</h3>
                    <p class="text-gray-600">يتم تحليل البيانات واستخراج المعلومات...</p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);

        try {
            const aiSummary = await generateSessionSummary(session);
            if (aiSummary) {
                // Save AI summary
                localStorage.setItem(`ai_summary_${session.id}`, JSON.stringify(aiSummary));
                
                // Refresh the sessions to show updated data
                const updatedSessions = sessions.map(s => 
                    s.id === session.id ? { ...s, aiSummary } : s
                );
                if (setSessions) {
                    setSessions(updatedSessions);
                }
            }
        } catch (error) {
            console.error('AI analysis failed:', error);
        } finally {
            loadingModal.remove();
        }
    };

    // Function to export comprehensive session summary to PDF
    const exportSessionToPDF = async (session) => {
        const summary = getEnhancedProfileSummary(session);
        if (!summary) return;

        try {
            // Create temporary session data for PDF export
            const tempSessionData = {
                name: summary.name,
                profile: session.profile_data || decompressData(session.compressed_profile),
                posts: session.posts_data || decompressData(session.compressed_posts),
                aiSummary: summary.aiSummary,
                created_at: session.created_at
            };

            const pdfExporter = PDFExporter(tempSessionData);
            await pdfExporter.exportToPDF();
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('فشل في تصدير الملف');
        }
    };

    // Function to save session metadata
    const saveSessionMeta = (sessionId, metaData) => {
        localStorage.setItem(`session_meta_${sessionId}`, JSON.stringify(metaData));
    };

    // Function to show edit modal
    const showEditModal = (session, summary) => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content max-w-4xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">تعديل بيانات الجلسة</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <form id="editSessionForm" class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                            <input type="text" name="fullName" value="${summary?.fullName || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                            <input type="text" name="phone" value="${summary?.phone || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">المديرية</label>
                            <input type="text" name="location" value="${summary?.location || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">مكان التواجد الحالي</label>
                            <input type="text" name="currentLocation" value="${summary?.currentLocation || ''}" 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">العمل ونبذة عنه</label>
                        <textarea name="work" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${summary?.work || ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">ملخص النشاط التحريضي</label>
                        <textarea name="incitementSummary" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${summary?.incitementSummary || ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">التوصيات والمقترحات</label>
                        <textarea name="recommendations" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg">${summary?.recommendations || ''}</textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">روابط حسابات التواصل</label>
                        <div id="socialLinksContainer">
                            ${(summary?.socialLinks || []).map((link, index) => `
                                <div class="flex gap-2 mb-2">
                                    <select name="socialPlatform_${index}" class="px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="Facebook" ${link.platform === 'Facebook' ? 'selected' : ''}>Facebook</option>
                                        <option value="Instagram" ${link.platform === 'Instagram' ? 'selected' : ''}>Instagram</option>
                                        <option value="Twitter" ${link.platform === 'Twitter' ? 'selected' : ''}>Twitter</option>
                                        <option value="YouTube" ${link.platform === 'YouTube' ? 'selected' : ''}>YouTube</option>
                                        <option value="Website" ${link.platform === 'Website' ? 'selected' : ''}>موقع إلكتروني</option>
                                    </select>
                                    <input type="url" name="socialUrl_${index}" value="${link.url || ''}" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="رابط الحساب">
                                    <button type="button" onclick="this.parentElement.remove()" 
                                            class="bg-red-500 text-white px-3 py-2 rounded-lg">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="addSocialLink()" 
                                class="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm mt-2">
                            <i class="fas fa-plus ml-1"></i>إضافة رابط
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">أبرز المنشورات التحريضية</label>
                        <div id="topPostsContainer">
                            ${(summary?.topIncitingPosts || []).map((post, index) => `
                                <div class="border border-gray-200 rounded-lg p-3 mb-3">
                                    <textarea name="postText_${index}" rows="3" 
                                              class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" 
                                              placeholder="نص المنشور...">${post.text || ''}</textarea>
                                    <input type="url" name="postUrl_${index}" value="${post.url || ''}" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                           placeholder="رابط المنشور (اختياري)">
                                    <button type="button" onclick="this.parentElement.remove()" 
                                            class="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2">
                                        حذف المنشور
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" onclick="addTopPost()" 
                                class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm mt-2">
                            <i class="fas fa-plus ml-1"></i>إضافة منشور
                        </button>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
                            حفظ التعديلات
                        </button>
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" 
                                class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add helper functions for dynamic form elements
        window.addSocialLink = () => {
            const container = document.getElementById('socialLinksContainer');
            const index = container.children.length;
            const linkDiv = document.createElement('div');
            linkDiv.className = 'flex gap-2 mb-2';
            linkDiv.innerHTML = `
                <select name="socialPlatform_${index}" class="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Website">موقع إلكتروني</option>
                </select>
                <input type="url" name="socialUrl_${index}" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="رابط الحساب">
                <button type="button" onclick="this.parentElement.remove()" class="bg-red-500 text-white px-3 py-2 rounded-lg">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(linkDiv);
        };
        
        window.addTopPost = () => {
            const container = document.getElementById('topPostsContainer');
            const index = container.children.length;
            const postDiv = document.createElement('div');
            postDiv.className = 'border border-gray-200 rounded-lg p-3 mb-3';
            postDiv.innerHTML = `
                <textarea name="postText_${index}" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" 
                          placeholder="نص المنشور..."></textarea>
                <input type="url" name="postUrl_${index}" 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                       placeholder="رابط المنشور (اختياري)">
                <button type="button" onclick="this.parentElement.remove()" 
                        class="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2">
                    حذف المنشور
                </button>
            `;
            container.appendChild(postDiv);
        };
        
        // Handle form submission
        document.getElementById('editSessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedMeta = {};
            
            // Process regular fields
            for (let [key, value] of formData.entries()) {
                if (!key.startsWith('social') && !key.startsWith('post')) {
                    updatedMeta[key] = value;
                }
            }
            
            // Process social links
            const socialLinks = [];
            let socialIndex = 0;
            while (formData.has(`socialPlatform_${socialIndex}`)) {
                const platform = formData.get(`socialPlatform_${socialIndex}`);
                const url = formData.get(`socialUrl_${socialIndex}`);
                if (platform && url) {
                    socialLinks.push({ platform, url });
                }
                socialIndex++;
            }
            updatedMeta.socialLinks = socialLinks;
            
            // Process top posts
            const topIncitingPosts = [];
            let postIndex = 0;
            while (formData.has(`postText_${postIndex}`)) {
                const text = formData.get(`postText_${postIndex}`);
                const url = formData.get(`postUrl_${postIndex}`);
                if (text) {
                    topIncitingPosts.push({
                        text,
                        excerpt: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                        url: url || '#',
                        timestamp: new Date().toISOString()
                    });
                }
                postIndex++;
            }
            updatedMeta.topIncitingPosts = topIncitingPosts;
            
            saveSessionMeta(session.id, updatedMeta);
            modal.remove();
            
            // Refresh sessions to show updated data
            const updatedSessions = sessions.map(s => 
                s.id === session.id ? { ...s, __metaUpdated: Date.now() } : s
            );
            if (setSessions) {
                setSessions(updatedSessions);
            }
            
            // Show success message
            const successToast = document.createElement('div');
            successToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successToast.innerHTML = '<i class="fas fa-check ml-2"></i>تم حفظ التعديلات بنجاح';
            document.body.appendChild(successToast);
            setTimeout(() => successToast.remove(), 3000);
        });
    };

    // Export selected sessions to Word
    const [selectedSessions, setSelectedSessions] = useState(new Set());
    const [showExportModal, setShowExportModal] = useState(false);

    const toggleSessionSelection = (sessionId) => {
        const newSelected = new Set(selectedSessions);
        if (newSelected.has(sessionId)) {
            newSelected.delete(sessionId);
        } else {
            newSelected.add(sessionId);
        }
        setSelectedSessions(newSelected);
    };

    const exportSelectedSessions = () => {
        if (selectedSessions.size === 0) {
            alert('يرجى اختيار جلسة واحدة على الأقل');
            return;
        }
        
        const selectedSessionsData = sessions.filter(s => selectedSessions.has(s.id));
        const exportData = selectedSessionsData.map(session => {
            const summary = getEnhancedProfileSummary(session);
            return {
                fullName: summary?.fullName || 'غير محدد',
                phone: summary?.phone || 'غير محدد',
                location: summary?.location || 'غير محدد',
                currentLocation: summary?.currentLocation || 'غير محدد',
                work: summary?.work || 'غير محدد',
                socialLinks: summary?.socialLinks?.map(link => `${link.platform}: ${link.url}`).join('<br/>') || 'غير محدد',
                topIncitingPosts: summary?.topIncitingPosts?.map(post => 
                    `• ${post.excerpt}<br/><small>الرابط: ${post.url}</small>`
                ).join('<br/><br/>') || 'غير محدد',
                incitementSummary: summary?.incitementSummary || 'غير محدد',
                recommendations: summary?.recommendations || 'غير محدد',
                profileLink: `${window.location.origin}#session_${session.id}`
            };
        });
        
        // Generate Word document using HTML table
        const htmlContent = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Arial', sans-serif; direction: rtl; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: right; vertical-align: top; }
                    th { background-color: #f0f0f0; font-weight: bold; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .social-links { font-size: 12px; }
                    .top-posts { font-size: 11px; max-width: 200px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>تقرير الجلسات المحفوظة</h1>
                    <p>تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}</p>
                    <p>عدد الجلسات: ${exportData.length}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>الاسم الكامل</th>
                            <th>رقم الهاتف</th>
                            <th>المديرية</th>
                            <th>مكان التواجد</th>
                            <th>العمل</th>
                            <th>روابط الحسابات</th>
                            <th>أبرز المنشورات التحريضية</th>
                            <th>النشاط التحريضي</th>
                            <th>التوصيات</th>
                            <th>رابط الملف</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exportData.map(row => `
                            <tr>
                                <td><strong>${row.fullName}</strong></td>
                                <td>${row.phone}</td>
                                <td>${row.location}</td>
                                <td>${row.currentLocation}</td>
                                <td>${row.work}</td>
                                <td class="social-links">${row.socialLinks}</td>
                                <td class="top-posts">${row.topIncitingPosts}</td>
                                <td>${row.incitementSummary}</td>
                                <td>${row.recommendations}</td>
                                <td><a href="${row.profileLink}">عرض الملف</a></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        // Create and download the file
        const blob = new Blob([htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `تقرير_الجلسات_${new Date().toISOString().split('T')[0]}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setShowExportModal(false);
        setSelectedSessions(new Set());
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">الجلسات المحفوظة</h2>
                <p className="text-gray-600">جميع بيانات فيسبوك المحفوظة سابقاً</p>
                
                {/* Export Button */}
                <div className="mt-4 flex justify-center gap-4">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                    >
                        <i className="fas fa-file-word ml-2"></i>
                        تصدير الجلسات المحددة
                    </button>
                </div>
                
                {/* Storage Info */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                        <i className="fas fa-info-circle ml-1"></i>
                        مساحة التخزين: {(() => {
                            try {
                                const size = JSON.stringify(sessions).length;
                                return formatBytes(size);
                            } catch {
                                return 'غير محدد';
                            }
                        })()} / 5 MB
                    </p>
                </div>
            </div>

            {sessions.length === 0 ? (
                <div className="text-center py-12">
                    <i className="fas fa-archive text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500 text-lg mb-4">لا توجد جلسات محفوظة</p>
                    <button
                        onClick={() => setCurrentPage('home')}
                        className="btn-primary text-white px-6 py-2 rounded-lg font-medium"
                    >
                        إنشاء جلسة جديدة
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                    {sessions.map((session) => {
                        const summary = getEnhancedProfileSummary(session);
                        return (
                            <div
                                key={session.id}
                                className="session-card bg-white rounded-lg shadow-lg overflow-hidden fade-in border hover:border-blue-300 transition-all"
                            >
                                {/* Session Header with Selection */}
                                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 space-x-reverse">
                                            <input
                                                type="checkbox"
                                                checked={selectedSessions.has(session.id)}
                                                onChange={() => toggleSessionSelection(session.id)}
                                                className="w-5 h-5 text-blue-600 ml-3"
                                            />
                                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                <i className="fab fa-facebook text-2xl"></i>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{summary?.fullName || session.name}</h3>
                                                <p className="text-blue-100 text-sm">الجلسة: {session.name}</p>
                                                <p className="text-blue-100 text-sm">{formatDate(session.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showEditModal(session, summary);
                                                }}
                                                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                                                title="تعديل البيانات"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    exportSessionToPDF(session);
                                                }}
                                                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                                                title="تصدير PDF"
                                            >
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button
                                                onClick={(e) => deleteSession(session.id, e)}
                                                className="bg-white bg-opacity-20 hover:bg-red-500 text-white p-2 rounded-lg transition-all"
                                                title="حذف الجلسة"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Profile Summary */}
                                {summary && (
                                    <div className="p-6 space-y-4">
                                        {/* Basic Information Grid */}
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div className="space-y-3">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">الاسم الكامل:</span>
                                                    <p className="text-gray-800 mt-1">{summary.fullName}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">المديرية:</span>
                                                    <p className="text-gray-800 mt-1">{summary.location}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">رقم الهاتف:</span>
                                                    <p className="text-gray-800 mt-1">{summary.phone}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">مكان التواجد الحالي:</span>
                                                    <p className="text-gray-800 mt-1">{summary.currentLocation}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">العمل:</span>
                                                    <p className="text-gray-800 mt-1">{summary.work}</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <span className="font-semibold text-gray-600">المتابعون:</span>
                                                    <p className="text-gray-800 mt-1">{summary.followers.toLocaleString('ar-SA')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Social Media Links */}
                                        {summary.socialLinks && summary.socialLinks.length > 0 && (
                                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-800 mb-3">
                                                    <i className="fas fa-share-alt ml-2"></i>
                                                    روابط حسابات التواصل الاجتماعي:
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {summary.socialLinks.map((link, index) => (
                                                        <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" 
                                                           className="inline-flex items-center bg-white border border-blue-300 rounded-lg px-3 py-2 text-sm hover:bg-blue-50 transition-colors">
                                                            <i className={`fab fa-${link.platform.toLowerCase()} text-blue-600 ml-2`}></i>
                                                            <span className="text-blue-800">{link.platform}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Top Inciting Posts */}
                                        {summary.topIncitingPosts && summary.topIncitingPosts.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                                <h4 className="font-semibold text-red-800 mb-3">
                                                    <i className="fas fa-exclamation-triangle ml-2"></i>
                                                    أبرز المنشورات التحريضية:
                                                </h4>
                                                <div className="space-y-3">
                                                    {summary.topIncitingPosts.map((post, index) => (
                                                        <div key={index} className="bg-white border border-red-200 rounded-lg p-3">
                                                            <div className="flex items-start space-x-3 space-x-reverse">
                                                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-red-700 text-sm leading-relaxed mb-2">{post.excerpt}</p>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-red-500 text-xs">
                                                                            {formatDate(post.timestamp)}
                                                                        </span>
                                                                        {post.url && post.url !== '#' && (
                                                                            <a href={post.url} target="_blank" rel="noopener noreferrer" 
                                                                               className="text-red-600 hover:text-red-800 text-xs">
                                                                                <i className="fas fa-external-link-alt ml-1"></i>
                                                                                عرض المنشور
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Incitement Summary */}
                                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                            <h4 className="font-semibold text-red-800 mb-2">
                                                <i className="fas fa-exclamation-triangle ml-2"></i>
                                                ملخص النشاط التحريضي:
                                            </h4>
                                            <p className="text-red-700 text-sm leading-relaxed">{summary.incitementSummary}</p>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                                            <h4 className="font-semibold text-purple-800 mb-2">
                                                <i className="fas fa-clipboard-list ml-2"></i>
                                                التوصيات والمقترحات:
                                            </h4>
                                            <p className="text-purple-700 text-sm leading-relaxed">{summary.recommendations}</p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 pt-4 border-t">
                                            <button
                                                onClick={() => loadSession(session)}
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                                            >
                                                <i className="fas fa-eye ml-2"></i>
                                                عرض الملف الكامل
                                            </button>
                                            
                                            {!summary.aiSummary && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        generateAISummaryForSession(session, summary);
                                                    }}
                                                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                                                >
                                                    <i className="fas fa-brain ml-2"></i>
                                                    تحليل ذكي
                                                </button>
                                            )}
                                        </div>

                                        {/* Technical Info */}
                                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                                            <span>الحجم: {session.size ? formatBytes(session.size) : 'غير محدد'}</span>
                                            <span>النوع: {session.compressed ? 'مضغوط' : 'عادي'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Export Modal */}
            {showExportModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">تصدير الجلسات المحددة</h3>
                            <button onClick={() => setShowExportModal(false)} className="text-gray-500 hover:text-gray-700">
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600 mb-4">تم اختيار {selectedSessions.size} جلسة للتصدير</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {sessions.filter(s => selectedSessions.has(s.id)).map(session => {
                                    const summary = getEnhancedProfileSummary(session);
                                    return (
                                        <div key={session.id} className="bg-gray-50 p-3 rounded flex justify-between items-center">
                                            <span>{summary?.fullName || session.name}</span>
                                            <button
                                                onClick={() => toggleSessionSelection(session.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={exportSelectedSessions}
                                disabled={selectedSessions.size === 0}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                            >
                                <i className="fas fa-file-word ml-2"></i>
                                تصدير إلى Word
                            </button>
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Helper function to format bytes
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export for use in other files
window.SessionsPage = SessionsPage;