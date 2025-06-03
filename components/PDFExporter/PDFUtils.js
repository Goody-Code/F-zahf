// PDF Utilities Module - Enhanced for Multi-Account Support
function PDFUtils() {
    
    const formatDate = (timestamp) => {
        if (typeof timestamp === 'number') {
            return new Date(timestamp * 1000).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return new Date(timestamp).toLocaleDateString('ar-SA');
    };

    const cleanReferences = (references) => {
        if (!references || !Array.isArray(references)) return [];
        
        return references
            .map(ref => {
                if (ref.url && ref.url.includes('hashtag')) {
                    const hashtag = ref.url.split('/').pop();
                    if (hashtag) {
                        let cleanHashtag = decodeURIComponent(hashtag);
                        cleanHashtag = cleanHashtag.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0621-\u063A\u0640-\u064F]/g, '');
                        cleanHashtag = cleanHashtag.replace(/[_\-\.]+/g, '').trim();
                        if (cleanHashtag && cleanHashtag.length > 1) {
                            return `#${cleanHashtag}`;
                        }
                    }
                } else if (ref.short_name || ref.name) {
                    const name = ref.short_name || ref.name;
                    let cleanMention = name.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0621-\u063A\u0640-\u064F\s]/g, '');
                    cleanMention = cleanMention.replace(/\s+/g, ' ').trim();
                    if (cleanMention && cleanMention.length > 1) {
                        return `@${cleanMention}`;
                    }
                }
                return null;
            })
            .filter(ref => ref !== null);
    };

    const createPostContent = (post, index) => {
        const postContent = [];

        // Post header
        postContent.push({
            text: [
                { text: `منشور رقم ${index + 1}`, bold: true, fontSize: 14 },
                { text: `  •  ${formatDate(post.timestamp || post.created_at || post.date)}`, fontSize: 10, color: '#6b7280' }
            ],
            margin: [0, 0, 0, 10]
        });

        // Post text
        if (post.text) {
            postContent.push({
                text: post.text,
                style: 'postContent',
                margin: [10, 0, 0, 10]
            });
        }

        // Post media
        if (post.media && post.media.length > 0) {
            postContent.push({
                text: `📎 الوسائط المرفقة: ${post.media.length} عنصر`,
                fontSize: 10,
                color: '#6b7280',
                margin: [10, 0, 0, 5]
            });
        }

        // Hashtags and mentions
        if (post.textReferences && post.textReferences.length > 0) {
            const references = cleanReferences(post.textReferences);
            if (references.length > 0) {
                postContent.push({
                    text: `🏷️ الوسوم والإشارات: ${references.join('، ')}`,
                    fontSize: 10,
                    color: '#3b82f6',
                    margin: [10, 0, 0, 5]
                });
            }
        }

        // Post stats
        const stats = [];
        if (post.likes || post.reactions) stats.push(`❤️ ${(post.likes || post.reactions).toLocaleString('ar-SA')}`);
        if (post.comments || post.commentsCount) stats.push(`💬 ${(post.comments || post.commentsCount).toLocaleString('ar-SA')}`);
        if (post.shares || post.sharesCount) stats.push(`🔄 ${(post.shares || post.sharesCount).toLocaleString('ar-SA')}`);

        if (stats.length > 0) {
            postContent.push({
                text: stats.join('  •  '),
                fontSize: 10,
                color: '#6b7280',
                margin: [10, 5, 0, 0]
            });
        }

        return postContent;
    };

    const createFooter = (sessionData) => {
        return (currentPage, pageCount) => {
            return {
                text: `${sessionData?.name || 'ملف شخصي'} - صفحة ${currentPage} من ${pageCount}`,
                alignment: 'center',
                fontSize: 10,
                color: '#6b7280',
                margin: [0, 10, 0, 0]
            };
        };
    };

    const createMultiAccountFooter = (sessionData) => {
        return (currentPage, pageCount) => {
            const accountCount = sessionData?.accounts?.length || 1;
            return {
                text: `${sessionData?.name || 'تقرير متعدد الحسابات'} (${accountCount} حسابات) - صفحة ${currentPage} من ${pageCount}`,
                alignment: 'center',
                fontSize: 10,
                color: '#6b7280',
                margin: [0, 10, 0, 0]
            };
        };
    };

    return {
        formatDate,
        cleanReferences,
        createPostContent,
        createFooter,
        createMultiAccountFooter
    };
}

window.PDFUtils = PDFUtils;