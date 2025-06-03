// Modern PDF Processing System - Enhanced with HTML-to-PDF conversion
function PDFProcessor() {
    
    const generatePDF = async (sessionData) => {
        // Use new HTML-based approach instead of pdfMake
        return generateHTMLToPDF(sessionData);
    };

    const generateMultiAccountPDF = async (sessionData) => {
        try {
            // Get current page state including filters and view mode
            const currentPageContent = document.getElementById('complete-profile-content');
            if (!currentPageContent) {
                throw new Error('لم يتم العثور على محتوى الصفحة');
            }

            // Create printable HTML that matches current view exactly
            const printableHTML = await createPrintableHTML(sessionData, currentPageContent);
            
            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const cleanName = (sessionData?.name || 'تقرير_متعدد_الحسابات').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
            const accountCount = sessionData.accounts?.length || 1;
            const filename = `${cleanName}_${accountCount}_حسابات_${timestamp}.html`;
            
            // Download as HTML file that can be printed to PDF
            downloadHTMLForPrint(printableHTML, filename);
            
            return filename.replace('.html', '.pdf');
            
        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error(`خطأ في إنشاء التقرير: ${error.message}`);
        }
    };

    const createPrintableHTML = async (sessionData, currentContent) => {
        // Clone current content to preserve state
        const clonedContent = currentContent.cloneNode(true);
        
        // Process all images to base64 for offline viewing
        await processImagesInContent(clonedContent);
        
        // Create complete HTML document with Arabic support
        const htmlDocument = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${sessionData.name} - التقرير الشامل</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap');
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
                    
                    * {
                        font-family: 'Noto Naskh Arabic', 'Cairo', Arial, sans-serif !important;
                        direction: rtl !important;
                        text-align: right !important;
                        unicode-bidi: embed !important;
                        box-sizing: border-box;
                    }
                    
                    body {
                        margin: 0;
                        padding: 30px;
                        background: white;
                        color: #1a202c;
                        line-height: 1.8;
                        font-size: 14px;
                    }
                    
                    /* Header styles */
                    .pdf-document-header {
                        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                        color: white;
                        padding: 40px;
                        border-radius: 15px;
                        margin-bottom: 30px;
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    
                    .pdf-document-header h1 {
                        margin: 0 0 15px 0;
                        font-size: 32px;
                        font-weight: 700;
                    }
                    
                    .pdf-document-header .subtitle {
                        font-size: 18px;
                        opacity: 0.9;
                        margin: 10px 0;
                    }
                    
                    /* Card styles */
                    .info-card, .post-card {
                        background: white;
                        border: 2px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 25px;
                        margin-bottom: 25px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        page-break-inside: avoid;
                    }
                    
                    .profile-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 40px;
                        border-radius: 15px;
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    
                    .profile-header h1 {
                        font-size: 28px;
                        margin: 0 0 10px 0;
                    }
                    
                    .profile-header img {
                        border-radius: 50%;
                        border: 4px solid white;
                        max-width: 120px;
                        height: auto;
                    }
                    
                    /* Intelligence report styles */
                    .intelligence-report-card {
                        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                        border: 3px solid #dc2626;
                        border-radius: 12px;
                        padding: 30px;
                        margin: 25px 0;
                        page-break-inside: avoid;
                    }
                    
                    .security-warning-badge {
                        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                        font-weight: bold;
                        text-align: center;
                        font-size: 16px;
                    }
                    
                    /* Stats cards */
                    .stats-card {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 12px;
                        text-align: center;
                        margin: 10px;
                        display: inline-block;
                        min-width: 150px;
                    }
                    
                    /* Media items */
                    .media-item img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 15px 0;
                        border: 1px solid #e5e7eb;
                    }
                    
                    /* References and hashtags */
                    .references-box {
                        background: linear-gradient(135deg, #ebf8ff 0%, #f0f9ff 100%);
                        border: 2px solid #bfdbfe;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    
                    .hashtag-mention {
                        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                        color: white;
                        padding: 8px 15px;
                        border-radius: 20px;
                        margin: 5px;
                        font-size: 12px;
                        font-weight: 600;
                        display: inline-block;
                    }
                    
                    /* Print specific styles */
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    
                    @media print {
                        body {
                            background: white !important;
                            color: black !important;
                            font-size: 12px !important;
                        }
                        
                        .info-card, .post-card {
                            box-shadow: none !important;
                            border: 1px solid #666 !important;
                            margin-bottom: 15px !important;
                        }
                        
                        .profile-header, .pdf-document-header {
                            background: #4f46e5 !important;
                            color: white !important;
                        }
                        
                        .intelligence-report-card {
                            background: #fef2f2 !important;
                            border: 2px solid #dc2626 !important;
                        }
                        
                        .security-warning-badge {
                            background: #dc2626 !important;
                            color: white !important;
                        }
                        
                        .stats-card {
                            background: #3b82f6 !important;
                            color: white !important;
                        }
                        
                        .hashtag-mention {
                            background: #3b82f6 !important;
                            color: white !important;
                        }
                        
                        img {
                            max-width: 100% !important;
                            height: auto !important;
                        }
                    }
                    
                    /* Page breaks */
                    .page-break {
                        page-break-after: always;
                    }
                    
                    .no-break {
                        page-break-inside: avoid;
                    }
                </style>
                
                <script>
                    // Auto-print function for PDF generation
                    window.onload = function() {
                        // Add print button for user convenience
                        const printButton = document.createElement('button');
                        printButton.textContent = '🖨️ طباعة أو حفظ كـ PDF';
                        printButton.style.cssText = `
                            position: fixed;
                            top: 20px;
                            left: 20px;
                            z-index: 1000;
                            background: #10b981;
                            color: white;
                            border: none;
                            padding: 15px 25px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                        `;
                        printButton.onclick = () => window.print();
                        document.body.appendChild(printButton);
                        
                        // Hide print button when printing
                        window.addEventListener('beforeprint', () => {
                            printButton.style.display = 'none';
                        });
                        
                        window.addEventListener('afterprint', () => {
                            printButton.style.display = 'block';
                        });
                    };
                </script>
            </head>
            <body>
                <div class="pdf-document-header">
                    <h1>${sessionData.name}</h1>
                    <div class="subtitle">التقرير الاستخباراتي الشامل</div>
                    <div class="subtitle">تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</div>
                    <div class="subtitle">عدد الحسابات: ${sessionData.accounts?.length || 1}</div>
                    <div class="subtitle">طريقة العرض: ${sessionData.displayMode === 'stacked' ? 'عرض متتالي' : 'عرض منفصل'}</div>
                </div>
                
                ${clonedContent.innerHTML}
                
                <div style="margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; border-top: 2px solid #e5e7eb; padding-top: 20px;">
                    <p><strong>نظام أرشيف فيسبوك المتقدم - النسخة الاستخباراتية</strong></p>
                    <p>تم إنشاء هذا التقرير في: ${new Date().toLocaleString('ar-SA')}</p>
                    <p>للحصول على نسخة PDF عالية الجودة، استخدم خيار "طباعة" في متصفحك واختر "حفظ كـ PDF"</p>
                </div>
            </body>
            </html>
        `;
        
        return htmlDocument;
    };

    const processImagesInContent = async (element) => {
        const images = element.querySelectorAll('img');
        
        for (let img of images) {
            try {
                if (img.src && !img.src.startsWith('data:') && !img.src.startsWith('blob:')) {
                    // Try to convert external images to base64
                    const base64 = await convertImageToBase64(img.src);
                    if (base64) {
                        img.src = base64;
                    }
                }
                
                // Ensure images have proper styling for PDF
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.margin = '10px auto';
                
            } catch (error) {
                console.warn('Failed to process image:', img.src, error);
                // Replace with placeholder text if image fails
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    background: #f3f4f6;
                    border: 2px dashed #9ca3af;
                    padding: 20px;
                    text-align: center;
                    color: #6b7280;
                    border-radius: 8px;
                    margin: 10px 0;
                `;
                placeholder.textContent = 'صورة غير متاحة للتصدير';
                img.parentNode.replaceChild(placeholder, img);
            }
        }
    };

    const convertImageToBase64 = async (imageUrl) => {
        try {
            // Skip if already base64 or blob
            if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
                return imageUrl;
            }
            
            const response = await fetch(imageUrl, { mode: 'cors' });
            if (!response.ok) throw new Error('Failed to fetch image');
            
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Image conversion failed:', error);
            return null;
        }
    };

    const downloadHTMLForPrint = (htmlContent, filename) => {
        const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Download HTML file
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Also open in new window for immediate printing
        const printWindow = window.open(url, '_blank');
        
        // Clean up URL after a delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 10000);
    };

    return {
        generatePDF,
        generateMultiAccountPDF
    };
}

window.PDFProcessor = PDFProcessor;