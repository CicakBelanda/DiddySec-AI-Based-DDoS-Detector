<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getApiBase, getApiKey } from '$lib/config';
	import { getDetectionHistory, getStatistics } from '$lib/apiService';

	// State variables
	let loading = true;
	let error = null;
	let historyData = [];
	let statsData = null;
	let criticalOnly = false;
	let limit = 20;
	let timeRange = 'all'; // 'all', '24h', '7d', '30d'

	// Chart references
	let trendChartCanvas;
	let typesChartCanvas;
	let trendChart;
	let typesChart;

	// Format timestamp for display
	function formatTimestamp(isoString) {
		if (!isoString) return "Unknown";
		try {
			const date = new Date(isoString);
			return date.toLocaleString();
		} catch (e) {
			return "Invalid date";
		}
	}

	// Calculate percentage
	function calculatePercentage(intrusion, normal) {
		const total = intrusion + normal;
		if (total === 0) return 0;
		return Math.round((intrusion / total) * 100);
	}

	// Get badge class based on percentage
	function getBadgeClass(percentage) {
		if (percentage > 50) return "bg-danger";
		if (percentage > 20) return "bg-warning";
		if (percentage > 0) return "bg-info";
		return "bg-success";
	}

	// Get status text based on percentage
	function getStatusText(percentage) {
		if (percentage > 50) return "Critical";
		if (percentage > 20) return "High";
		if (percentage > 0) return "Low";
		return "Safe";
	}

	// Load history data
	async function loadHistory() {
		loading = true;
		error = null;

		try {
			historyData = await getDetectionHistory(limit, criticalOnly);
			statsData = await getStatistics();

			// Render charts after data is loaded
			renderCharts();
		} catch (err) {
			console.error("Error loading history:", err);
			error = err.message;
		} finally {
			loading = false;
		}
	}

	// Filter by time range
	function filterByTimeRange(records) {
		if (timeRange === 'all') return records;

		const now = new Date();
		let cutoff;

		if (timeRange === '24h') {
			cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		} else if (timeRange === '7d') {
			cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		} else if (timeRange === '30d') {
			cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		}

		return records.filter(record => {
			const recordDate = new Date(record.timestamp);
			return recordDate >= cutoff;
		});
	}

	// Update filters
	function updateFilters() {
		loadHistory();
	}

	// View detection details
	function viewDetectionDetails(captureId) {
		goto('/result', {
			state: {
				capture_id: captureId,
				apiType: 'live'
			}
		});
	}

	// Render trend and types charts
	function renderCharts() {
		if (!historyData || historyData.length === 0) return;

		// Prepare data for trend chart (last 10 entries in chronological order)
		const trendData = [...historyData]
			.slice(0, 10)
			.reverse();

		const trendLabels = trendData.map(item => {
			const date = new Date(item.timestamp);
			return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
		});

		const normalData = trendData.map(item => item.normal_count);
		const intrusionData = trendData.map(item => item.intrusion_count);

		// Render trend chart
		if (trendChartCanvas) {
			const ctx = trendChartCanvas.getContext('2d');

			if (trendChart) {
				trendChart.destroy();
			}

			trendChart = new Chart(ctx, {
				type: 'line',
				data: {
					labels: trendLabels,
					datasets: [
						{
							label: 'Normal Traffic',
							data: normalData,
							borderColor: '#36a2eb',
							backgroundColor: 'rgba(54, 162, 235, 0.1)',
							borderWidth: 2,
							fill: true
						},
						{
							label: 'Intrusion Traffic',
							data: intrusionData,
							borderColor: '#e53935',
							backgroundColor: 'rgba(229, 57, 53, 0.1)',
							borderWidth: 2,
							fill: true
						}
					]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							beginAtZero: true
						}
					}
				}
			});
		}

		// Prepare data for attack types chart
		const attackTypes = {};

		historyData.forEach(item => {
			if (item.intrusion_count > 0) {
				const type = item.attack_type || 'Unknown';
				if (!attackTypes[type]) {
					attackTypes[type] = 0;
				}
				attackTypes[type] += item.intrusion_count;
			}
		});

		const typeLabels = Object.keys(attackTypes);
		const typeData = Object.values(attackTypes);

		// Generate colors for each type
		const typeColors = [
			'#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
			'#9966ff', '#ff9f40', '#c9cbcf', '#8ac249'
		];

		// Render types chart
		if (typesChartCanvas && typeLabels.length > 0) {
			const ctx = typesChartCanvas.getContext('2d');

			if (typesChart) {
				typesChart.destroy();
			}

			typesChart = new Chart(ctx, {
				type: 'bar',
				data: {
					labels: typeLabels,
					datasets: [{
						label: 'Attack Distribution',
						data: typeData,
						backgroundColor: typeColors.slice(0, typeLabels.length),
						borderWidth: 1
					}]
				},
				options: {
					responsive: true,
					scales: {
						y: {
							beginAtZero: true
						}
					}
				}
			});
		}
	}

	onMount(() => {
		loadHistory();
	});
</script>

<style>
    .container {
        font-family: "Space Grotesk", sans-serif;
    }

    .card-box {
        background-color: #fff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 5px 0px black;
        border: 2px solid black;
        margin-bottom: 20px;
    }

    .history-table th, .history-table td {
        vertical-align: middle;
    }

    .filter-card {
        background-color: #f8f9fa;
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 20px;
        border: 2px solid #000;
    }

    .chart-container {
        position: relative;
        height: 300px;
        margin-bottom: 20px;
    }

    .stats-value {
        font-size: 2rem;
        font-weight: bold;
    }

    .stats-label {
        font-size: 0.9rem;
        color: #666;
    }

    .btn-back {
        background-color: #ffe2e6;
        border-radius: 12px;
        padding: 10px 20px;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 5px 0px black;
        border: 2px solid black;
        transition: all 0.3s ease-in-out;
        color: black;
    }

    .btn-back:hover {
        transform: translateY(-5px);
        background-color: #c81e1e;
        color: white;
    }

    .attack-type-badge {
        display: inline-block;
        padding: 5px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
        color: white;
        background-color: #ff6384;
    }
</style>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 mb-3">
	<div class="container-fluid">
		<a class="navbar-brand" href="#void">
			<img src="/images/Logo.png" alt="DiddySec" height="50">
		</a>
		<button class="btn-back" on:click={() => goto('/dashboard')}>
			<i class="bi bi-arrow-left"></i> Back to Dashboard
		</button>
	</div>
</nav>

<div class="container">
	<h2 class="mb-4">Detection History</h2>

	<!-- Summary Stats -->
	<div class="row mb-4">
		<div class="col-md-3">
			<div class="card-box text-center">
				<div class="stats-value">{statsData?.total_detections || 0}</div>
				<div class="stats-label">Total Detections</div>
			</div>
		</div>
		<div class="col-md-3">
			<div class="card-box text-center">
				<div class="stats-value">{statsData?.critical_detections || 0}</div>
				<div class="stats-label">Critical Detections</div>
			</div>
		</div>
		<div class="col-md-3">
			<div class="card-box text-center">
				<div class="stats-value">{statsData?.last_24h?.normal || 0}</div>
				<div class="stats-label">Normal Traffic (24h)</div>
			</div>
		</div>
		<div class="col-md-3">
			<div class="card-box text-center">
				<div class="stats-value text-danger">{statsData?.last_24h?.intrusion || 0}</div>
				<div class="stats-label">DDoS Traffic (24h)</div>
			</div>
		</div>
	</div>

	<!-- Filter Options -->
	<div class="filter-card">
		<div class="row align-items-center">
			<div class="col-md-3">
				<div class="form-check form-switch">
					<input class="form-check-input" type="checkbox" id="criticalSwitch" bind:checked={criticalOnly}>
					<label class="form-check-label" for="criticalSwitch">Critical Detections Only</label>
				</div>
			</div>
			<div class="col-md-3">
				<label for="timeRange" class="form-label">Time Range</label>
				<select class="form-select" id="timeRange" bind:value={timeRange}>
					<option value="all">All Time</option>
					<option value="24h">Last 24 Hours</option>
					<option value="7d">Last 7 Days</option>
					<option value="30d">Last 30 Days</option>
				</select>
			</div>
			<div class="col-md-3">
				<label for="limitSelect" class="form-label">Limit</label>
				<select class="form-select" id="limitSelect" bind:value={limit}>
					<option value="10">10 Records</option>
					<option value="20">20 Records</option>
					<option value="50">50 Records</option>
					<option value="100">100 Records</option>
				</select>
			</div>
			<div class="col-md-3">
				<button class="btn btn-primary w-100 mt-4" on:click={updateFilters}>
					Apply Filters
				</button>
			</div>
		</div>
	</div>

	<!-- Charts -->
	<div class="row">
		<div class="col-md-6">
			<div class="card-box">
				<h4>Detection Trend</h4>
				<div class="chart-container">
					<canvas bind:this={trendChartCanvas}></canvas>
				</div>
			</div>
		</div>
		<div class="col-md-6">
			<div class="card-box">
				<h4>Attack Type Distribution</h4>
				<div class="chart-container">
					<canvas bind:this={typesChartCanvas}></canvas>
				</div>
			</div>
		</div>
	</div>

	<!-- History Table -->
	<div class="card-box">
		<h4 class="mb-4">Detection Records</h4>

		{#if loading}
			<div class="text-center py-4">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
				<p class="mt-3">Loading detection history...</p>
			</div>
		{:else if error}
			<div class="alert alert-danger">
				Error loading history: {error}
			</div>
		{:else if historyData.length === 0}
			<div class="alert alert-info">
				No detection history found matching the current filters.
			</div>
		{:else}
			<div class="table-responsive">
				<table class="table table-hover history-table">
					<thead class="table-light">
					<tr>
						<th>Time</th>
						<th>Hostname</th>
						<th>Location</th>
						<th>Normal</th>
						<th>Intrusion</th>
						<th>Attack Type</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
					</thead>
					<tbody>
					{#each historyData as record}
						{@const percentage = calculatePercentage(record.intrusion_count, record.normal_count)}
						<tr class={percentage > 20 ? 'table-warning' : ''}>
							<td>{formatTimestamp(record.timestamp)}</td>
							<td>{record.hostname || 'Unknown'}</td>
							<td>{record.location || 'Unknown'}</td>
							<td>{record.normal_count.toLocaleString()}</td>
							<td>
								{#if record.intrusion_count > 0}
									<span class="text-danger fw-bold">{record.intrusion_count.toLocaleString()}</span>
								{:else}
									{record.intrusion_count.toLocaleString()}
								{/if}
							</td>
							<td>
								{#if record.intrusion_count > 0}
									<span class="attack-type-badge">{record.attack_type || 'Unknown'}</span>
								{:else}
									-
								{/if}
							</td>
							<td>
                  <span class="badge {getBadgeClass(percentage)}">
                    {getStatusText(percentage)}
                  </span>
							</td>
							<td>
								<button class="btn btn-sm btn-outline-primary" on:click={() => viewDetectionDetails(record.capture_id)}>
									View Details
								</button>
							</td>
						</tr>
					{/each}
					</tbody>
				</table>
			</div>

			<div class="d-flex justify-content-between align-items-center mt-3">
				<div>
					<small class="text-muted">Showing {historyData.length} records</small>
				</div>
				<div>
					<button class="btn btn-outline-secondary" on:click={() => { limit += 10; updateFilters(); }}>
						Load More
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>