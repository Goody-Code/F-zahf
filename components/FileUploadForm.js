// File Upload Form Component - Extracted from HomePage
function FileUploadForm({ name, setName, profileFile, setProfileFile, postsFile, setPostsFile, errors, setErrors, loading, onSubmit }) {
    const fileUploadHandler = FileUploadHandler();

    return (
        <div className="info-card p-8 fade-in">
            {/* Name Input */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    <i className="fas fa-user ml-2"></i>
                    اسم الشخص أو الصفحة
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل الاسم..."
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Profile File Upload */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                    <i className="fas fa-id-card ml-2"></i>
                    ملف البيانات الشخصية (JSON)
                </label>
                <FileUploadZone
                    onFileSelect={(file) => fileUploadHandler.handleFileUpload(file, 'profile', setProfileFile, setErrors)}
                    selectedFile={profileFile}
                    error={errors.profile}
                    placeholder="اختر ملف البيانات الشخصية"
                />
            </div>

            {/* Posts File Upload */}
            <div className="mb-8">
                <label className="block text-gray-700 font-semibold mb-2">
                    <i className="fas fa-edit ml-2"></i>
                    ملف المنشورات (JSON)
                </label>
                <FileUploadZone
                    onFileSelect={(file) => fileUploadHandler.handleFileUpload(file, 'posts', setPostsFile, setErrors)}
                    selectedFile={postsFile}
                    error={errors.posts}
                    placeholder="اختر ملف المنشورات"
                />
            </div>

            {errors.general && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errors.general}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={onSubmit}
                disabled={loading}
                className="w-full btn-primary text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <div className="enhanced-spinner ml-2" style={{width: '20px', height: '20px'}}></div>
                        جاري المعالجة...
                    </>
                ) : (
                    <>
                        <i className="fas fa-upload ml-2"></i>
                        إنشاء الجلسة
                    </>
                )}
            </button>
        </div>
    );
}

window.FileUploadForm = FileUploadForm;