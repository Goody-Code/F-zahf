// Profile Header Component - Enhanced Error Handling
function ProfileHeader({ profile, sessionData, threatBadge }) {
    // Safe data access with fallbacks
    const safeProfile = profile || {};
    const safeSessionData = sessionData || {};
    const safeName = safeSessionData.name || safeProfile.title || safeProfile.name || 'ملف شخصي';
    
    return (
        <div className="profile-header relative h-80">
            {safeProfile.coverPhotoUrl && (
                <img
                    src={safeProfile.coverPhotoUrl}
                    alt="صورة الغلاف"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    }}
                />
            )}

            {/* Security Warning Badge */}
            {threatBadge && (
                <div className="absolute top-4 left-4 transform -translate-y-2 translate-x-4">
                    <div className={`security-warning-badge bg-${threatBadge.color}-600 text-white px-6 py-3 rounded-r-lg shadow-2xl transform -skew-x-12 relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-20"></div>
                        <div className="relative z-10">
                            <div className="text-lg font-bold mb-1">بلاغ أمني</div>
                            <div className="text-sm font-semibold">{threatBadge.level}</div>
                            <div className="text-xs opacity-90">{threatBadge.description}</div>
                        </div>
                        <div className="absolute -right-2 top-0 bottom-0 w-4 bg-red-700 transform skew-x-12"></div>
                    </div>
                </div>
            )}

            <div className="absolute bottom-0 right-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-8">
                <div className="flex items-end space-x-6 space-x-reverse">
                    <img
                        src={safeProfile.profilePictureUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOWVhM2E4Ij4KPHN0cmluZyBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+CjwvY3ZnPgo8L3N2Zz4='}
                        alt="الصورة الشخصية"
                        className="w-32 h-32 rounded-full border-4 border-white shadow-xl transform hover:scale-105 transition-transform"
                        onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjOWVhM2E4Ij4KPHN0cmluZyBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+CjwvY3ZnPgo8L3N2Zz4=';
                        }}
                    />
                    <div className="text-white">
                        <h1 className="text-3xl font-bold mb-2">{safeName}</h1>
                        <p className="text-xl opacity-90">{safeProfile.title || 'ملف شخصي'}</p>
                        {safeProfile.intro && (
                            <p className="text-lg opacity-80 mt-2 max-w-2xl">{safeProfile.intro}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export for use in other files
window.ProfileHeader = ProfileHeader;