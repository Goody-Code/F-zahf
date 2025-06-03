// Main App Component
function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [sessionData, setSessionData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSessions();
        // Check storage on app start
        checkAndCleanStorage();
    }, []);

    // Enhanced compression utility functions
    const compressData = (data) => {
        try {
            const jsonString = JSON.stringify(data);
            // Remove unnecessary whitespace and compress further
            const minified = jsonString.replace(/\s+/g, ' ').replace(/: /g, ':').replace(/, /g, ',');
            const compressed = btoa(encodeURIComponent(minified));
            return compressed;
        } catch (error) {
            console.error('Compression failed:', error);
            return null;
        }
    };

    const decompressData = (compressedData) => {
        try {
            const decompressed = decodeURIComponent(atob(compressedData));
            return JSON.parse(decompressed);
        } catch (error) {
            console.error('Decompression failed:', error);
            return null;
        }
    };

    // Enhanced storage management
    const getStorageSize = () => {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const checkAndCleanStorage = () => {
        try {
            const storageSize = getStorageSize();
            const maxStorage = 5 * 1024 * 1024; // 5MB limit
            
            if (storageSize > maxStorage * 0.8) { // If 80% full
                const sessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
                if (sessions.length > 3) {
                    // Keep only 3 most recent sessions
                    const recentSessions = sessions.slice(0, 3);
                    localStorage.setItem('facebook_sessions', JSON.stringify(recentSessions));
                    setSessions(recentSessions);
                    
                    // Show cleanup notification
                    showStorageCleanupModal();
                }
            }
        } catch (error) {
            console.error('Storage check failed:', error);
        }
    };

    const showStorageCleanupModal = () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-blue-500 text-6xl mb-4">
                        <i class="fas fa-broom"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">تنظيف تلقائي للتخزين</h3>
                    <p class="text-gray-600 mb-4">تم حذف الجلسات القديمة تلقائياً لتوفير مساحة</p>
                    <button onclick="this.closest('.modal-overlay').remove()" class="bg-blue-500 text-white px-6 py-2 rounded-lg">
                        حسناً
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 3000);
    };

    const loadSessions = async () => {
        try {
            // Load from localStorage only
            const storedSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
            setSessions(storedSessions);
        } catch (error) {
            console.error('Failed to load sessions:', error);
            // Clear corrupted data
            localStorage.removeItem('facebook_sessions');
            setSessions([]);
        }
    };

    const saveSession = async (name, profileData, postsData) => {
        try {
            // Check storage before processing
            const currentSize = getStorageSize();
            const estimatedSize = JSON.stringify({ profileData, postsData }).length;
            const maxStorage = 5 * 1024 * 1024; // 5MB
            
            if (currentSize + estimatedSize > maxStorage) {
                // Force cleanup first
                await forceCleanup();
            }

            // Enhanced compression with chunking for large data
            const compressedProfile = compressData(profileData);
            const compressedPosts = compressData(postsData);
            
            if (!compressedProfile || !compressedPosts) {
                throw new Error('فشل في ضغط البيانات');
            }

            const sessionId = Date.now().toString();
            const session = {
                id: sessionId,
                name,
                compressed_profile: compressedProfile,
                compressed_posts: compressedPosts,
                created_at: new Date().toISOString(),
                compressed: true,
                size: (compressedProfile.length + compressedPosts.length)
            };
            
            const existingSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
            
            // Try to save
            try {
                existingSessions.unshift(session);
                // Keep only last 5 sessions maximum
                const limitedSessions = existingSessions.slice(0, 5);
                localStorage.setItem('facebook_sessions', JSON.stringify(limitedSessions));
                setSessions(limitedSessions);
            } catch (quotaError) {
                // If still quota exceeded, force more aggressive cleanup
                const emergencySessions = existingSessions.slice(0, 2);
                localStorage.setItem('facebook_sessions', JSON.stringify([session, ...emergencySessions]));
                setSessions([session, ...emergencySessions]);
            }
            
            // Return session with original data for current use
            return {
                ...session,
                profile_data: profileData,
                posts_data: postsData
            };
            
        } catch (error) {
            console.error('Save session error:', error);
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                throw new Error('مساحة التخزين ممتلئة. يتم الآن تنظيف البيانات القديمة...');
            }
            throw error;
        }
    };

    const forceCleanup = async () => {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="text-center">
                        <div class="text-orange-500 text-6xl mb-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">مساحة التخزين ممتلئة</h3>
                        <p class="text-gray-600 mb-4">سيتم حذف الجلسات القديمة تلقائياً</p>
                        <div class="flex gap-4 justify-center">
                            <button onclick="cleanupAndContinue()" class="bg-orange-500 text-white px-6 py-2 rounded-lg">
                                تنظيف والمتابعة
                            </button>
                            <button onclick="this.closest('.modal-overlay').remove(); window.cleanupReject()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            window.cleanupAndContinue = () => {
                try {
                    // Clear all sessions except current
                    localStorage.setItem('facebook_sessions', '[]');
                    setSessions([]);
                    modal.remove();
                    resolve();
                } catch (error) {
                    console.error('Cleanup failed:', error);
                    resolve();
                }
            };
            
            window.cleanupReject = () => {
                resolve();
            };
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            <main className="container mx-auto px-4 py-8">
                {currentPage === 'home' && (
                    <HomePage 
                        setSessionData={setSessionData}
                        setCurrentPage={setCurrentPage}
                        saveSession={saveSession}
                        loading={loading}
                        setLoading={setLoading}
                    />
                )}
                
                {currentPage === 'profile' && sessionData && (
                    <ProfilePage sessionData={sessionData} />
                )}
                
                {currentPage === 'sessions' && (
                    <SessionsPage 
                        sessions={sessions}
                        setSessionData={setSessionData}
                        setCurrentPage={setCurrentPage}
                        setSessions={setSessions}
                    />
                )}
                
                {currentPage === 'settings' && (
                    <SettingsPage />
                )}
            </main>
        </div>
    );
}

// Initialize app without Supabase
async function initializeApp() {
    // Start the app directly without Supabase initialization
    ReactDOM.render(<App />, document.getElementById('root'));
}

// Start the app
initializeApp();