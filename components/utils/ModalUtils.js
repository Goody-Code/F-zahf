// Modal Utilities - Extracted from HomePage
function ModalUtils() {
    const showProcessingModal = (title, content, step = 1, totalSteps = 4) => {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            const progress = (step / totalSteps) * 100;
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="text-center">
                        <div class="enhanced-spinner mb-4"></div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${title}</h3>
                        <p class="text-gray-600 mb-4">${content}</p>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <p class="text-sm text-gray-500 mt-2">الخطوة ${step} من ${totalSteps}</p>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            setTimeout(() => {
                document.body.removeChild(modal);
                resolve();
            }, 1500);
        });
    };

    const showLargeFileWarning = () => {
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="text-center">
                        <div class="text-yellow-500 text-6xl mb-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">ملفات كبيرة الحجم</h3>
                        <p class="text-gray-600 mb-4">الملفات كبيرة، سيتم ضغطها تلقائياً</p>
                        <div class="flex gap-4 justify-center">
                            <button onclick="window.continueProcessing()" class="bg-yellow-500 text-white px-6 py-2 rounded-lg">
                                متابعة
                            </button>
                            <button onclick="this.closest('.modal-overlay').remove(); window.cancelProcessing()" class="bg-gray-500 text-white px-6 py-2 rounded-lg">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            window.continueProcessing = () => {
                modal.remove();
                resolve();
            };
            window.cancelProcessing = () => {
                reject(new Error('تم إلغاء العملية'));
            };
        });
    };

    const showSuccessMessage = () => {
        const successModal = document.createElement('div');
        successModal.className = 'modal-overlay';
        successModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-green-500 text-6xl mb-4">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">تم إنشاء الجلسة بنجاح!</h3>
                    <p class="text-gray-600 mb-2">تم ضغط البيانات وحفظها</p>
                    <p class="text-sm text-gray-500 mb-4">سيتم الانتقال إلى الملف الشخصي</p>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: 100%"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(successModal);
        
        setTimeout(() => {
            document.body.removeChild(successModal);
        }, 2000);
    };

    const showErrorMessage = (error) => {
        let errorMessage = error.message || 'حدث خطأ في معالجة الملفات';
        
        // Enhanced error handling
        if (error.message.includes('مساحة التخزين')) {
            errorMessage = `${error.message}\n\nحلول مقترحة:\n• حذف الجلسات القديمة من صفحة الجلسات\n• تصدير البيانات المهمة كـ PDF\n• استخدام ملفات أصغر حجماً\n• مسح ذاكرة التخزين`;
            
            // Add cleanup option
            const errorModal = document.createElement('div');
            errorModal.className = 'modal-overlay';
            errorModal.innerHTML = `
                <div class="modal-content">
                    <div class="text-center">
                        <div class="text-red-500 text-6xl mb-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">مساحة التخزين ممتلئة</h3>
                        <p class="text-gray-600 mb-4 whitespace-pre-line">${errorMessage}</p>
                        <div class="flex gap-3 justify-center">
                            <button onclick="window.clearAllStorage()" class="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                                مسح الكل
                            </button>
                            <button onclick="this.closest('.modal-overlay').remove()" class="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(errorModal);
            
            window.clearAllStorage = () => {
                try {
                    localStorage.clear();
                    location.reload();
                } catch (e) {
                    console.error('Failed to clear storage:', e);
                }
            };
            
            return;
        }
        
        // Show regular error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'modal-overlay';
        errorModal.innerHTML = `
            <div class="modal-content">
                <div class="text-center">
                    <div class="text-red-500 text-6xl mb-4">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">خطأ في المعالجة</h3>
                    <p class="text-gray-600 mb-4 whitespace-pre-line">${errorMessage}</p>
                    <button onclick="this.closest('.modal-overlay').remove()" class="bg-red-500 text-white px-6 py-2 rounded-lg">
                        حسناً
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
    };

    return {
        showProcessingModal,
        showLargeFileWarning,
        showSuccessMessage,
        showErrorMessage
    };
}

window.ModalUtils = ModalUtils;