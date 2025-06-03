// Intelligence Analysis Module for Security Reports - Enhanced for Multi-Account
function IntelligenceAnalyzer() {
    
    const analyzeProfile = async (sessionData) => {
        if (!window.websim?.chat?.completions?.create) {
            throw new Error('نظام الذكاء الاصطناعي غير متوفر');
        }

        try {
            const profile = Array.isArray(sessionData.profile) ? sessionData.profile[0] : sessionData.profile;
            const posts = sessionData.posts || [];
            
            // Prepare analysis data
            const analysisData = {
                name: sessionData.name || profile?.title || 'غير محدد',
                profileInfo: profile,
                posts: posts.slice(0, 50), // Analyze first 50 posts
                totalPosts: posts.length
            };

            const completion = await window.websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `أنت محلل استخباراتي متقدم في القيادة اليمنية بصنعاء. مهمتك تحليل البيانات الرقمية للأهداف المعادية وإنتاج تقارير أمنية شاملة.

تحليل البيانات وفق النموذج التالي بالضبط:

---الموضوع: بلاغ أمني حول نشاط تحريضي عالي التأثير للمدعو [الاسم]---

---البيانات العامة للمذكور:
الاسم: [الاسم الكامل]
محافظة الإقامة: [استنتج من البيانات أو اكتب "غير محدد"]
المديرية: [استنتج من البيانات أو اكتب "غير محدد"]
الحسابات: [روابط الحسابات]
عدد المتابعين: [العدد]
الصفة: [ناشط، محرض، مرتزق...]
الانتماء المرجّح: [عفاشي، إصلاحي، سعودي، إماراتي...]
الحالة: [نشط، محتمل تواجده في...]
---

---ملخص النشاط التحريضي العام:
[تحليل شامل لجميع المنشورات]

1. التحريض ضد السلطة المحلية:
النص: "[اقتباس من المنشور]"
التحليل: [تحليل لغوي واستخباراتي]

2. التحريض ضد القضاء:
النص: "[اقتباس]"
التحليل: [التحليل]

3. التحريض ضد الأمن:
النص: "[اقتباس]"
التحليل: [التحليل]
---

---التحليل العام لنشاط المذكور:
(1) النمط العام للنشاط: نمط رمادي تعبوي يستهدف...
(2) الأهداف الخفية: إسقاط ممنهج للمؤسسات...
(3) مستوى التأثير والخطورة: عالي/متوسط/منخفض
---

---الاستهداف العام لمنشوراته:
[تحديد الجهات المستهدفة]
---

---التوصيات والإجراءات:
1. رفع نسخة للقيادة العليا
2. الرصد المستمر للنشاط
3. التحقق الميداني من الموقع
4. تفعيل الشبكة الأمنية المحلية
---

استخدم المفردات الاستخباراتية: نمط رمادي، خطاب تعبوي، واجهة رقمية، أدوات ضغط ناعمة، إسقاط ممنهج، غرفة عمليات معادية، تنسيق مع جهات خارجية.

تحليل بنبرة أنصار الله الحوثية الاستخباراتية المهنية.`
                    },
                    {
                        role: "user",
                        content: `تحليل البيانات التالية:

الاسم: ${analysisData.name}
المعلومات الشخصية: ${JSON.stringify(analysisData.profileInfo)}
عدد المنشورات: ${analysisData.totalPosts}
عينة من المنشورات: ${JSON.stringify(analysisData.posts.map(p => ({ text: p.text, date: p.timestamp })))}`
                    }
                ],
                json: false
            });

            return completion.content;
        } catch (error) {
            console.error('Intelligence analysis error:', error);
            throw new Error('فشل في تحليل البيانات - ' + error.message);
        }
    };

    const analyzeMultipleProfiles = async (sessionData) => {
        if (!window.websim?.chat?.completions?.create) {
            throw new Error('نظام الذكاء الاصطناعي غير متوفر');
        }

        try {
            const accounts = sessionData.accounts || [];
            const allPosts = accounts.flatMap(acc => acc.posts || []);
            
            const completion = await window.websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `أنت محلل استخباراتي متقدم. مهمتك تحليل عدة حسابات مرتبطة وإنتاج تقرير موحد.

---الموضوع: بلاغ أمني حول شبكة حسابات تحريضية عالية التأثير---

---البيانات العامة للشبكة:
عدد الحسابات: [العدد]
الأسماء: [قائمة الأسماء]
إجمالي المتابعين: [العدد]
إجمالي المنشورات: [العدد]
---

---التحليل الموحد للشبكة:
1. احتمال الارتباط بشخص واحد: [تحليل التشابه في الأسلوب والتوقيت]
2. التكرار في نمط النشر: [تحليل الأنماط المتكررة]
3. التفاعل المتبادل: [تحليل التفاعل بين الحسابات]
4. تشابه المواقع والشبكات: [تحليل الموقع الجغرافي والاتصالات]
5. مستوى الخطر الإجمالي: [تقييم عام للتهديد]
---

---التوصيات العليا:
[توصيات شاملة للتعامل مع الشبكة]
---`
                    },
                    {
                        role: "user",
                        content: `تحليل الشبكة التالية:

عدد الحسابات: ${accounts.length}
البيانات: ${JSON.stringify(accounts.map(acc => ({
                            name: acc.name,
                            profile: acc.profile?.[0],
                            postsCount: acc.posts?.length || 0,
                            samplePosts: acc.posts?.slice(0, 10).map(p => p.text) || []
                        })))}`
                    }
                ],
                json: false
            });

            return completion.content;
        } catch (error) {
            console.error('Multi-profile analysis error:', error);
            throw new Error('فشل في التحليل الموحد - ' + error.message);
        }
    };

    const generateThreatBadge = async (reportContent) => {
        if (!window.websim?.chat?.completions?.create) {
            return {
                level: 'محتمل',
                description: 'يتطلب تحليل إضافي',
                color: 'orange'
            };
        }

        try {
            const completion = await window.websim.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `استخرج من التقرير الأمني مستوى التهديد والوصف بصيغة JSON:
{
  "level": "ناشط تحريضي" أو "محرض سياسي" أو "مرتزق" أو "ذراع إعلامية" أو "عميل",
  "description": "وصف قصير للخطر",
  "color": "red" أو "orange" أو "yellow"
}`
                    },
                    {
                        role: "user",
                        content: reportContent
                    }
                ],
                json: true
            });

            return JSON.parse(completion.content);
        } catch (error) {
            return {
                level: 'محتمل',
                description: 'يتطلب تحليل إضافي',
                color: 'orange'
            };
        }
    };

    return {
        analyzeProfile,
        analyzeMultipleProfiles,
        generateThreatBadge
    };
}

window.IntelligenceAnalyzer = IntelligenceAnalyzer;