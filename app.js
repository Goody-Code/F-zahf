// app.js
import { loadSessionsFromSupabase, saveSessionToSupabase, deleteSessionFromSupabase, supabase } from './supabaseService.js';

function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [sessionData, setSessionData] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading true
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
    const [appMessage, setAppMessage] = useState(null); // For user feedback

    // Utility functions (compressData, decompressData)
    const compressData = (data) => {
        try {
            const jsonString = JSON.stringify(data);
            const minified = jsonString.replace(/\s+/g, ' ').replace(/: /g, ':').replace(/, /g, ',');
            const compressed = btoa(encodeURIComponent(minified));
            return compressed;
        } catch (error) { console.error('Compression failed:', error); return null; }
    };

    const decompressData = (compressedData) => {
        if (!compressedData) return null;
        try {
            const decompressed = decodeURIComponent(atob(compressedData));
            return JSON.parse(decompressed);
        } catch (error) { console.error('Decompression failed:', error); return null; }
    };
    window.decompressData = decompressData; // Make globally available for now

    useEffect(() => {
        async function initializeAppAndLoadSessions() {
            setLoading(true);
            setAppMessage("جاري الاتصال بقاعدة البيانات...");
            try {
                const { error } = await supabase.from('sessions').select('id', { head: true }).limit(1);
                if (error && error.message !== 'relation "sessions" does not exist' && !error.message.includes("schema "public" does not exist")) {
                    console.warn('Supabase connection check failed:', error.message);
                    setIsSupabaseConnected(false);
                    setAppMessage({ text: "فشل الاتصال بقاعدة البيانات. يتم استخدام التخزين المحلي.", type: "error" });
                } else {
                    setIsSupabaseConnected(true);
                    setAppMessage({ text: "متصل بقاعدة البيانات.", type: "success" });
                    if (error && (error.message === 'relation "sessions" does not exist"')) {
                         setAppMessage({ text: "متصل بقاعدة البيانات, ولكن جدول 'sessions' غير موجود. يرجى إنشائه.", type: "warning" });
                    }
                }
            } catch (e) {
                console.error("Supabase client initialization error:", e);
                setIsSupabaseConnected(false);
                setAppMessage({ text: "خطأ فادح في الاتصال بقاعدة البيانات. يتم استخدام التخزين المحلي.", type: "error" });
            }
            await loadSessions(); // loadSessions will use isSupabaseConnected
            setLoading(false);
            if (!isSupabaseConnected) {
                checkAndCleanStorage(); // localStorage specific
            }
        }
        initializeAppAndLoadSessions();
    }, []);

    const showAppMessage = (message, type = 'info', duration = 3000) => {
        setAppMessage({ text: message, type });
        setTimeout(() => setAppMessage(null), duration);
    };

    const migrateLocalStorageToSupabase = async () => {
        setLoading(true);
        showAppMessage("جاري ترحيل البيانات المحلية إلى Supabase...", "info", 10000);
        const localSessionsRaw = localStorage.getItem('facebook_sessions');
        if (!localSessionsRaw) {
            showAppMessage("لا توجد بيانات محلية لترحيلها.", "info");
            setLoading(false);
            return;
        }
        const localSessions = JSON.parse(localSessionsRaw || '[]');
        if (localSessions.length === 0) {
            showAppMessage("البيانات المحلية فارغة، لا شيء للترحيل.", "info");
            setLoading(false);
            return;
        }

        let migratedCount = 0;
        let failedCount = 0;
        for (const localSession of localSessions) {
            let profileData = localSession.profile_data;
            let postsData = localSession.posts_data;
            if (localSession.compressed && !profileData && localSession.compressed_profile) {
                profileData = decompressData(localSession.compressed_profile);
            }
            if (localSession.compressed && !postsData && localSession.compressed_posts) {
                postsData = decompressData(localSession.compressed_posts);
            }

            const supabaseSessionData = {
                name: localSession.name,
                compressed_profile: localSession.compressed_profile,
                compressed_posts: localSession.compressed_posts,
                created_at: localSession.created_at,
                metadata: localSession.metadata || {},
                profile_data: profileData,
                posts_data: postsData
            };
            
            const savedToSupabase = await saveSessionToSupabase(supabaseSessionData);
            if (savedToSupabase) {
                migratedCount++;
            } else {
                failedCount++;
                console.warn(`Failed to migrate session ${localSession.name} (ID: ${localSession.id}) to Supabase.`);
            }
        }

        if (failedCount > 0) {
            showAppMessage(`اكتمل الترحيل. تم ترحيل ${migratedCount} جلسة. فشل ترحيل ${failedCount} جلسة.`, "warning", 5000);
        } else {
            showAppMessage(`تم ترحيل ${migratedCount} جلسة بنجاح إلى Supabase!`, "success", 5000);
        }

        if (migratedCount > 0 && failedCount === 0) {
            // Optional: Clear localStorage after successful migration of all items
            // localStorage.removeItem('facebook_sessions');
            // showAppMessage("تم حذف البيانات المحلية بعد الترحيل الناجح.", "info", 4000);
        }
        await loadSessions(); // Reload sessions from Supabase
        setLoading(false);
    };

    const loadSessions = async () => {
        setLoading(true);
        let loadedSessions = [];
        let fromSupabase = false;

        if (isSupabaseConnected) {
            showAppMessage("جاري تحميل الجلسات من قاعدة البيانات...", "info", 2000);
            const supabaseSessions = await loadSessionsFromSupabase();
            if (supabaseSessions !== null) {
                loadedSessions = supabaseSessions;
                fromSupabase = true;
                if (loadedSessions.length === 0 && (localStorage.getItem('facebook_sessions') || '[]') !== '[]') {
                    showAppMessage("قاعدة البيانات فارغة. هل ترغب في ترحيل البيانات المحلية؟", "info", 10000);
                    // Migration button will be visible in settings
                } else if (loadedSessions.length > 0) {
                     showAppMessage(`تم تحميل ${loadedSessions.length} جلسة من قاعدة البيانات.`, "success");
                } else {
                     showAppMessage("لا توجد جلسات في قاعدة البيانات.", "info");
                }
            } else {
                showAppMessage("فشل تحميل الجلسات من قاعدة البيانات. يتم عرض البيانات المحلية.", "error");
                // Fall through to localStorage
            }
        }

        if (!fromSupabase) {
            showAppMessage("جاري تحميل الجلسات من التخزين المحلي...", "info", 2000);
            try {
                const storedSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
                loadedSessions = storedSessions.map(session => ({
                    ...session,
                    profile_data: session.compressed ? decompressData(session.compressed_profile) : session.profile_data,
                    posts_data: session.compressed ? decompressData(session.compressed_posts) : session.posts_data,
                }));
                 showAppMessage(loadedSessions.length > 0 ? `تم تحميل ${loadedSessions.length} جلسة من التخزين المحلي.` : "لا توجد جلسات في التخزين المحلي.", "info");
            } catch (error) {
                console.error('Failed to load sessions from localStorage:', error);
                localStorage.removeItem('facebook_sessions');
                loadedSessions = [];
                showAppMessage("فشل تحميل الجلسات من التخزين المحلي.", "error");
            }
        }
        setSessions(loadedSessions);
        setLoading(false);
    };

    const saveSession = async (name, profileData, postsData) => {
        setLoading(true);
        showAppMessage("جاري حفظ الجلسة...", "info", 5000);
        try {
            const compressedProfile = compressData(profileData);
            const compressedPosts = compressData(postsData);
            if (!compressedProfile || !compressedPosts) throw new Error('فشل في ضغط البيانات');

            const sessionToSave = {
                name,
                compressed_profile: compressedProfile,
                compressed_posts: compressedPosts,
                created_at: new Date().toISOString(),
                profile_data: profileData,
                posts_data: postsData,
                metadata: {}
            };

            let savedSession;
            if (isSupabaseConnected) {
                savedSession = await saveSessionToSupabase(sessionToSave);
                if (savedSession) {
                    showAppMessage("تم حفظ الجلسة في قاعدة البيانات بنجاح!", "success");
                } else {
                    showAppMessage("فشل حفظ الجلسة في قاعدة البيانات. يتم الحفظ محلياً.", "warning");
                }
            }

            if (!savedSession) { // Fallback to localStorage
                const localId = Date.now().toString();
                const localSession = { ...sessionToSave, id: localId, compressed: true, size: (compressedProfile.length + compressedPosts.length) };
                checkAndCleanStorage(); // localStorage specific
                const existingSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
                existingSessions.unshift(localSession);
                const limitedSessions = existingSessions.slice(0, 5);
                localStorage.setItem('facebook_sessions', JSON.stringify(limitedSessions));
                savedSession = localSession;
                showAppMessage("تم حفظ الجلسة في التخزين المحلي.", "success");
            }
            
            await loadSessions();
            setLoading(false);
            return savedSession;

        } catch (error) {
            setLoading(false);
            console.error('Save session error:', error);
            showAppMessage(`خطأ في حفظ الجلسة: ${error.message}`, "error");
            if (error.name === 'QuotaExceededError') {
                showAppMessage('مساحة التخزين المحلية ممتلئة.', "error");
            }
            throw error;
        }
    };

    const handleDeleteSession = async (sessionId) => {
        setLoading(true);
        showAppMessage("جاري حذف الجلسة...", "info", 5000);
        let success = false;
        const sessionToDelete = sessions.find(s => s.id === sessionId);

        if (isSupabaseConnected && sessionToDelete?.supabase_id) { // Check if it's a Supabase session
            success = await deleteSessionFromSupabase(sessionToDelete.supabase_id);
            if (success) {
                 showAppMessage("تم حذف الجلسة من قاعدة البيانات.", "success");
            } else {
                 showAppMessage("فشل حذف الجلسة من قاعدة البيانات.", "error");
            }
        }

        // Also try to delete from localStorage if it exists there or if Supabase failed for a local-only item
        const localSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
        const newLocalSessions = localSessions.filter(s => s.id !== sessionId);
        if (newLocalSessions.length < localSessions.length) {
            localStorage.setItem('facebook_sessions', JSON.stringify(newLocalSessions));
            if (!success) showAppMessage("تم حذف الجلسة من التخزين المحلي.", "success");
            else showAppMessage("تم تنظيف الجلسة من التخزين المحلي أيضاً.", "info");
            success = true; // Mark success if local deletion happened
        }

        if (success) {
            await loadSessions(); // Refresh the list
        } else {
            showAppMessage("لم يتم العثور على الجلسة للحذف أو فشلت العملية.", "warning");
        }
        setLoading(false);
    };


    // localStorage specific cleanup (conditionally run)
    const getStorageSize = () => { /* ... existing ... */ return 0;};
    const formatBytes = (bytes) => { /* ... existing ... */ return '';};
    const checkAndCleanStorage = () => { if (isSupabaseConnected) return; /* ... existing ... */};
    const showStorageCleanupModal = () => { /* ... existing ... */};
    const forceCleanup = async () => { if (isSupabaseConnected) return; /* ... existing ... */};
    // Note: Implementations for getStorageSize, formatBytes, checkAndCleanStorage, showStorageCleanupModal, forceCleanup
    // should be copied from the original app.js if they are to be kept for non-Supabase scenarios.
    // For brevity, I'm ommitting their full code here, but they were in the previous analysis.


    return (
        <div className="min-h-screen bg-gray-50">
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-xl text-center">
                        <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                        <p className="text-gray-700">{typeof appMessage?.text === 'string' ? appMessage.text : 'جاري التحميل...'}</p>
                    </div>
                </div>
            )}
            {appMessage && !loading && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white ${appMessage.type === 'error' ? 'bg-red-500' : appMessage.type === 'warning' ? 'bg-yellow-500' : appMessage.type === 'success' ? 'bg-green-500' : 'bg-blue-500'} z-40`}>
                    {appMessage.text}
                </div>
            )}

            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
            <main className="container mx-auto px-4 py-8">
                {currentPage === 'home' && <HomePage setSessionData={setSessionData} setCurrentPage={setCurrentPage} saveSession={saveSession} loading={loading} setLoading={setLoading} />}
                {currentPage === 'profile' && sessionData && <ProfilePage sessionData={sessionData} />}
                {currentPage === 'sessions' && <SessionsPage sessions={sessions} setSessionData={setSessionData} setCurrentPage={setCurrentPage} loadSessions={loadSessions} handleDeleteSession={handleDeleteSession} isSupabaseConnected={isSupabaseConnected} decompressDataFn={decompressData} />}
                {currentPage === 'settings' && <SettingsPage isSupabaseConnected={isSupabaseConnected} onMigrate={migrateLocalStorageToSupabase} />}
            </main>
        </div>
    );
}
// Initialize app
async function initializeApp() { ReactDOM.render(<App />, document.getElementById('root')); }
initializeApp();