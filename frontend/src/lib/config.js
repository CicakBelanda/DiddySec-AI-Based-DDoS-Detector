// src/lib/config.js
/**
 * Konfigurasi API endpoints untuk DiddySec
 */

// API untuk deteksi menggunakan CSV file
export const CSV_API_BASE = 'https://web-production-4a62.up.railway.app';
export const CSV_API_KEY = 'this-is-api-key-lol';

// API untuk deteksi real-time/live
export const LIVE_API_BASE = import.meta.env.VITE_LIVE_API_BASE || 'https://web-production-8fe18.up.railway.app';
export const LIVE_API_KEY = import.meta.env.VITE_LIVE_API_KEY || 'this-is-api-key-lol';

/**
 * Fungsi helper untuk mengakses API yang tepat berdasarkan jenis deteksi
 */

export function getApiBase(type = 'csv') {
	return type.toLowerCase() === 'live' ? LIVE_API_BASE : CSV_API_BASE;
}

export function getApiKey(type = 'csv') {
	return type.toLowerCase() === 'live' ? LIVE_API_KEY : CSV_API_KEY;
}           // match your FastAPI’s API_KEYS

