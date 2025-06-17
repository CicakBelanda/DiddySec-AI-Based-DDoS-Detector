// src/lib/apiService.js

import { getApiBase, getApiKey } from './config';

/**
 * Fetch the most recent detection history from /results.
 * Throws on non-200 or malformed data.
 */
export async function getDetectionHistory(limit = 10, criticalOnly = false) {
	const base = getApiBase('live');
	const key  = getApiKey('live');

	const params = new URLSearchParams({ limit: String(limit) });
	if (criticalOnly) params.set('critical_only', 'true');

	const res = await fetch(`${base}/results?${params.toString()}`, {
		headers: { 'X-API-Key': key }
	});

	// 1) HTTP-level check
	if (!res.ok) {
		throw new Error(`History API error: ${res.status} ${res.statusText}`);
	}

	// 2) Parse JSON
	const data = await res.json();

	// 3) Validate shape
	if (!Array.isArray(data)) {
		throw new Error('Unexpected response: expected an array of history records');
	}
	for (const record of data) {
		if (
			typeof record.timestamp !== 'string' ||
			typeof record.normal_count !== 'number' ||
			typeof record.intrusion_count !== 'number' ||
			typeof record.capture_id !== 'string'
		) {
			throw new Error('Malformed history record in API response');
		}
	}

	return data;
}

/**
 * Fetch overall statistics from /stats.
 * Throws on non-200 or malformed data.
 */
export async function getStatistics() {
	const base = getApiBase('live');
	const key  = getApiKey('live');

	const res = await fetch(`${base}/stats`, {
		headers: { 'X-API-Key': key }
	});

	// 1) HTTP-level check
	if (!res.ok) {
		throw new Error(`Stats API error: ${res.status} ${res.statusText}`);
	}

	// 2) Parse JSON
	const stats = await res.json();

	// 3) Validate expected fields
	if (
		typeof stats.total_detections !== 'number' ||
		typeof stats.critical_detections !== 'number' ||
		typeof stats.last_24h !== 'object' ||
		!Array.isArray(stats.hosts)
	) {
		throw new Error('Unexpected stats format from API');
	}

	return stats;
}
