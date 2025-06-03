// Date Utility Functions - Extracted from ProfilePage.js
function DateUtils() {
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

    const renderTextWithReferences = (text, references) => {
        if (!text) return '';
        if (!references || references.length === 0) return text;

        let result = text;
        references.forEach(ref => {
            if (ref.url && ref.url.includes('hashtag')) {
                const hashtag = ref.url.split('/').pop();
                result = result.replace(`#${hashtag}`, `<a href="${ref.url}" class="hashtag" target="_blank">#${hashtag}</a>`);
            } else if (ref.short_name) {
                result = result.replace(ref.short_name, `<a href="${ref.url}" class="mention" target="_blank">${ref.short_name}</a>`);
            }
        });

        return result;
    };

    return { formatDate, renderTextWithReferences };
}

// Export for use in other files
window.DateUtils = DateUtils;