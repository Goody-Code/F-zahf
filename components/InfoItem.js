// Info Item Component
function InfoItem({ icon, label, value, isLink = false }) {
    if (!value) return null;

    // Enhanced translation with comprehensive mappings including all profession categories
    const translateValue = (val) => {
        if (typeof val !== 'string') return val;
        
        const translations = {
            // Relationship status
            'Married': 'متزوج',
            'Single': 'أعزب',
            'In a relationship': 'في علاقة',
            'It\'s complicated': 'الأمر معقد',
            'Divorced': 'مطلق',
            'Widowed': 'أرمل',
            
            // Professional Categories - Comprehensive List
            'Profile': 'ملف شخصي',
            'Public figure': 'شخصية عامة',
            'Business': 'نشاط تجاري',
            'Community': 'مجتمع',
            'Brand': 'علامة تجارية',
            'Artist': 'فنان',
            'Musician': 'موسيقي',
            'Writer': 'كاتب',
            'Politician': 'سياسي',
            'Athlete': 'رياضي',
            'Actor': 'ممثل',
            'Organization': 'منظمة',
            'Non-profit organization': 'منظمة غير ربحية',
            'Government official': 'مسؤول حكومي',
            'Media/News/Publishing': 'إعلام/أخبار/نشر',
            'Education': 'تعليم',
            'Entertainment': 'ترفيه',
            
            // Professional Categories - Extended
            'Actor/Director': 'ممثل/مخرج',
            'Author': 'مؤلف',
            'Business Person': 'رجل أعمال',
            'Chef': 'طاهٍ',
            'Coach': 'مدرب',
            'Doctor': 'طبيب',
            'Entertainer': 'فنان ترفيهي',
            'Journalist': 'صحفي',
            'Lawyer': 'محامٍ',
            'Musician/Band': 'موسيقي/فرقة',
            'Teacher': 'معلم',
            'Animator': 'رسام رسوم متحركة',
            'Designer': 'مصمم',
            'Blogger': 'مدون',
            'Public Speaker': 'متحدث عام',
            'Scientist': 'عالم',
            'Comedian': 'كوميدي',
            'Photographer': 'مصور',
            'Dancer': 'راقص',
            'Influencer': 'مؤثر',
            'Model': 'عارض أزياء',
            
            // Business Categories
            'Local Business': 'نشاط تجاري محلي',
            'Company': 'شركة',
            'Product/Service': 'منتج/خدمة',
            'Restaurant': 'مطعم',
            'School': 'مدرسة',
            'Hospital': 'مستشفى',
            'Government Organization': 'جهة حكومية',
            'Media/News Company': 'شركة إعلامية/إخبارية',
            'Sports Team': 'فريق رياضي',
            'Religious Organization': 'منظمة دينية',
            'Health/Beauty': 'صحة/تجميل',
            'Shopping & Retail': 'تسوق وتجزئة',
            'Travel & Transportation': 'سفر ونقل',
            
            // Ad status
            'This Profile is not currently running ads.': 'هذا الملف الشخصي لا يدير إعلانات حالياً',
            'This page is running ads.': 'هذه الصفحة تدير إعلانات',
            'No ads running': 'لا توجد إعلانات تعمل',
            
            // Months
            'March': 'مارس',
            'April': 'أبريل',
            'May': 'مايو',
            'June': 'يونيو',
            'July': 'يوليو',
            'August': 'أغسطس',
            'September': 'سبتمبر',
            'October': 'أكتوبر',
            'November': 'نوفمبر',
            'December': 'ديسمبر',
            'January': 'يناير',
            'February': 'فبراير',
            
            // Other common terms
            'Active': 'نشط',
            'Inactive': 'غير نشط',
            'Verified': 'موثق',
            'Not verified': 'غير موثق',
            'Public': 'عام',
            'Private': 'خاص',
            'Yes': 'نعم',
            'No': 'لا',
            'True': 'نعم',
            'False': 'لا',
            'Enabled': 'مفعل',
            'Disabled': 'معطل'
        };
        
        return translations[val] || val;
    };

    const translatedValue = translateValue(value);
    const displayValue = isLink && typeof translatedValue === 'string' && translatedValue.startsWith('http') ? (
        <a href={translatedValue} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {translatedValue}
        </a>
    ) : translatedValue;

    return (
        <div className="flex items-center space-x-3 space-x-reverse">
            <i className={`${icon} text-blue-600 w-5`}></i>
            <span className="font-medium text-gray-700">{label}:</span>
            <span className="text-gray-600">{displayValue}</span>
        </div>
    );
}

// Export for use in other files
window.InfoItem = InfoItem;