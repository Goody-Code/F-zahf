// Apify Crawler Service
function ApifyCrawlerService() {
    const APIFY_BASE_URL = 'https://api.apify.com/v2';
    const PROFILE_ACTOR_ID = '4Hv5RhChiaDk6iwad';
    const POSTS_ACTOR_ID = 'KoJrdxJCTtpon81KY';

    const startRun = async (actorId, input, apiKey) => {
        const response = await fetch(`${APIFY_BASE_URL}/acts/${actorId}/runs?token=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    };

    const checkRunStatus = async (runId, apiKey) => {
        const response = await fetch(`${APIFY_BASE_URL}/actor-runs/${runId}?token=${apiKey}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    };

    const getDatasetItems = async (datasetId, apiKey) => {
        const response = await fetch(`${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${apiKey}&format=json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    };

    const waitForRun = async (runId, apiKey, onProgress) => {
        const maxAttempts = 120; // 10 minutes max (5 seconds * 120)
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                const runData = await checkRunStatus(runId, apiKey);
                const status = runData.data.status;

                if (onProgress) {
                    onProgress(`حالة العملية: ${status} (${attempts * 5}s)`);
                }

                if (status === 'SUCCEEDED') {
                    return runData.data;
                } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
                    throw new Error(`فشلت العملية: ${status}`);
                }

                // Wait 5 seconds before next check
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            } catch (error) {
                console.error('Error checking run status:', error);
                if (attempts > 5) { // Allow a few retries for network issues
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 5000));
                attempts++;
            }
        }

        throw new Error('انتهت مهلة انتظار العملية');
    };

    const crawlProfile = async (profileUrl, apiKey, onProgress) => {
        try {
            if (onProgress) onProgress('بدء قشط البيانات التعريفية...');

            const input = {
                startUrls: [{ url: profileUrl }]
            };

            const runResponse = await startRun(PROFILE_ACTOR_ID, input, apiKey);
            const runId = runResponse.data.id;

            if (onProgress) onProgress(`تم بدء العملية: ${runId}`);

            const completedRun = await waitForRun(runId, apiKey, onProgress);
            const datasetId = completedRun.defaultDatasetId;

            if (onProgress) onProgress('استخراج البيانات التعريفية...');

            const profileData = await getDatasetItems(datasetId, apiKey);

            if (!profileData || profileData.length === 0) {
                throw new Error('لم يتم العثور على بيانات تعريفية');
            }

            return profileData;

        } catch (error) {
            console.error('Profile crawling error:', error);
            throw new Error(`فشل في قشط البيانات التعريفية: ${error.message}`);
        }
    };

    const crawlPosts = async (profileUrl, resultsLimit, apiKey, onProgress) => {
        try {
            if (onProgress) onProgress('بدء قشط المنشورات...');

            const input = {
                startUrls: [{ url: profileUrl }],
                resultsLimit: resultsLimit,
                captionText: false
            };

            const runResponse = await startRun(POSTS_ACTOR_ID, input, apiKey);
            const runId = runResponse.data.id;

            if (onProgress) onProgress(`تم بدء عملية قشط المنشورات: ${runId}`);

            const completedRun = await waitForRun(runId, apiKey, onProgress);
            const datasetId = completedRun.defaultDatasetId;

            if (onProgress) onProgress('استخراج بيانات المنشورات...');

            const postsData = await getDatasetItems(datasetId, apiKey);

            if (!postsData) {
                return [];
            }

            return postsData;

        } catch (error) {
            console.error('Posts crawling error:', error);
            throw new Error(`فشل في قشط المنشورات: ${error.message}`);
        }
    };

    return {
        crawlProfile,
        crawlPosts
    };
}

window.ApifyCrawlerService = ApifyCrawlerService;