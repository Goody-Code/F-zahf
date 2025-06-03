// components/SessionsPage.js
// Props: sessions, setSessionData, setCurrentPage, loadSessions, handleDeleteSession, isSupabaseConnected, decompressDataFn
// (Supabase specific functions like updateSessionMetadataInSupabase can be imported from supabaseService if needed directly here)
import { updateSessionMetadataInSupabase } from '../supabaseService.js'; // Adjust path if needed

function SessionsPage({
    sessions, setSessionData, setCurrentPage,
    loadSessions, handleDeleteSession, isSupabaseConnected, decompressDataFn
}) {
    const decompressData = decompressDataFn; // Use passed down decompress function

    const formatDate = (dateString) => { /* ... existing ... */ return new Date(dateString).toLocaleDateString('ar-SA'); };
    const formatBytes = (bytes) => { /* ... existing ... */ if(bytes===0) return '0 B'; const k=1024,dm=2,sizes=['B','KB','MB'],i=Math.floor(Math.log(bytes)/Math.log(k));return parseFloat((bytes/Math.pow(k,i)).toFixed(dm))+' '+sizes[i]; };


    const handleLoadSession = (session) => {
        // Data should already be decompressed by app.js loadSessions
        const activeSessionData = {
            id: session.id, // This could be Supabase ID or local ID
            supabase_id: session.supabase_id || (isSupabaseConnected && !/^[0-9]+$/.test(session.id) ? session.id : null),
            name: session.name,
            profile: session.profile_data,
            posts: session.posts_data,
            created_at: session.created_at,
            intelligenceReport: session.metadata?.edited_report || session.intelligence_report, // Prioritize from metadata
            metadata: session.metadata || {}
        };
        localStorage.setItem('current_session_data', JSON.stringify(activeSessionData)); // For cross-page state if needed
        setSessionData(activeSessionData);
        setCurrentPage('profile');
    };

    const getEnhancedProfileSummary = (session) => {
        try {
            const profile = session.profile_data;
            const posts = session.posts_data;
            if (!profile) return { sessionName: session.name, fullName: session.name };

            const meta = session.metadata || {};
            const accountId = profile.pageId || profile.facebookId || session.id;
            
            // Fallback to localStorage for items not yet in session.metadata (transitional)
            const localPhone = localStorage.getItem(`profile_${accountId}_phone`);
            const localLocation = localStorage.getItem(`profile_${accountId}_location`);
            const localSessionMeta = JSON.parse(localStorage.getItem(`session_meta_${session.id}`) || '{}');
            const localAiSummary = localStorage.getItem(`ai_summary_${session.id}`) ? JSON.parse(localStorage.getItem(`ai_summary_${session.id}`)) : null;

            const summary = {
                sessionName: session.name,
                fullName: meta.fullName || localSessionMeta.fullName || profile.title || profile.name || 'غير محدد',
                location: meta.location || localLocation || localSessionMeta.location || profile.LOCATION || 'غير محدد',
                currentLocation: meta.currentLocation || localSessionMeta.currentLocation || 'غير محدد',
                work: meta.work || localSessionMeta.work || profile.WORK || 'غير محدد',
                phone: meta.phone || localPhone || localSessionMeta.phone || profile.phone || 'غير محدد',
                incitementSummary: meta.incitementSummary || localSessionMeta.incitementSummary || 'لم يتم التحليل',
                socialLinks: meta.socialLinks || localSessionMeta.socialLinks || [],
                topIncitingPosts: meta.topIncitingPosts || localSessionMeta.topIncitingPosts || [],
                followers: profile.followers || profile.likes || 0,
                recommendations: meta.recommendations || localSessionMeta.recommendations || 'لم يتم تحديد توصيات',
                aiSummary: meta.ai_summary || localAiSummary,
                threatLevel: meta.threatLevel || localSessionMeta.threatLevel || 'غير محدد'
            };
            // Build social links / top posts from raw data if not in metadata (initial population)
             if (summary.socialLinks.length === 0 && profile.websites) { /* ... build ... */ }
             if (summary.topIncitingPosts.length === 0 && posts) { /* ... build ... */ }
            return summary;
        } catch (error) { console.error('Error in getEnhancedProfileSummary:', error); return { sessionName: session.name }; }
    };

    const handleSaveSessionMeta = async (sessionId, newMetaData) => {
        if (isSupabaseConnected && sessionId && !/^[0-9]+$/.test(sessionId)) { // Is a Supabase ID
            const currentSession = sessions.find(s => s.id === sessionId);
            const mergedMeta = { ...(currentSession?.metadata || {}), ...newMetaData };
            const updatedSession = await updateSessionMetadataInSupabase(sessionId, mergedMeta);
            if (updatedSession) {
                // alert("تم تحديث البيانات الوصفية في Supabase.");
                loadSessions(); // Refresh
            } else {
                alert("فشل تحديث البيانات الوصفية في Supabase. يتم الحفظ محلياً.");
                localStorage.setItem(`session_meta_${sessionId}`, JSON.stringify(newMetaData)); // Fallback
            }
        } else { // Local session or Supabase not connected
            localStorage.setItem(`session_meta_${sessionId}`, JSON.stringify(newMetaData));
            // alert("تم حفظ البيانات الوصفية محلياً.");
        }
         // Optimistically update UI or rely on loadSessions
        const updatedSessions = sessions.map(s =>
            s.id === sessionId ? { ...s, metadata: {...(s.metadata || {}), ...newMetaData}, __metaUpdated: Date.now() } : s
        );
        // setSessions is not directly available, parent should handle via loadSessions
        if (typeof window.setAppSessions === 'function') window.setAppSessions(updatedSessions); // Hacky, better to use loadSessions
        else loadSessions();

    };

    const showEditModal = (session, summary) => {
        // ... existing modal display logic ...
        // On form submit, call handleSaveSessionMeta:
        // document.getElementById('editSessionForm').addEventListener('submit', (e) => {
        //    e.preventDefault(); /* ... gather formData ... */
        //    handleSaveSessionMeta(session.id, collectedMetaData);
        //    modal.remove();
        // });
        // This part needs the full modal HTML and form processing logic from original SessionsPage.js
        // For brevity, I'm not including the giant modal HTML string here. Assume it exists and calls handleSaveSessionMeta.
        console.log("Show edit modal for session:", session.id, "Current summary:", summary);
        alert("واجهة تعديل البيانات الوصفية - تحتاج إلى دمج HTML الخاص بها.");
    };


    // ... (Other functions like generateAISummaryForSession, exportSessionToPDF would need similar logic:
    // check isSupabaseConnected, use Supabase service, fallback to localStorage)

    const [selectedSessions, setSelectedSessions] = useState(new Set());
    // ... (exportSelectedSessions, toggleSessionSelection, etc. remain largely the same conceptually)


    return (
        <div className="max-w-6xl mx-auto">
            {/* ... existing JSX structure ... */}
            {/* Modify buttons to use handleDeleteSession(session.id) and handleLoadSession(session) */}
            {/* Example for a session card: */}
            {sessions.map((session) => {
                const summary = getEnhancedProfileSummary(session);
                return (
                    <div key={session.id} className="session-card bg-white rounded-lg shadow-lg">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{summary?.fullName || session.name}</h3>
                                    <p className="text-blue-100 text-sm">تاريخ: {formatDate(session.created_at)}</p>
                                    <p className="text-xs text-blue-200">ID: {session.id} {session.supabase_id && session.id !== session.supabase_id ? `(Supabase: ${session.supabase_id.substring(0,8)})` : ''}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => showEditModal(session, summary)} title="تعديل"><i className="fas fa-edit"></i></button>
                                    <button onClick={() => handleDeleteSession(session.id)} title="حذف"><i className="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>
                        {/* Body */}
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-2">الموقع: {summary?.location}</p>
                            <p className="text-sm text-gray-600 mb-4">ملخص التحريض: {summary?.incitementSummary}</p>
                            <button onClick={() => handleLoadSession(session)} className="btn-primary">عرض الملف الكامل</button>
                             {isSupabaseConnected && !session.supabase_id && /^[0-9]+$/.test(session.id) && (
                                <p className="text-xs text-orange-500 mt-2">هذه الجلسة محلية. يمكنك ترحيلها من الإعدادات.</p>
                            )}
                        </div>
                        <div className="p-2 border-t text-xs text-gray-400">الحجم: {formatBytes(session.size || 0)}</div>
                    </div>
                );
            })}
            {/* ... rest of JSX ... */}
        </div>
    );
}
window.SessionsPage = SessionsPage; // Ensure it's globally available if not using module bundling for components