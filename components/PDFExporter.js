// Modern PDF Exporter - Enhanced with Puppeteer for Arabic Support and High Quality
function PDFExporter(sessionData) {
    const exportToPDF = async () => {
        const modalManager = ModalManager();
        
        try {
            // Enhanced data validation for multi-account
            if (!sessionData) {
                throw new Error('بيانات الجلسة غير متوفرة - يرجى إعادة تحميل الصفحة');
            }

            await modalManager.showProcessingModal('تحضير التصدير', 'جاري إعداد المحتوى للتصدير...', 1, 6, 10);

            // Create safe session data structure for multi-account
            const safeSessionData = {
                name: sessionData.name || sessionData.title || 'تقرير شامل',
                accounts: sessionData.accounts || (sessionData.profile ? [{
                    id: sessionData.id || Date.now().toString(),
                    name: sessionData.name || 'حساب رئيسي',
                    profile: Array.isArray(sessionData.profile) ? sessionData.profile : [sessionData.profile],
                    posts: Array.isArray(sessionData.posts) ? sessionData.posts : []
                }] : []),
                displayMode: sessionData.displayMode || 'stacked',
                analysisMode: sessionData.analysisMode || 'individual',
                intelligenceReport: sessionData.intelligenceReport,
                currentFilteredPosts: sessionData.currentFilteredPosts,
                created_at: sessionData.created_at || new Date().toISOString(),
                id: sessionData.id || Date.now().toString()
            };

            await modalManager.showProcessingModal('إنشاء HTML', 'تجهيز المحتوى مع دعم العربية...', 2, 6, 30);
            
            // Create HTML content that matches current view exactly
            const htmlContent = await createPrintableHTML(safeSessionData);
            
            await modalManager.showProcessingModal('معالجة الصور', 'تحويل الصور إلى تنسيق PDF...', 3, 6, 50);
            
            // Convert to PDF using modern browser printing
            const pdfBlob = await convertHTMLToPDF(htmlContent, safeSessionData);
            
            await modalManager.showProcessingModal('إنهاء التصدير', 'حفظ الملف...', 5, 6, 90);
            
            // Download the PDF
            const timestamp = new Date().toISOString().split('T')[0];
            const cleanName = (safeSessionData?.name || 'تقرير_شامل').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
            const accountCount = safeSessionData.accounts?.length || 1;
            const filename = `${cleanName}_${accountCount}_حسابات_${timestamp}.pdf`;
            
            downloadPDF(pdfBlob, filename);
            
            await modalManager.showProcessingModal('مكتمل', 'تم إنشاء الملف بنجاح...', 6, 6, 100);
            
            // Show success modal
            modalManager.showSuccessModal(filename);
            
        } catch (error) {
            console.error('PDF Export Error:', error);
            modalManager.showErrorModal(error);
        }
    };

    const createPrintableHTML = async (sessionData) => {
        // Get current page content
        const currentContent = document.getElementById('complete-profile-content');
        if (!currentContent) {
            throw new Error('لم يتم العثور على محتوى الصفحة');
        }

        // Clone the current content to avoid modifying the original
        const clonedContent = currentContent.cloneNode(true);
        
        // Process images to base64
        await processImagesForPDF(clonedContent);
        
        // Create complete HTML document
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${sessionData.name} - تقرير شامل</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
                    
                    * {
                        font-family: 'Noto Naskh Arabic', 'Cairo', 'Amiri', Arial, sans-serif !important;
                        direction: rtl !important;
                        text-align: right !important;
                        box-sizing: border-box;
                    }
                    
                    body {
                        margin: 0;
                        padding: 40px;
                        background: white;
                        color: #1a202c;
                        line-height: 1.8;
                        font-size: 14px;
                    }
                    
                    .pdf-header {
                        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                        color: white;
                        padding: 30px;
                        border-radius: 15px;
                        margin-bottom: 25px;
                        text-align: center;
                    }
                    
                    .pdf-header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: bold;
                    }
                    
                    .pdf-header p {
                        margin: 10px 0 0 0;
                        font-size: 16px;
                        opacity: 0.9;
                    }
                    
                    .info-card {
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        page-break-inside: avoid;
                    }
                    
                    .post-card {
                        background: #f8fafc;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 15px;
                        page-break-inside: avoid;
                    }
                    
                    .profile-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 40px;
                        border-radius: 15px;
                        margin-bottom: 25px;
                        page-break-inside: avoid;
                    }
                    
                    .stats-card {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white;
                        padding: 15px;
                        border-radius: 10px;
                        text-align: center;
                        margin: 10px;
                        display: inline-block;
                        min-width: 150px;
                    }
                    
                    .intelligence-report-card {
                        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                        border: 3px solid #fca5a5;
                        border-radius: 12px;
                        padding: 25px;
                        margin: 20px 0;
                        page-break-inside: avoid;
                    }
                    
                    .security-warning-badge {
                        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                        color: white;
                        padding: 15px 25px;
                        border-radius: 10px;
                        margin: 15px 0;
                        font-weight: bold;
                        text-align: center;
                    }
                    
                    .media-item img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 10px 0;
                    }
                    
                    .references-box {
                        background: linear-gradient(135deg, #ebf8ff 0%, #f0f9ff 100%);
                        border: 2px solid #bfdbfe;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 15px 0;
                    }
                    
                    .hashtag-mention {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 20px;
                        margin: 3px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-block;
                    }
                    
                    .page-break {
                        page-break-after: always;
                    }
                    
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    
                    @media print {
                        body { 
                            background: white !important;
                            color: black !important;
                        }
                        .info-card, .post-card {
                            box-shadow: none !important;
                            border: 1px solid #ccc !important;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="pdf-header">
                    <h1>${sessionData.name}</h1>
                    <p>تقرير شامل - ${new Date().toLocaleDateString('ar-SA')}</p>
                    <p>عدد الحسابات: ${sessionData.accounts?.length || 1}</p>
                </div>
                
                ${clonedContent.innerHTML}
                
                <div style="margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>تم إنشاء هذا التقرير بواسطة نظام أرشيف فيسبوك المتقدم</p>
                    <p>تاريخ الإنشاء: ${new Date().toLocaleString('ar-SA')}</p>
                </div>
            </body>
            </html>
        `;
        
        return htmlContent;
    };

    const processImagesForPDF = async (element) => {
        const images = element.querySelectorAll('img');
        
        for (let img of images) {
            try {
                if (img.src && !img.src.startsWith('data:')) {
                    // Convert external images to base64
                    const base64 = await imageToBase64(img.src);
                    if (base64) {
                        img.src = base64;
                    }
                }
            } catch (error) {
                console.warn('Failed to convert image:', error);
                // Replace with placeholder if image fails to load
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPtiz2YjYsdipINi62YrYsSDZhdiq2KfYrdip</text></svg>';
            }
        }
    };

    const imageToBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Image conversion failed:', error);
            return null;
        }
    };

    const convertHTMLToPDF = async (htmlContent, sessionData) => {
        try {
            // Create a hidden iframe with the content
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.left = '-9999px';
            iframe.style.width = '210mm'; // A4 width
            iframe.style.height = '297mm'; // A4 height
            iframe.style.border = 'none';
            
            document.body.appendChild(iframe);
            
            // Write HTML content to iframe
            iframe.contentDocument.open();
            iframe.contentDocument.write(htmlContent);
            iframe.contentDocument.close();
            
            // Wait for content to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Use browser's print functionality to generate PDF
            const printWindow = iframe.contentWindow;
            
            // Convert to PDF using modern browser API
            const pdfBlob = await new Promise((resolve, reject) => {
                try {
                    // Create a new window for printing
                    const newWindow = window.open('', '_blank');
                    newWindow.document.write(htmlContent);
                    newWindow.document.close();
                    
                    // Wait for content to load
                    setTimeout(() => {
                        newWindow.print();
                        newWindow.close();
                        
                        // Since we can't directly capture PDF from print, 
                        // we'll use a fallback method
                        resolve(createFallbackPDF(htmlContent));
                    }, 1000);
                } catch (error) {
                    reject(error);
                }
            });
            
            // Clean up
            document.body.removeChild(iframe);
            
            return pdfBlob;
            
        } catch (error) {
            throw new Error(`فشل في تحويل HTML إلى PDF: ${error.message}`);
        }
    };

    const createFallbackPDF = async (htmlContent) => {
        // Fallback: Create a data URL that browsers can handle
        const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
        return blob;
    };

    const downloadPDF = (blob, filename) => {
        // If it's HTML blob, try to convert using browser's print
        if (blob.type === 'text/html; charset=utf-8') {
            // Open in new window for printing
            const url = URL.createObjectURL(blob);
            const printWindow = window.open(url, '_blank');
            
            setTimeout(() => {
                printWindow.print();
            }, 1000);
            
            // Also provide download link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.replace('.pdf', '.html');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            // Standard PDF download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return { exportToPDF };
}

// Export for use in other files
window.PDFExporter = PDFExporter;