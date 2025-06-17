<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getApiBase, getApiKey } from '$lib/config';

	// Processing state
	let isProcessing = true;
	let progressMessage = "Initializing...";
	let progressPercentage = 10;
	let errorMessage = null;

	// For live capture
	let isLiveCapture = false;
	let captureId = null;
	let intervalId = null;
	let apiType = 'csv';

	let filename = "";
	let isCSVUpload = false;

	$: {
		if ($page?.state) {
			if ($page.state.isLiveCapture) {
				isLiveCapture = true;
				captureId = $page.state.captureId;
				progressMessage = $page.state.message || "Capturing network traffic...";
				apiType = $page.state.apiType || 'live';
			} else if ($page.state.filename) {
				filename = $page.state.filename;
				progressMessage = `Processing ${filename}...`;
				isCSVUpload = $page.state.isCSVUpload || false;
				apiType = isCSVUpload ? 'csv' : 'live';
			}
		}
	}

	onMount(() => {
		progressPercentage = 15;

		const updateProgress = () => {
			if (progressPercentage < 90) {
				progressPercentage += Math.floor(Math.random() * 10) + 1;
				if (progressPercentage > 90) progressPercentage = 90;
			}
		};

		const progressInterval = setInterval(updateProgress, 800);

		if (isLiveCapture && captureId) {
			pollCaptureStatus();
		} else if (isCSVUpload) {
			setTimeout(() => {
				clearInterval(progressInterval);
			}, 5000);
		}

		return () => {
			clearInterval(progressInterval);
			if (intervalId) clearInterval(intervalId);
		};
	});

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	// Function to poll for status updates
	async function pollCaptureStatus() {
		if (!captureId) return;

		// Get the correct API base and key based on the type
		const apiBase = getApiBase(apiType);
		const apiKey = getApiKey(apiType);

		intervalId = setInterval(async () => {
			try {
				const response = await fetch(`${apiBase}/status/${captureId}`, {
					headers: {
						'X-API-Key': apiKey
					}
				});

				if (!response.ok) {
					throw new Error("Failed to get status update");
				}

				const data = await response.json();

				if (data.status === "completed") {
					clearInterval(intervalId);
					progressPercentage = 100;
					progressMessage = "Analysis complete! Redirecting to results...";

					data.apiType = apiType;

					setTimeout(() => {
						goto('/result', { state: data });
					}, 1000);
				}
				else if (data.status === "error") {
					// Error occurred
					clearInterval(intervalId);
					errorMessage = data.message || "An unknown error occurred";
					progressPercentage = 0;
				}
				else {
					progressMessage = data.message || "Analyzing network traffic...";
				}
			} catch (error) {
				console.error("Error polling for status:", error);
			}
		}, 2000);
	}

	function goBack() {
		if (intervalId) clearInterval(intervalId);
		goto('/dashboard');
	}
</script>

<style>
    .processing-container {
        min-height: 70vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .card-box {
        background-color: #fff;
        border-radius: 12px;
        padding: 30px;
        box-shadow: 0 5px 0px black;
        border: 2px solid black;
        margin-bottom: 30px;
        min-width: 500px;
        text-align: center;
    }

    .progress {
        height: 20px;
        margin: 20px 0;
        background-color: #f5f5f5;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
        border: 1px solid #ddd;
    }

    .progress-bar {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s ease;
    }

    .spinner {
        display: inline-block;
        width: 80px;
        height: 80px;
        margin: 20px auto;
        border: 8px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 8px solid #3498db;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .cancel-button {
        margin-top: 20px;
        padding: 8px 20px;
        background-color: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .cancel-button:hover {
        background-color: #e9ecef;
    }

    .error-message {
        color: #dc3545;
        margin-top: 20px;
        padding: 10px;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
    }

    .api-badge {
        display: inline-block;
        padding: 4px 8px;
        background-color: #f8f9fa;
        border-radius: 12px;
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 15px;
    }
</style>

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 mb-3">
	<div class="container-fluid">
		<a class="navbar-brand" href="#void">
			<img src="/images/Logo.png" alt="DiddySec" height="50">
		</a>
	</div>
</nav>

<div class="container processing-container">
	<div class="card-box">
		<h3 class="mb-4">
			{#if isLiveCapture}
				DDoS Detection in Progress
			{:else if isCSVUpload}
				Analyzing CSV File
			{:else}
				Analyzing Network Traffic
			{/if}
		</h3>

		<!-- API Badge -->
		<div class="api-badge">
			<i class="bi bi-server"></i>
			{apiType === 'live' ? 'Real-time Detection' : 'CSV Analysis'}
		</div>

		{#if !errorMessage}
			<p>{progressMessage}</p>

			<div class="progress">
				<div
					class="progress-bar bg-success"
					role="progressbar"
					style="width: {progressPercentage}%"
					aria-valuenow={progressPercentage}
					aria-valuemin="0"
					aria-valuemax="100">
					{progressPercentage}%
				</div>
			</div>

			<div class="spinner"></div>

			<p class="mt-4">
				{#if isLiveCapture}
					Analyzing your network traffic in real-time for potential threats...
				{:else if isCSVUpload}
					Analyzing {filename} for DDoS patterns...
				{:else}
					Processing your request...
				{/if}
			</p>

			<button class="cancel-button" on:click={goBack}>
				Cancel and Return to Dashboard
			</button>
		{:else}
			<div class="error-message">
				<strong>Error:</strong> {errorMessage}
			</div>

			<button class="btn btn-primary mt-3" on:click={goBack}>
				Return to Dashboard
			</button>
		{/if}
	</div>
</div>