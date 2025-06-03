// PDF Configuration Module
function PDFConfig() {
    
    const initializeArabicPDF = () => {
        // Check if pdfMake is available, if not use fallback
        if (!window.pdfMake) {
            throw new Error('مكتبة PDF غير محملة - يرجى إعادة تحميل الصفحة');
        }

        // Use default fonts with Arabic support fallback
        const arabicFonts = {
            Roboto: {
                normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
                bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
                italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
                bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
            }
        };

        // Set fonts if available
        if (window.pdfMake.fonts) {
            window.pdfMake.fonts = arabicFonts;
        }
        
        return {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [40, 60, 40, 60],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 12,
                lineHeight: 1.6,
                direction: 'rtl',
                alignment: 'right'
            },
            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    color: '#1e40af',
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },
                sectionTitle: {
                    fontSize: 16,
                    bold: true,
                    color: '#374151',
                    margin: [0, 20, 0, 10]
                },
                profileName: {
                    fontSize: 24,
                    bold: true,
                    color: '#ffffff',
                    alignment: 'center'
                },
                postContent: {
                    fontSize: 11,
                    lineHeight: 1.5,
                    margin: [0, 5, 0, 10]
                },
                statCard: {
                    fontSize: 10,
                    color: '#ffffff',
                    alignment: 'center'
                },
                timestamp: {
                    fontSize: 9,
                    color: '#6b7280',
                    italics: true
                }
            }
        };
    };

    return {
        initializeArabicPDF
    };
}

window.PDFConfig = PDFConfig;