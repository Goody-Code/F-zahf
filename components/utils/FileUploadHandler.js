// File Upload Handler Utility - Extracted from HomePage
function FileUploadHandler() {
    const handleFileUpload = (file, type, setFile, setErrors) => {
        if (!file) {
            setErrors(prev => ({ ...prev, [type]: 'يرجى اختيار ملف' }));
            return;
        }
        
        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            setErrors(prev => ({ ...prev, [type]: 'يرجى اختيار ملف JSON صحيح' }));
            return;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [type]: 'حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)' }));
            return;
        }

        setFile(file);
        setErrors(prev => ({ ...prev, [type]: null }));
    };

    return {
        handleFileUpload
    };
}

window.FileUploadHandler = FileUploadHandler;