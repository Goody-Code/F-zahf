// Media Item Component for Posts
function MediaItem({ media }) {
    const translateDescription = (text) => {
        if (!text) return '';
        
        const translations = {
            'Image description': 'وصف الصورة',
            'Video description': 'وصف الفيديو',
            'Photo': 'صورة',
            'Video': 'فيديو',
            'File': 'ملف',
            'Attachment': 'مرفق',
            'Media': 'وسائط',
            'Click to view': 'انقر للعرض',
            'Play video': 'تشغيل الفيديو',
            'Download': 'تحميل'
        };
        
        let translatedText = text;
        Object.keys(translations).forEach(key => {
            translatedText = translatedText.replace(new RegExp(key, 'gi'), translations[key]);
        });
        
        return translatedText;
    };

    const getIntelligenceDescription = (description) => {
        if (!description) return '';
        
        // Add Yemeni intelligence analysis tone
        const analysisPrefix = "التحليل الاستخباراتي للقيادة اليمنية في صنعاء: ";
        const translatedDesc = translateDescription(description);
        
        return `${analysisPrefix}${translatedDesc}`;
    };

    const openImageModal = (imageSrc, description) => {
        const modal = document.createElement('div');
        modal.className = 'image-modal-overlay';
        modal.innerHTML = `
            <div class="image-modal-content">
                <button class="modal-close-btn" onclick="this.closest('.image-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="image-container">
                    <img src="${imageSrc}" alt="صورة" class="modal-image" />
                </div>
                ${description ? `
                    <div class="image-description-box">
                        <h4 class="description-title">
                            <i class="fas fa-search ml-2"></i>
                            التحليل الاستخباراتي
                        </h4>
                        <p class="description-text">${getIntelligenceDescription(description)}</p>
                    </div>
                ` : ''}
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    if (media.__typename === 'Photo' || media.__isMedia === 'Photo' || media.photo_image) {
        const imageSrc = media.photo_image?.uri || media.thumbnail || media.url;
        const description = media.ocrText || media.alt_text;
        
        return (
            <div className="media-item relative cursor-pointer" onClick={() => openImageModal(imageSrc, description)}>
                <img
                    src={imageSrc}
                    alt="صورة"
                    className="w-full h-auto max-h-96 object-contain rounded-lg hover:opacity-90 transition-opacity"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />
                <div className="hidden bg-gray-200 h-48 flex items-center justify-center rounded-lg">
                    <i className="fas fa-image text-gray-400 text-2xl"></i>
                </div>
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    <i className="fas fa-expand ml-1"></i>
                    انقر للتكبير
                </div>
            </div>
        );
    }

    if (media.__typename === 'Video' || media.__isMedia === 'Video' || media.video_url || media.video) {
        const videoSrc = media.video_url || media.video?.uri || media.url;
        const posterSrc = media.thumbnail || media.poster;
        const description = media.description;
        
        return (
            <div className="media-item relative group cursor-pointer rounded-lg overflow-hidden"
                 onClick={() => videoSrc && window.open(videoSrc, '_blank')}>
                {posterSrc && (
                    <img
                        src={posterSrc}
                        alt="معاينة الفيديو"
                        className="w-full h-auto max-h-96 object-contain"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-60 transition-all">
                    <div className="bg-white bg-opacity-90 rounded-full p-3 group-hover:scale-110 transition-transform">
                        <i className="fas fa-play text-blue-600 text-2xl"></i>
                    </div>
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    <i className="fas fa-video ml-1"></i>
                    فيديو
                </div>
                {description && (
                    <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        <i className="fas fa-info-circle ml-1"></i>
                        يحتوي على وصف
                    </div>
                )}
            </div>
        );
    }

    // Handle other media types
    if (media.url || media.uri) {
        return (
            <div className="media-item">
                <a href={media.url || media.uri} target="_blank" rel="noopener noreferrer"
                   className="block bg-gradient-to-br from-gray-100 to-gray-200 p-6 text-center hover:from-blue-50 hover:to-blue-100 transition-all h-auto min-h-48 flex flex-col justify-center rounded-lg">
                    <i className="fas fa-file text-gray-500 text-3xl mb-3"></i>
                    <p className="text-gray-600 text-sm font-medium">ملف مرفق</p>
                    {media.title && <p className="text-gray-800 font-semibold mt-2 truncate">{media.title}</p>}
                </a>
            </div>
        );
    }

    return (
        <div className="media-item bg-gradient-to-br from-gray-100 to-gray-200 p-6 text-center h-48 flex flex-col justify-center rounded-lg">
            <i className="fas fa-file text-gray-400 text-3xl mb-3"></i>
            <p className="text-gray-600 text-sm">نوع ملف غير مدعوم</p>
        </div>
    );
}

// Export for use in other files
window.MediaItem = MediaItem;