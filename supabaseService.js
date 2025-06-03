// supabaseService.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://qzxckyqmebejawhwdabd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eGNreXFtZWJlamF3aHdkYWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5ODcwMzIsImV4cCI6MjA2NDU2MzAzMn0.VgTZ382EGFpYWuHgtjEJ1Ne3l4sbryN4tw_wUTGE8xA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This decompressData function is duplicated here for utility within this service.
// Ideally, it would be imported from a shared utils module.
function decompressData(compressedData) {
    if (!compressedData) return null;
    try {
        const decompressed = decodeURIComponent(atob(compressedData));
        return JSON.parse(decompressed);
    } catch (error) {
        console.error('Decompression failed in supabaseService:', error);
        // Return an empty object or specific error indicator if preferred
        return { error: "Decompression failed", details: error.message };
    }
}

// Function to get user ID (placeholder)
const getUserId = () => {
    // For now, user_id is not strictly enforced or used in queries.
    // Implement proper user ID retrieval if Supabase Auth is integrated.
    return null;
};

export async function loadSessionsFromSupabase() {
    const userId = getUserId(); // Currently null
    let query = supabase.from('sessions').select('*').order('created_at', { ascending: false });

    // Example for when user_id is implemented:
    // if (userId) {
    //     query = query.eq('user_id', userId);
    // } else {
    //     query = query.is('user_id', null); // For anonymous sessions if RLS is set up this way
    // }

    const { data, error } = await query;

    if (error) {
        console.error('Error loading sessions from Supabase:', error);
        return null;
    }
    console.log('Sessions loaded from Supabase:', data);
    return data.map(session => {
        const profileData = session.compressed_profile_data ? decompressData(session.compressed_profile_data) : null;
        const postsData = session.compressed_posts_data ? decompressData(session.compressed_posts_data) : null;
        return {
            id: session.id,
            name: session.name,
            profile_data: profileData,
            posts_data: postsData,
            created_at: session.created_at,
            compressed_profile: session.compressed_profile_data,
            compressed_posts: session.compressed_posts_data,
            compressed: !!(session.compressed_profile_data || session.compressed_posts_data),
            size: (session.compressed_profile_data?.length || 0) + (session.compressed_posts_data?.length || 0),
            metadata: session.metadata || {},
            // Store the original Supabase ID if it's different from a local one (for future updates)
            supabase_id: session.id
        };
    });
}

export async function saveSessionToSupabase(sessionData) {
    const userId = getUserId();
    const record = {
        name: sessionData.name,
        compressed_profile_data: sessionData.compressed_profile,
        compressed_posts_data: sessionData.compressed_posts,
        profile_data_size: sessionData.compressed_profile?.length || 0,
        posts_data_size: sessionData.compressed_posts?.length || 0,
        created_at: sessionData.created_at || new Date().toISOString(),
        metadata: sessionData.metadata || {},
        // user_id: userId, // Add if auth is implemented
        schema_version: 1,
    };

    // If sessionData.id is a UUID (from Supabase), it's an update.
    // Otherwise (timestamp from localStorage or undefined), it's an insert.
    let response;
    if (sessionData.id && !/^[0-9]+$/.test(sessionData.id) && sessionData.id.length > 10) { // Basic check for UUID-like ID
        record.id = sessionData.id;
        response = await supabase.from('sessions').update(record).eq('id', record.id).select();
    } else {
        // ID is local or undefined, insert new record (Supabase will generate PK)
        response = await supabase.from('sessions').insert(record).select();
    }

    const { data, error } = response;

    if (error) {
        console.error('Error saving session to Supabase:', error);
        return null;
    }

    if (data && data.length > 0) {
        const saved = data[0];
        return {
            id: saved.id, // Use the ID from Supabase
            name: saved.name,
            profile_data: sessionData.profile_data,
            posts_data: sessionData.posts_data,
            created_at: saved.created_at,
            compressed_profile: saved.compressed_profile_data,
            compressed_posts: saved.compressed_posts_data,
            compressed: true,
            size: (saved.compressed_profile_data?.length || 0) + (saved.compressed_posts_data?.length || 0),
            metadata: saved.metadata || {},
            supabase_id: saved.id
        };
    }
    return null;
}

export async function deleteSessionFromSupabase(sessionId) {
    const { data, error } = await supabase.from('sessions').delete().eq('id', sessionId);
    if (error) {
        console.error('Error deleting session from Supabase:', sessionId, error);
        return false;
    }
    console.log('Session deleted from Supabase:', sessionId, data);
    return true;
}

export async function getSessionFromSupabase(sessionId) {
    const { data, error } = await supabase.from('sessions').select('*').eq('id', sessionId).maybeSingle();
    if (error) {
        console.error('Error fetching session by ID from Supabase:', error);
        return null;
    }
    if (!data) return null; // Not found

    const profileData = data.compressed_profile_data ? decompressData(data.compressed_profile_data) : null;
    const postsData = data.compressed_posts_data ? decompressData(data.compressed_posts_data) : null;

    return {
        id: data.id,
        name: data.name,
        profile_data: profileData,
        posts_data: postsData,
        created_at: data.created_at,
        compressed_profile: data.compressed_profile_data,
        compressed_posts: data.compressed_posts_data,
        compressed: !!(data.compressed_profile_data || data.compressed_posts_data),
        size: (data.compressed_profile_data?.length || 0) + (data.compressed_posts_data?.length || 0),
        metadata: data.metadata || {},
        supabase_id: data.id
    };
}

export async function updateSessionMetadataInSupabase(sessionId, metadata) {
    const { data, error } = await supabase
        .from('sessions')
        .update({ metadata: metadata, updated_at: new Date().toISOString() }) // Also update an 'updated_at' timestamp
        .eq('id', sessionId)
        .select();

    if (error) {
        console.error('Error updating session metadata in Supabase:', error);
        return null;
    }
    return data && data.length > 0 ? data[0] : null;
}
