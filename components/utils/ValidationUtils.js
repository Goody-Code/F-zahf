// Validation Utilities - Extracted from HomePage
function ValidationUtils() {
    const validateName = (name) => {
        return name && name.trim().length > 0;
    };

    const parseAndValidateProfile = (profileText) => {
        const profileData = JSON.parse(profileText);
        if (!Array.isArray(profileData) || profileData.length === 0) {
            throw new Error('ملف البيانات الشخصية يجب أن يحتوي على مصفوفة من البيانات');
        }
        // Validate profile structure
        const profile = profileData[0];
        if (!profile.title && !profile.name && !profile.facebookUrl) {
            throw new Error('ملف البيانات الشخصية لا يحتوي على البيانات المطلوبة');
        }
        return profileData;
    };

    const parseAndValidatePosts = (postsText) => {
        const postsData = JSON.parse(postsText);
        if (!Array.isArray(postsData)) {
            throw new Error('ملف المنشورات يجب أن يكون مصفوفة من المنشورات');
        }
        // Validate posts structure
        if (postsData.length > 0) {
            const firstPost = postsData[0];
            if (!firstPost.text && !firstPost.media && !firstPost.timestamp) {
                throw new Error('ملف المنشورات لا يحتوي على البيانات المطلوبة');
            }
        }
        return postsData;
    };

    return {
        validateName,
        parseAndValidateProfile,
        parseAndValidatePosts
    };
}

window.ValidationUtils = ValidationUtils;

