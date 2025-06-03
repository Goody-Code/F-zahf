// Crawler Handler Utility - Enhanced for Multi-Account
function CrawlerHandler() {
    const handleStartCrawling = async (accounts, setShowCrawlerModal, setCrawlerAccounts, sessionName, fullName) => {
        setCrawlerAccounts(accounts.map(acc => ({ 
            ...acc, 
            sessionName,
            fullName: fullName || sessionName 
        })));
        setShowCrawlerModal(true);
    };

    const handleCrawlingComplete = async (results, setSessionData, setCurrentPage, saveSession, sessionName, fullName) => {
        if (results && results.length > 0) {
            try {
                // Create multi-account session structure
                const multiAccountSession = {
                    id: Date.now().toString(),
                    name: sessionName || `جلسة ${new Date().toLocaleDateString('ar-SA')}`,
                    fullName: fullName,
                    accounts: results.map((result, index) => ({
                        id: result.id || (Date.now() + index).toString(),
                        name: result.name || fullName || `حساب ${index + 1}`,
                        profile: result.profile,
                        posts: result.posts
                    })),
                    created_at: new Date().toISOString()
                };

                // Save the multi-account session
                await saveSession(
                    multiAccountSession.name, 
                    { accounts: multiAccountSession.accounts }, 
                    []
                );
                
                // Set as current session
                setSessionData(multiAccountSession);
                setCurrentPage('profile');
            } catch (error) {
                console.error('Error saving crawled sessions:', error);
                // Show error modal
                const errorModal = document.createElement('div');
                errorModal.className = 'modal-overlay';
                errorModal.innerHTML = `
                    <div class="modal-content">
                        <div class="text-center">
                            <div class="text-red-500 text-6xl mb-4">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">خطأ في حفظ البيانات</h3>
                            <p class="text-gray-600 mb-4">${error.message}</p>
                            <button onclick="this.closest('.modal-overlay').remove()" class="bg-red-500 text-white px-6 py-2 rounded-lg">
                                حسناً
                            </button>
                        </div>
                    </div>
                `;
                document.body.appendChild(errorModal);
            }
        }
    };

    return {
        handleStartCrawling,
        handleCrawlingComplete
    };
}

window.CrawlerHandler = CrawlerHandler;