// Post Card Component
function PostCard({ post, formatDate, renderTextWithReferences }) {
    // Enhanced function to clean and extract references properly
    const extractReferences = (text, references) => {
        if (!text || !references || references.length === 0) return { hashtags: [], mentions: [] };
        
        const hashtags = [];
        const mentions = [];
        
        references.forEach(ref => {
            if (ref.url && ref.url.includes('hashtag')) {
                const hashtag = ref.url.split('/').pop();
                if (hashtag) {
                    // Enhanced cleaning for hashtags - remove all non-Arabic/English/numbers
                    let cleanHashtag = decodeURIComponent(hashtag);
                    // Remove special characters but keep Arabic, English, and numbers
                    cleanHashtag = cleanHashtag.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0621-\u063A\u0640-\u064F]/g, '');
                    // Remove extra underscores, dashes, and symbols
                    cleanHashtag = cleanHashtag.replace(/[_\-\.]+/g, '').trim();
                    
                    if (cleanHashtag && cleanHashtag.length > 1) {
                        hashtags.push({ text: `#${cleanHashtag}`, url: ref.url });
                    }
                }
            } else if (ref.short_name || ref.name) {
                const name = ref.short_name || ref.name;
                // Enhanced cleaning for mentions
                let cleanMention = name.replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0621-\u063A\u0640-\u064F\s]/g, '');
                // Remove extra spaces and clean up
                cleanMention = cleanMention.replace(/\s+/g, ' ').trim();
                
                if (cleanMention && cleanMention.length > 1) {
                    mentions.push({ text: cleanMention, url: ref.url || '#' });
                }
            }
        });
        
        return { hashtags, mentions };
    };

    const { hashtags, mentions } = extractReferences(post.text, post.textReferences);

    // Check if this is a shared post
    const isSharedPost = post.shared_post || post.reshared_post || post.original_post;
    const sharedPostData = post.shared_post || post.reshared_post || post.original_post;

    return (
        <div className="post-card p-6 mb-6 fade-in">
            {/* Post Header */}
            <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <img
                    src={post.user?.profilePic || post.author?.avatar || '/default-avatar.png'}
                    alt={post.user?.name || post.author?.name || 'مستخدم'}
                    className="w-12 h-12 rounded-full border-2 border-blue-200"
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlNWU3ZWIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzllYTNhOCI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPHN2Zz4KPC9zdmc+';
                    }}
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                        {post.user?.name || post.author?.name || 'مستخدم غير معروف'}
                    </h3>
                    <p className="timestamp">{formatDate(post.timestamp || post.created_at || post.date)}</p>
                    {post.postId && (
                        <p className="text-xs text-gray-500">معرف المنشور: {post.postId}</p>
                    )}
                    {isSharedPost && (
                        <div className="flex items-center mt-1">
                            <i className="fas fa-share text-green-600 text-sm ml-1"></i>
                            <span className="text-green-600 text-sm font-medium">شارك منشوراً</span>
                        </div>
                    )}
                </div>
                {(post.url || post.link) && (
                    <a
                        href={post.url || post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-full"
                    >
                        <i className="fas fa-external-link-alt"></i>
                    </a>
                )}
            </div>

            {/* Enhanced Shared Post Display */}
            {isSharedPost && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
                    <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ml-2">
                            <i className="fas fa-share text-white text-sm"></i>
                        </div>
                        <div>
                            <span className="font-semibold text-green-700">منشور مُعاد نشره</span>
                            {sharedPostData?.timestamp && (
                                <p className="text-xs text-green-600">
                                    تاريخ المنشور الأصلي: {formatDate(sharedPostData.timestamp)}
                                </p>
                            )}
                        </div>
                    </div>
                    {sharedPostData?.author && (
                        <div className="mb-2 flex items-center">
                            <i className="fas fa-user text-green-600 ml-2"></i>
                            <span className="font-medium text-green-700">المؤلف الأصلي:</span>
                            <span className="text-green-800 mr-2">{sharedPostData.author.name || sharedPostData.author}</span>
                        </div>
                    )}
                    {sharedPostData?.text && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-green-300 shadow-sm">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{sharedPostData.text}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Post Content */}
            {post.text && (
                <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border-r-4 border-blue-500">
                        {post.text}
                    </p>
                </div>
            )}

            {/* Enhanced Hashtags and Mentions Display */}
            {(hashtags.length > 0 || mentions.length > 0) && (
                <div className="references-box mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-hashtag text-blue-600 ml-2"></i>
                        الوسوم والإشارات المرجعية
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {hashtags.map((hashtag, index) => (
                            <a
                                key={`hashtag-${index}`}
                                href={hashtag.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hashtag-mention bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-full text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                                title={`الوسم: ${hashtag.text}`}
                            >
                                <i className="fas fa-hashtag ml-1"></i>
                                {hashtag.text}
                            </a>
                        ))}
                        {mentions.map((mention, index) => (
                            <a
                                key={`mention-${index}`}
                                href={mention.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hashtag-mention bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-full text-sm hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                                title={`إشارة إلى: ${mention.text}`}
                            >
                                <i className="fas fa-at ml-1"></i>
                                {mention.text}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Post Title */}
            {post.title && (
                <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        {post.title}
                    </h4>
                </div>
            )}

            {/* Post Description */}
            {post.description && (
                <div className="mb-4">
                    <p className="text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        {post.description}
                    </p>
                </div>
            )}

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
                <div className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-photo-video text-purple-600 ml-2"></i>
                        الوسائط المرفقة ({post.media.length})
                    </h5>
                    <div className="media-grid">
                        {post.media.map((item, index) => (
                            <MediaItem key={index} media={item} />
                        ))}
                    </div>
                </div>
            )}

            {/* Post Attachments */}
            {post.attachments && post.attachments.length > 0 && (
                <div className="mb-4">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <i className="fas fa-paperclip text-indigo-600 ml-2"></i>
                        المرفقات ({post.attachments.length})
                    </h5>
                    <div className="space-y-2">
                        {post.attachments.map((attachment, index) => (
                            <div key={index} className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
                                <i className="fas fa-file text-indigo-600 ml-2"></i>
                                مرفق #{index + 1}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-6 space-x-reverse">
                    <div className="reaction-counter bg-red-100 px-3 py-1 rounded-full">
                        <i className="fas fa-heart text-red-500"></i>
                        <span className="text-red-700 font-medium mr-1">{post.likes || post.reactions || 0}</span>
                    </div>
                    <div className="reaction-counter bg-blue-100 px-3 py-1 rounded-full">
                        <i className="fas fa-comment text-blue-500"></i>
                        <span className="text-blue-700 font-medium mr-1">{post.comments || post.commentsCount || 0}</span>
                    </div>
                    <div className="reaction-counter bg-green-100 px-3 py-1 rounded-full">
                        <i className="fas fa-share text-green-500"></i>
                        <span className="text-green-700 font-medium mr-1">{post.shares || post.sharesCount || 0}</span>
                    </div>
                    {post.views && (
                        <div className="reaction-counter bg-purple-100 px-3 py-1 rounded-full">
                            <i className="fas fa-eye text-purple-500"></i>
                            <span className="text-purple-700 font-medium mr-1">{post.views}</span>
                        </div>
                    )}
                </div>
                
                {(post.topReactionsCount > 0 || post.reactionCounts) && (
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {post.topReactionsCount || 'متعدد'} تفاعل متميز
                    </span>
                )}
            </div>
        </div>
    );
}

// Export for use in other files
window.PostCard = PostCard;