// Profile Info Section Component
function ProfileInfo({ profile }) {
    return (
        <div className="p-8">
            {/* Basic Info - Individual Cards */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                    <i className="fas fa-user-circle text-blue-600 ml-2"></i>
                    المعلومات الأساسية
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Phone Number Card - Always visible */}
                    <EditableInfoCard 
                        icon="fas fa-phone" 
                        label="رقم الهاتف" 
                        value={profile.phone || ''} 
                        accountId={profile.pageId || profile.facebookId}
                        fieldKey="phone"
                    />
                    
                    {/* Location Card - Always visible */}
                    <EditableInfoCard 
                        icon="fas fa-map-marker-alt" 
                        label="القرية/المديرية" 
                        value={profile.location || ''} 
                        accountId={profile.pageId || profile.facebookId}
                        fieldKey="location"
                    />
                    
                    {profile.facebookUrl || profile.pageUrl ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-link" label="رابط الصفحة" value={profile.facebookUrl || profile.pageUrl} isLink={true} />
                        </div>
                    ) : null}
                    {profile.pageId || profile.facebookId ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-id-badge" label="معرف الصفحة" value={profile.pageId || profile.facebookId} />
                        </div>
                    ) : null}
                    {profile.pageName ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-user" label="اسم المستخدم" value={profile.pageName} />
                        </div>
                    ) : null}
                    {profile.likes ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-heart" label="الإعجابات" value={profile.likes?.toLocaleString('ar-SA')} />
                        </div>
                    ) : null}
                    {profile.followers ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-users" label="المتابعون" value={profile.followers?.toLocaleString('ar-SA')} />
                        </div>
                    ) : null}
                    {profile.followings ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-user-friends" label="يتابع" value={profile.followings?.toLocaleString('ar-SA')} />
                        </div>
                    ) : null}
                    {profile.creation_date ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-calendar" label="تاريخ الإنشاء" value={profile.creation_date} />
                        </div>
                    ) : null}
                    {profile.ad_status ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-bullhorn" label="حالة الإعلانات" value={profile.ad_status} />
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Personal Details - Individual Cards */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                    <i className="fas fa-address-card text-purple-600 ml-2"></i>
                    التفاصيل الشخصية
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profile.WORK ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-briefcase" label="العمل" value={profile.WORK} />
                        </div>
                    ) : null}
                    {profile.EDUCATION ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-graduation-cap" label="التعليم" value={profile.EDUCATION} />
                        </div>
                    ) : null}
                    {profile.RELATIONSHIP ? (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-heart" label="الحالة الاجتماعية" value={profile.RELATIONSHIP} />
                        </div>
                    ) : null}
                    
                    {/* Websites - Individual Cards */}
                    {profile.websites && profile.websites.length > 0 && (
                        profile.websites.map((website, index) => (
                            <div key={index} className="info-card p-4">
                                <InfoItem icon="fas fa-globe" label={`الموقع ${index + 1}`} value={website} isLink={true} />
                            </div>
                        ))
                    )}
                    
                    {/* Single website field (fallback) */}
                    {profile.website && !profile.websites && (
                        <div className="info-card p-4">
                            <InfoItem icon="fas fa-globe" label="الموقع الإلكتروني" value={profile.website} isLink={true} />
                        </div>
                    )}
                </div>
            </div>

            {/* Categories */}
            {profile.categories && profile.categories.length > 0 && (
                <div className="info-card p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <i className="fas fa-tags text-orange-600 ml-2"></i>
                        التصنيفات ({profile.categories.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.categories.map((category, index) => (
                            <span
                                key={index}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* About Me */}
            {profile.about_me && (
                <div className="info-card p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <i className="fas fa-info-circle text-cyan-600 ml-2"></i>
                        نبذة عني
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {profile.about_me.text}
                        </p>
                        {profile.about_me.urls && profile.about_me.urls.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">الروابط المرفقة:</h4>
                                {profile.about_me.urls.map((url, index) => (
                                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" 
                                       className="text-blue-600 hover:underline block">
                                        {url}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Intro */}
            {profile.intro && (
                <div className="info-card p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <i className="fas fa-quote-left text-pink-600 ml-2"></i>
                        المقدمة
                    </h3>
                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                            {profile.intro}
                        </p>
                    </div>
                </div>
            )}

            {/* Additional Info - Display all items */}
            {profile.info && profile.info.length > 0 && (
                <div className="info-card p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <i className="fas fa-plus-circle text-teal-600 ml-2"></i>
                        معلومات إضافية ({profile.info.length})
                    </h3>
                    <div className="space-y-2">
                        {profile.info.map((info, index) => (
                            <div key={index} className="bg-gradient-to-r from-teal-50 to-cyan-50 p-3 rounded-lg border border-teal-200">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                    <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-700 flex-1">{info}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Page Ad Library Info */}
            {profile.pageAdLibrary && (
                <div className="info-card p-6 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                        <i className="fas fa-ad text-red-600 ml-2"></i>
                        معلومات مكتبة الإعلانات
                    </h3>
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
                        <InfoItem icon="fas fa-toggle-on" label="صفحة نشاط تجاري" 
                                 value={profile.pageAdLibrary.is_business_page_active ? 'نعم' : 'لا'} />
                        <InfoItem icon="fas fa-id-card" label="معرف مكتبة الإعلانات" 
                                 value={profile.pageAdLibrary.id} />
                    </div>
                </div>
            )}
        </div>
    );
}

// EditableInfoCard component
function EditableInfoCard({ icon, label, value, accountId, fieldKey }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || '');
    const [currentValue, setCurrentValue] = useState(value || '');

    const saveValue = () => {
        // Save to localStorage
        const key = `profile_${accountId}_${fieldKey}`;
        localStorage.setItem(key, editValue);
        setCurrentValue(editValue);
        setIsEditing(false);
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.innerHTML = `<i class="fas fa-check ml-2"></i>تم حفظ ${label}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    };

    const loadValue = () => {
        const key = `profile_${accountId}_${fieldKey}`;
        const saved = localStorage.getItem(key);
        if (saved) {
            setCurrentValue(saved);
            setEditValue(saved);
        }
    };

    useEffect(() => {
        loadValue();
    }, [accountId, fieldKey]);

    return (
        <div className="info-card p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                    <i className={`${icon} text-blue-600 w-5`}></i>
                    <span className="font-medium text-gray-700">{label}:</span>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'}`}></i>
                </button>
            </div>
            
            {isEditing ? (
                <div className="space-y-2">
                    <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder={`أدخل ${label}...`}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={saveValue}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs"
                        >
                            حفظ
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditValue(currentValue);
                            }}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            ) : (
                <span className="text-gray-600">
                    {currentValue || 'غير محدد - انقر للتعديل'}
                </span>
            )}
        </div>
    );
}

// Export for use in other files
window.ProfileInfo = ProfileInfo;
window.EditableInfoCard = EditableInfoCard;