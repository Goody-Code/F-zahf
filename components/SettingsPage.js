// components/SettingsPage.js
function SettingsPage({ isSupabaseConnected, onMigrate }) {
    const [localSessionsCount, setLocalSessionsCount] = React.useState(0);

    React.useEffect(() => {
        const localSessions = JSON.parse(localStorage.getItem('facebook_sessions') || '[]');
        setLocalSessionsCount(localSessions.length);
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">الإعدادات</h2>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">اتصال قاعدة البيانات (Supabase)</h3>
                <p className={`text-sm ${isSupabaseConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {isSupabaseConnected ?
                        <><i className="fas fa-check-circle ml-1"></i> متصل بنجاح بقاعدة البيانات السحابية.</> :
                        <><i className="fas fa-times-circle ml-1"></i> غير متصل بقاعدة البيانات. يتم استخدام التخزين المحلي للمتصفح.</>}
                </p>
                 {!isSupabaseConnected && (
                    <p className="text-xs text-gray-500 mt-1">
                        لتفعيل المزامنة السحابية والميزات المتقدمة، تأكد من إعداد Supabase وإنشاء جدول 'sessions'.
                    </p>
                )}
            </div>

            {isSupabaseConnected && localSessionsCount > 0 && (
                 <div className="mb-6 p-4 border rounded-md bg-blue-50 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">ترحيل البيانات المحلية</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        لديك <strong className="text-blue-700">{localSessionsCount}</strong> جلسة محفوظة في التخزين المحلي للمتصفح.
                        يمكنك ترحيلها إلى قاعدة بيانات Supabase للاحتفاظ بها بشكل آمن ومزامنتها.
                    </p>
                    <button
                        onClick={onMigrate}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:shadow-md transition-all duration-150 flex items-center"
                    >
                        <i className="fas fa-database ml-2"></i>
                        بدء ترحيل البيانات إلى Supabase
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        ملاحظة: هذه العملية ستقوم بنسخ البيانات. البيانات المحلية لن يتم حذفها تلقائياً بعد الترحيل.
                    </p>
                </div>
            )}
             {isSupabaseConnected && localSessionsCount === 0 && (
                <p className="text-sm text-green-600"><i className="fas fa-cloud-check ml-1"></i> لا توجد بيانات محلية تحتاج إلى ترحيل.</p>
            )}

            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">معلومات النظام</h3>
                <p className="text-sm text-gray-600">إصدار التطبيق: 1.1.0 (مع دعم Supabase)</p>
            </div>
        </div>
    );
}
window.SettingsPage = SettingsPage; // Ensure it's globally available