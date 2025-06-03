// PDF Sections Generator Module - Enhanced for Multi-Account Support
function PDFSections() {
    
    const createMultiAccountCoverPage = (sessionData) => {
        const safeName = sessionData?.name || 'تقرير متعدد الحسابات';
        const accountCount = sessionData?.accounts?.length || 1;
        const totalPosts = sessionData?.accounts?.reduce((sum, acc) => sum + (acc.posts?.length || 0), 0) || 0;
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return {
            stack: [
                // Header with gradient effect simulation
                {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: 515,
                            h: 200,
                            color: '#4f46e5'
                        }
                    ]
                },
                {
                    text: 'التقرير الاستخباراتي الشامل',
                    style: 'profileName',
                    margin: [0, -150, 0, 20]
                },
                {
                    text: safeName,
                    style: 'profileName',
                    fontSize: 28,
                    margin: [0, 0, 0, 40]
                },
                // Information cards
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                {
                                    canvas: [
                                        {
                                            type: 'rect',
                                            x: 0,
                                            y: 0,
                                            w: 150,
                                            h: 80,
                                            color: '#3b82f6'
                                        }
                                    ]
                                },
                                {
                                    text: [
                                        { text: accountCount.toLocaleString('ar-SA'), fontSize: 24, bold: true },
                                        { text: '\nعدد الحسابات', fontSize: 12 }
                                    ],
                                    color: 'white',
                                    alignment: 'center',
                                    margin: [0, -60, 0, 0]
                                }
                            ]
                        },
                        { width: 20, text: '' },
                        {
                            width: '*',
                            stack: [
                                {
                                    canvas: [
                                        {
                                            type: 'rect',
                                            x: 0,
                                            y: 0,
                                            w: 150,
                                            h: 80,
                                            color: '#10b981'
                                        }
                                    ]
                                },
                                {
                                    text: [
                                        { text: totalPosts.toLocaleString('ar-SA'), fontSize: 24, bold: true },
                                        { text: '\nإجمالي المنشورات', fontSize: 12 }
                                    ],
                                    color: 'white',
                                    alignment: 'center',
                                    margin: [0, -60, 0, 0]
                                }
                            ]
                        },
                        { width: 20, text: '' },
                        {
                            width: '*',
                            stack: [
                                {
                                    canvas: [
                                        {
                                            type: 'rect',
                                            x: 0,
                                            y: 0,
                                            w: 150,
                                            h: 80,
                                            color: '#ef4444'
                                        }
                                    ]
                                },
                                {
                                    text: [
                                        { text: currentDate, fontSize: 14, bold: true },
                                        { text: '\nتاريخ التقرير', fontSize: 12 }
                                    ],
                                    color: 'white',
                                    alignment: 'center',
                                    margin: [0, -60, 0, 0]
                                }
                            ]
                        }
                    ],
                    margin: [0, 100, 0, 50]
                },
                // Display mode info
                {
                    text: `طريقة العرض: ${sessionData.displayMode === 'stacked' ? 'عرض متتالي' : 'عرض منفصل'}`,
                    alignment: 'center',
                    fontSize: 14,
                    color: '#6b7280',
                    margin: [0, 50, 0, 0]
                },
                {
                    text: `نوع التحليل: ${sessionData.analysisMode === 'unified' ? 'تحليل موحد' : 'تحليل منفرد'}`,
                    alignment: 'center',
                    fontSize: 14,
                    color: '#6b7280',
                    margin: [0, 10, 0, 0]
                },
                // Footer
                {
                    text: 'نظام أرشيف فيسبوك المتقدم - النسخة الاستخباراتية',
                    alignment: 'center',
                    fontSize: 14,
                    color: '#6b7280',
                    margin: [0, 50, 0, 0]
                }
            ],
            pageBreak: 'after'
        };
    };

    const createUnifiedIntelligenceSection = (intelligenceReport) => {
        return [
            {
                text: 'التقرير الاستخباراتي الموحد',
                style: 'sectionTitle',
                color: '#dc2626'
            },
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515,
                        h: 2,
                        color: '#dc2626'
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                text: typeof intelligenceReport === 'string' ? intelligenceReport : JSON.stringify(intelligenceReport, null, 2),
                fontSize: 11,
                lineHeight: 1.6,
                margin: [0, 0, 0, 20]
            },
            { text: '', pageBreak: 'after' }
        ];
    };

    const createAccountProfileSection = (account, index) => {
        const profile = account.profile?.[0] || {};
        const safeName = account.name || profile?.title || `حساب ${index + 1}`;

        return [
            {
                text: `الحساب ${index + 1}: ${safeName}`,
                style: 'sectionTitle'
            },
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515,
                        h: 2,
                        color: '#3b82f6'
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            ...createProfileSection({ name: safeName, profile: account.profile }),
        ];
    };

    const createAccountPostsSection = (account, index) => {
        return createPostsSection({ name: account.name, posts: account.posts });
    };

    const createAllProfilesSection = (accounts) => {
        const sections = [
            {
                text: 'المعلومات التعريفية لجميع الحسابات',
                style: 'sectionTitle'
            },
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515,
                        h: 2,
                        color: '#3b82f6'
                    }
                ],
                margin: [0, 0, 0, 20]
            }
        ];

        accounts.forEach((account, index) => {
            sections.push(...createAccountProfileSection(account, index));
        });

        sections.push({ text: '', pageBreak: 'after' });
        return sections;
    };

    const createAllPostsSection = (accounts) => {
        const sections = [
            {
                text: 'منشورات جميع الحسابات',
                style: 'sectionTitle'
            },
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515,
                        h: 2,
                        color: '#10b981'
                    }
                ],
                margin: [0, 0, 0, 20]
            }
        ];

        accounts.forEach((account, index) => {
            sections.push({
                text: `منشورات ${account.name || `الحساب ${index + 1}`}`,
                fontSize: 16,
                bold: true,
                margin: [0, 20, 0, 10]
            });
            sections.push(...createPostsSection(account));
        });

        return sections;
    };

    // Legacy single account functions (kept for backward compatibility)
    const createCoverPage = (sessionData) => {
        return createMultiAccountCoverPage(sessionData);
    };

    const createProfileSection = (sessionData) => {
        const profile = Array.isArray(sessionData?.profile) ? sessionData.profile[0] : sessionData?.profile || {};
        const safeName = sessionData?.name || profile?.title || 'ملف شخصي';

        const profileInfo = [];

        // Basic information
        if (profile.facebookUrl || profile.pageUrl) {
            profileInfo.push({
                text: [
                    { text: 'رابط الصفحة: ', bold: true },
                    { text: profile.facebookUrl || profile.pageUrl, link: profile.facebookUrl || profile.pageUrl, color: '#3b82f6' }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        if (profile.pageId || profile.facebookId) {
            profileInfo.push({
                text: [
                    { text: 'معرف الصفحة: ', bold: true },
                    { text: profile.pageId || profile.facebookId }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        if (profile.likes) {
            profileInfo.push({
                text: [
                    { text: 'الإعجابات: ', bold: true },
                    { text: profile.likes.toLocaleString('ar-SA') }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        if (profile.followers) {
            profileInfo.push({
                text: [
                    { text: 'المتابعون: ', bold: true },
                    { text: profile.followers.toLocaleString('ar-SA') }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        // Categories with Arabic translation
        if (profile.categories && profile.categories.length > 0) {
            const translatedCategories = profile.categories.map(cat => {
                const translations = {
                    'Profile': 'ملف شخصي',
                    'Public figure': 'شخصية عامة',
                    'Journalist': 'صحفي',
                    'Actor/Director': 'ممثل/مخرج',
                    'Artist': 'فنان',
                    'Musician': 'موسيقي',
                    'Writer': 'كاتب',
                    'Politician': 'سياسي',
                    'Business Person': 'رجل أعمال',
                    'Local Business': 'نشاط تجاري محلي'
                };
                return translations[cat] || cat;
            });

            profileInfo.push({
                text: [
                    { text: 'التصنيفات: ', bold: true },
                    { text: translatedCategories.join('، ') }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        // Personal details
        if (profile.WORK) {
            profileInfo.push({
                text: [
                    { text: 'العمل: ', bold: true },
                    { text: profile.WORK }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        if (profile.EDUCATION) {
            profileInfo.push({
                text: [
                    { text: 'التعليم: ', bold: true },
                    { text: profile.EDUCATION }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        if (profile.RELATIONSHIP) {
            const relationshipTranslations = {
                'Married': 'متزوج',
                'Single': 'أعزب',
                'In a relationship': 'في علاقة',
                'It\'s complicated': 'الأمر معقد'
            };
            profileInfo.push({
                text: [
                    { text: 'الحالة الاجتماعية: ', bold: true },
                    { text: relationshipTranslations[profile.RELATIONSHIP] || profile.RELATIONSHIP }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        // Multiple websites support
        if (profile.websites && profile.websites.length > 0) {
            profileInfo.push({
                text: { text: 'المواقع الإلكترونية:', bold: true },
                margin: [0, 10, 0, 5]
            });
            
            profile.websites.forEach(website => {
                profileInfo.push({
                    text: [
                        { text: '• ', bold: true },
                        { text: website, link: website, color: '#3b82f6' }
                    ],
                    margin: [10, 2, 0, 2]
                });
            });
        } else if (profile.website) {
            profileInfo.push({
                text: [
                    { text: 'الموقع الإلكتروني: ', bold: true },
                    { text: profile.website, link: profile.website, color: '#3b82f6' }
                ],
                margin: [0, 5, 0, 5]
            });
        }

        // About me section
        if (profile.about_me && profile.about_me.text) {
            profileInfo.push({
                text: { text: 'نبذة عني:', bold: true },
                margin: [0, 15, 0, 8]
            });
            profileInfo.push({
                text: profile.about_me.text,
                margin: [0, 0, 0, 10],
                fontSize: 11,
                lineHeight: 1.6
            });
        }

        return [
            {
                text: 'المعلومات الشخصية',
                style: 'sectionTitle'
            },
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515,
                        h: 2,
                        color: '#3b82f6'
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            ...profileInfo,
            { text: '', pageBreak: 'after' }
        ];
    };

    const createPostsSection = (sessionData) => {
        const posts = sessionData?.posts || [];
        if (posts.length === 0) {
            return [
                {
                    text: 'المنشورات',
                    style: 'sectionTitle'
                },
                {
                    text: 'لا توجد منشورات متاحة',
                    alignment: 'center',
                    margin: [0, 50, 0, 0],
                    fontSize: 14,
                    color: '#6b7280'
                }
            ];
        }

        const postsContent = [
            {
                text: 'المنشورات',
                style: 'sectionTitle'
            },
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 515,
                        h: 2,
                        color: '#3b82f6'
                    }
                ],
                margin: [0, 0, 0, 20]
            }
        ];

        // Statistics
        const totalComments = posts.reduce((sum, post) => sum + (post.comments || post.commentsCount || 0), 0);

        postsContent.push({
            columns: [
                {
                    width: '*',
                    stack: [
                        {
                            canvas: [
                                {
                                    type: 'rect',
                                    x: 0,
                                    y: 0,
                                    w: 120,
                                    h: 60,
                                    color: '#8b5cf6'
                                }
                            ]
                        },
                        {
                            text: [
                                { text: totalComments.toLocaleString('ar-SA'), fontSize: 18, bold: true },
                                { text: '\nإجمالي التعليقات', fontSize: 10 }
                            ],
                            color: 'white',
                            alignment: 'center',
                            margin: [0, -45, 0, 0]
                        }
                    ]
                }
            ],
            margin: [0, 0, 0, 30]
        });

        // Posts (limit to first 50 for performance)
        const pdfUtils = PDFUtils();
        posts.slice(0, 50).forEach((post, index) => {
            const postContent = pdfUtils.createPostContent(post, index);
            postsContent.push({
                stack: postContent,
                margin: [0, 0, 0, 20],
                fillColor: '#f8fafc',
                border: [false, false, false, true],
                borderColor: ['', '', '', '#e5e7eb']
            });
        });

        return postsContent;
    };

    return {
        createCoverPage,
        createProfileSection,
        createPostsSection,
        createMultiAccountCoverPage,
        createUnifiedIntelligenceSection,
        createAccountProfileSection,
        createAccountPostsSection,
        createAllProfilesSection,
        createAllPostsSection
    };
}

window.PDFSections = PDFSections;