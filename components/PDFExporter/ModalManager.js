// Modal Management Module for PDF Export
function ModalManager() {
    const showProcessingModal = (title, content, step = 1, totalSteps = 6, progress = 0) => {
        return new Promise((resolve) => {
            // Remove existing modal if any
            const existingModal = document.querySelector('.pdf-processing-modal');
            if (existingModal) existingModal.remove();

            const modal = document.createElement('div');
            modal.className = 'modal-overlay pdf-processing-modal';
            const calculatedProgress = progress || (step / totalSteps) * 100;
            
            modal.innerHTML = `
                <div class="modal-content modern-modal">
                    <div class="text-center">
                        <div class="pdf-processing-icon mb-4">
                            <i class="fas fa-file-pdf text-red-500 text-6xl"></i>
                            <div class="processing-animation"></div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">${title}</h3>
                        <p class="text-gray-600 mb-4">${content}</p>
                        <div class="progress-container advanced-progress">
                            <div class="progress-bar advanced-bar" style="width: ${calculatedProgress}%"></div>
                            <div class="progress-glow" style="left: ${calculatedProgress}%"></div>
                        </div>
                        <p class="text-sm text-gray-500 mt-2">
                            ${calculatedProgress.toFixed(0)}% مكتمل - الخطوة ${step} من ${totalSteps}
                        </p>
                        <div class="processing-details mt-3 text-xs text-gray-400">
                            يتم إنشاء ملف HTML متوافق مع معايير PDF العالية...
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
                resolve();
            }, 2000);
        });
    };

    const showSuccessModal = (filename) => {
        setTimeout(() => {
            const successModal = document.createElement('div');
            successModal.className = 'modal-overlay';
            successModal.innerHTML = `
                <div class="modal-content modern-success">
                    <div class="text-center">
                        <div class="success-animation mb-4">
                            <i class="fas fa-check-circle text-green-500 text-7xl"></i>
                            <div class="success-glow"></div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">تم التصدير بنجاح!</h3>
                        <p class="text-gray-600 mb-2">تم إنشاء ملف HTML عالي الجودة مع دعم كامل للعربية</p>
                        <div class="success-details bg-green-50 p-4 rounded-lg mb-4">
                            <p class="text-sm text-green-700">
                                <i class="fas fa-file-code ml-1"></i>
                                اسم الملف: ${filename.replace('.pdf', '.html')}
                            </p>
                            <p class="text-sm text-green-700">
                                <i class="fas fa-print ml-1"></i>
                                للحصول على PDF: افتح الملف واستخدم "طباعة → حفظ كـ PDF"
                            </p>
                            <p class="text-sm text-green-700">
                                <i class="fas fa-language ml-1"></i>
                                دعم كامل للعربية والصور المدمجة
                            </p>
                            <p class="text-sm text-green-700">
                                <i class="fas fa-eye ml-1"></i>
                                يحافظ على التنسيق والفلاتر الحالية
                            </p>
                        </div>
                        <button onclick="this.closest('.modal-overlay').remove()" 
                                class="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                            <i class="fas fa-thumbs-up ml-2"></i>
                            ممتاز
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(successModal);
            
            // Auto remove after 10 seconds
            setTimeout(() => {
                if (document.body.contains(successModal)) {
                    successModal.remove();
                }
            }, 10000);
        }, 500);
    };

    const showErrorModal = (error) => {
        // Enhanced error handling with specific PDF solutions
        const errorMapping = {
            'HTML': {
                title: 'فشل في معالجة المحتوى',
                message: 'حدث خطأ أثناء تحويل المحتوى للتصدير',
                solutions: [
                    'أعد تحميل الصفحة وحاول مرة أخرى',
                    'تأكد من وجود محتوى في الصفحة',
                    'استخدم متصفح Chrome أو Firefox الحديث',
                    'أغلق النوافذ الأخرى لتوفير الذاكرة'
                ]
            },
            'fetch': {
                title: 'مشكلة في تحميل الصور',
                message: 'فشل في تحميل بعض الصور للتصدير',
                solutions: [
                    'تحقق من اتصال الإنترنت',
                    'الصور ستظهر كعناصر نائبة في التقرير',
                    'جرب التصدير مرة أخرى',
                    'استخدم الصور المحفوظة محلياً'
                ]
            },
            'memory': {
                title: 'نفدت ذاكرة المتصفح',
                message: 'البيانات كبيرة جداً للمعالجة',
                solutions: [
                    'أغلق التطبيقات الأخرى',
                    'أعد تشغيل المتصفح',
                    'جرب تصدير أجزاء منفصلة',
                    'استخدم جهاز بذاكرة أكبر'
                ]
            }
        };
        
        let errorType = 'general';
        let errorInfo = {
            title: 'خطأ في التصدير',
            message: error.message || 'حدث خطأ غير متوقع أثناء التصدير',
            solutions: [
                'أعد المحاولة مرة أخرى',
                'تحقق من البيانات المدخلة',
                'أعد تحميل الصفحة إذا استمر الخطأ',
                'جرب استخدام متصفح مختلف'
            ]
        };
        
        // Detect error type with enhanced detection
        const errorMessage = error.message?.toLowerCase() || '';
        if (errorMessage.includes('html') || errorMessage.includes('content')) {
            errorType = 'HTML';
        } else if (errorMessage.includes('fetch') || errorMessage.includes('image') || errorMessage.includes('صور')) {
            errorType = 'fetch';  
        } else if (errorMessage.includes('memory') || errorMessage.includes('quota') || errorMessage.includes('ذاكرة')) {
            errorType = 'memory';
        }
        
        if (errorMapping[errorType]) {
            errorInfo = errorMapping[errorType];
        }

        // Show comprehensive error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'modal-overlay';
        errorModal.innerHTML = `
            <div class="modal-content modern-error">
                <div class="text-center">
                    <div class="error-animation mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-7xl"></i>
                        <div class="error-pulse"></div>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">${errorInfo.title}</h3>
                    <p class="text-gray-600 mb-4">${errorInfo.message}</p>
                    
                    <div class="solutions-box bg-blue-50 p-4 rounded-lg mb-6 text-right">
                        <h4 class="font-semibold text-blue-800 mb-3">
                            <i class="fas fa-lightbulb ml-2"></i>
                            حلول مقترحة:
                        </h4>
                        <ul class="text-sm text-blue-700 space-y-2">
                            ${errorInfo.solutions.map(solution => `
                                <li class="flex items-start">
                                    <i class="fas fa-check-circle text-blue-500 ml-2 mt-0.5 flex-shrink-0"></i>
                                    <span>${solution}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="flex gap-3 justify-center">
                        <button onclick="location.reload()" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all">
                            <i class="fas fa-redo ml-2"></i>
                            إعادة تحميل
                        </button>
                        <button onclick="this.closest('.modal-overlay').remove()" 
                                class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all">
                            <i class="fas fa-times ml-2"></i>
                            إغلاق
                        </button>
                    </div>
                    
                    <div class="error-details mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600 text-left" dir="ltr">
                        Error Details: ${error.message}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(errorModal);
    };

    return {
        showProcessingModal,
        showSuccessModal,
        showErrorModal
    };
}

window.ModalManager = ModalManager;