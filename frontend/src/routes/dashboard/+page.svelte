<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { getApiBase, getApiKey } from '$lib/config';
  import { getDetectionHistory, getStatistics } from '$lib/apiService';

  // State variables
  let isDetecting = false;
  let detectionError = null;
  let captureId = null;
  let fileInput;
  let loading = false;
  let error = null;
  let lastUpdated = "Never";
  let refreshInterval;
  let threatLevel = "Normal";
  let threatStatus = "secure";

  //status
  let statusInterval; // Add this line

  // API status state variables
  let apiStatus = {
    live: { online: true, lastResponse: null, responseTime: null, successRate: 100 },
    csv: { online: true, lastResponse: null, responseTime: null, successRate: 100 },
    lastChecked: "Never"
  };

  // Track API requests for history
  let apiRequests = [];

  // Dashboard data
  let loadingDashboard = true;
  let dashboardError = null;
  let detectionHistory = [];
  let dashboardStats = {
    total_detections: 0,
    critical_detections: 0,
    last_24h: {
      normal: 0,
      intrusion: 0
    },
    hosts: []
  };

  // Current status data
  let currentStatus = {
    normal_count: 0,
    intrusion_count: 0,
    attack_type: "None",
    percentage: 0
  };

  // Chart references
  let userChart;
  let deviceChart;
  let proportionChart;

  // Format timestamp for display in Jakarta timezone
  function formatTimestamp(isoString) {
    try {
      let timestamp = isoString;

      // If the timestamp doesn't have 'T' separator, add it
      if (timestamp.includes(' ') && !timestamp.includes('T')) {
        timestamp = timestamp.replace(' ', 'T');
      }

      // If it doesn't have timezone info, assume it's UTC
      if (!timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
        timestamp = timestamp + 'Z'; // Add UTC indicator
      }

      const date = new Date(timestamp);

      // Now convert to Jakarta time - shorter format for better alignment
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      console.error("Error formatting timestamp:", e, "Input:", isoString);
      return "Invalid date";
    }
  }

  // Calculate DDoS percentage
  function calculateDDoSPercentage(detection) {
    const total = detection.normal_count + detection.intrusion_count;
    if (total === 0) return 0;
    return Math.round((detection.intrusion_count / total) * 100);
  }

  // Get severity level based on percentage (Safe if below 20%)
  function getSeverityLevel(percentage) {
    if (percentage < 20) return { level: "Safe", class: "success" };
    if (percentage <= 30) return { level: "Low", class: "warning" };
    if (percentage <= 50) return { level: "Medium", class: "warning" };
    if (percentage <= 70) return { level: "High", class: "danger" };
    return { level: "Critical", class: "danger" };
  }

  // Auto-refresh data
  async function refreshData() {
    try {
      // Start loading
      if (!loadingDashboard) {
        loadingDashboard = true;
      }

      // 1. Fetch detection history
      const history = await getDetectionHistory(5);
      detectionHistory = history;

      // 2. Fetch statistics
      const stats = await getStatistics();
      dashboardStats = stats;

      // 3. Update current status based on most recent detection
      if (history && history.length > 0) {
        const latest = history[0];
        const totalConnections = latest.normal_count + latest.intrusion_count;
        const intrusionPercentage = Math.round((latest.intrusion_count / totalConnections) * 100) || 0;

        currentStatus = {
          normal_count: latest.normal_count,
          intrusion_count: latest.intrusion_count,
          attack_type: latest.attack_type || "None",
          percentage: intrusionPercentage
        };

        // Update threat level based on new 20% threshold
        if (intrusionPercentage >= 70) {
          threatLevel = "Critical";
          threatStatus = "critical";
        } else if (intrusionPercentage >= 50) {
          threatLevel = "High";
          threatStatus = "warning";
        } else if (intrusionPercentage >= 20) {
          threatLevel = "Low";
          threatStatus = "warning";
        } else {
          threatLevel = "Normal";
          threatStatus = "secure";
        }
      }

      // 4. Update charts with new data
      updateCharts();

      // 5. Update last refresh time
      lastUpdated = new Date().toLocaleTimeString();

    } catch (err) {
      console.error("Error refreshing data:", err);
      dashboardError = err.message;
    } finally {
      loadingDashboard = false;
    }
  }

  function toggleApiInfoModal() {
    const modal = new bootstrap.Modal(document.getElementById('apiInfoModal'));
    modal.show();
  }

  async function checkApiStatus() {
    try {
      apiStatus.lastChecked = new Date().toLocaleTimeString();

      // Check Live API status
      try {
        const liveResponse = await fetch(`${getApiBase('live')}/stats`, {
          headers: { 'X-API-Key': getApiKey('live') },
          signal: AbortSignal.timeout(5000)
        });

        apiStatus.live.online = liveResponse.ok;
        apiStatus.live.lastResponse = new Date().toLocaleTimeString();
      } catch (error) {
        apiStatus.live.online = false;
      }

      // Check CSV API status (similar code)
      // Force UI update
      apiStatus = { ...apiStatus };
    } catch (error) {
      console.error("API status check failed:", error);
    }
  }

  // Initialize and update charts
  function updateCharts() {
    // Prepare data for the user chart (monthly trends)
    const monthlyData = prepareMonthlyData();
    if (userChart) {
      userChart.data.datasets[0].data = monthlyData.thisYear;
      userChart.data.datasets[1].data = monthlyData.lastYear;
      userChart.update();
    }

    // Prepare data for attack type breakdown
    const attackTypesData = prepareAttackTypeData();
    if (deviceChart) {
      deviceChart.data.labels = attackTypesData.labels;
      deviceChart.data.datasets[0].data = attackTypesData.data;
      deviceChart.update();
    }

    // Update proportion chart
    if (proportionChart) {
      proportionChart.data.datasets[0].data = [
        dashboardStats.last_24h.normal || 462,
        dashboardStats.last_24h.intrusion || 96
      ];
      proportionChart.update();
    }
  }

  // Prepare data for charts
  function prepareMonthlyData() {
    // In a real implementation, you'd use actual data from your API
    // For now, we'll use mock data that somewhat reflects the current status
    const thisYear = [10, 12, 11, 20, 25, 18];
    const lastYear = [5, 15, 22, 15, 20, 22];

    // Adjust the last month based on current threat level
    if (threatStatus === 'critical') {
      thisYear[5] = 40; // Show a spike for critical threats
    } else if (threatStatus === 'warning') {
      thisYear[5] = 25; // Show a moderate increase for warnings
    }

    return { thisYear, lastYear };
  }

  function prepareAttackTypeData() {
    // Extract attack types from history or use defaults
    const attackTypes = {};

    detectionHistory.forEach(record => {
      if (record.intrusion_count > 0) {
        const type = record.attack_type || "Unknown";
        attackTypes[type] = (attackTypes[type] || 0) + record.intrusion_count;
      }
    });

    // If we have no types (or all zero), use default data
    if (Object.keys(attackTypes).length === 0) {
      return {
        labels: ['SYN Flood', 'UDP Flood', 'ICMP Flood', 'HTTP Flood', 'Mixed / Generic DDoS'],
        data: [35, 90, 60, 40, 25]
      };
    }

    return {
      labels: Object.keys(attackTypes),
      data: Object.values(attackTypes)
    };
  }

  onMount(async () => {
    // Initial data load
    await refreshData();
    await checkApiStatus();
    statusInterval = setInterval(checkApiStatus, 2 * 60 * 1000);

    // Set up regular refresh interval (every 60 seconds)
    refreshInterval = setInterval(refreshData, 60000);

    // Initialize charts
    const ctx1 = document.getElementById('userChart').getContext('2d');
    userChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'This year',
            data: [10, 12, 11, 20, 25, 18],
            borderColor: '#000',
            fill: false
          },
          {
            label: 'Last year',
            data: [5, 15, 22, 15, 20, 22],
            borderColor: '#ccc',
            borderDash: [5, 5],
            fill: false
          }
        ]
      },
      options: { responsive: true }
    });

    const ctx2 = document.getElementById('deviceChart').getContext('2d');
    deviceChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['SYN Flood', 'UDP Flood', 'ICMP Flood', 'HTTP Flood', 'Mixed / Generic DDoS'],
        datasets: [{
          label: 'DDoS Type',
          data: [35, 90, 60, 40, 25],
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0']
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

    const ctx3 = document.getElementById('proportionChart').getContext('2d');
    proportionChart = new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: ['Normal', 'DDoS'],
        datasets: [{
          data: [dashboardStats.last_24h.normal || 462, dashboardStats.last_24h.intrusion || 96],
          backgroundColor: ['#00b2ff', '#e53935']
        }]
      },
      options: {
        responsive: true
      }
    });

    // Update charts with real data
    updateCharts();
  });

  onDestroy(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    if (statusInterval) {
      clearInterval(statusInterval);
    }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    error = null;

    if (!fileInput.files.length) {
      return error = 'Please select a file.';
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file, file.name);

    loading = true;

    try {
      const modalElement = document.getElementById('uploadModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide();

      goto('/processing', {
        state: {
          filename: file.name,
          isCSVUpload: true
        }
      });

      const csvApiBase = getApiBase('csv');
      const csvApiKey = getApiKey('csv');

      const res = await fetch(`${csvApiBase}/predict_csv`, {
        method: 'POST',
        headers: {
          'X-API-Key': csvApiKey
        },
        body: formData
      });

      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail || res.statusText);
      }

      const data = await res.json();

      goto('/result', { state: data });

    } catch (err) {
      error = err.message;
      goto('/dashboard', { state: { error: err.message } });
    } finally {
      loading = false;
    }
  }

  async function handleDetect(e) {
    e.preventDefault();
    isDetecting = true;
    detectionError = null;

    try {
      const liveApiBase = getApiBase('live');
      const liveApiKey = getApiKey('live');

      // Get the current timestamp for the "Last Detected" text
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')}`;

      // Call the API directly - this is what triggers your Python script
      const res = await fetch(`${liveApiBase}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': liveApiKey
        },
        body: JSON.stringify({
          interface: 'eth0',  // This should match what's in your Python script
          duration: 30        // Duration in seconds for capture
        })
      });

      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail || res.statusText);
      }

      const data = await res.json();
      captureId = data.capture_id;

      // Save the timestamp to display
      localStorage.setItem('lastDetectionTime', formattedDate);

      // Navigate to processing page and pass the captureId
      goto('/processing', {
        state: {
          isLiveCapture: true,
          captureId: captureId,
          message: data.message,
          apiType: 'live' // Indicates which API to use for status checks
        }
      });

    } catch (err) {
      detectionError = err.message;
      isDetecting = false;
    }
  }

  function viewDetectionDetails(id) {
    goto('/result', {
      state: {
        capture_id: id,
        apiType: 'live'
      }
    });
  }

  // Get background color based on threat status
  function getStatusBackground(status) {
    switch(status) {
      case 'critical': return '#e53935';
      case 'warning': return '#ff9800';
      case 'secure':
      default: return '#81C784';
    }
  }
</script>

<style>
  canvas {
    max-height: 250px !important;
  }

  .api-info-panel {
    background-color: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 5px 0px black;
    border: 2px solid black;
    transition: all 0.3s ease-in-out;
    height: 100%;
    width: 100%;
    cursor: pointer;
  }

  .api-info-panel:hover {
    transform: translateY(-5px);
    background-color: #e9ecef;
  }

  .status-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .status-online {
    background-color: #4caf50;
    animation: pulse-green 2s infinite;
  }
  .status-offline { background-color: #f44336; }

  @keyframes pulse-green {
    0% {
      box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
    }
  }

  .status-box {
    background-color: #81C784;
    box-shadow: 0 5px 0px black;
    color: #ffffff;
    font-weight: 600;
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 15px;
    border: 2px solid black;
  }

  .overview-button {
    background-color: #ffe2e6;
    border-radius: 12px;
    padding: 20px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 5px 0px black;
    border: 2px solid black;
    font-size: 1.8rem;
    transition: all 0.3s ease-in-out;
    color: black;
    height: 100%;
    width: 100%;
  }

  .overview-button:hover {
    transform: translateY(-5px);
    background-color: #c81e1e;
    color: white;
  }

  .overview-button:disabled {
    opacity: 0.6;
    transform: none;
    cursor: not-allowed;
  }

  .card-box-right {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    padding-top: 0px;
    box-shadow: 0 5px 0px black;
    border: 2px solid black;
    margin-bottom: 20px;
  }

  .card-box {
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 5px 0px black;
    border: 2px solid black;
    margin-bottom: 20px;
  }

  .right-panel {
    max-height: 60vh;
    overflow-y: auto;
  }

  .list-unstyled li {
    margin-bottom: 12px;
    padding-left: 5px;
  }

  .footer {
    text-align: center;
    font-size: 0.9em;
    color: #999;
    padding: 20px 0;
  }

  .footer a {
    color: #888;
    text-decoration: none;
  }

  .sticky-title {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
    padding-top: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ccc;
  }

  .detection-item {
    transition: background-color 0.3s ease;
  }

  .detection-item:hover {
    background-color: #f8f9fa;
  }

  .refresh-btn {
    font-size: 0.8rem;
    padding: 0.2rem 0.5rem;
    background-color: transparent;
    border: 1px solid white;
    color: white;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .status-indicator {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }

  .status-safe {
    background-color: #4caf50;
  }

  .status-warning {
    background-color: #ff9800;
  }

  .status-danger {
    background-color: #f44336;
  }

  .live-badge {
    position: absolute;
    top: -10px;
    right: -10px;
    background-color: #f44336;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: bold;
    animation: pulse 1.5s infinite;
    z-index: 1;
    border: 2px solid white;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
    }
    70% {
      box-shadow: 0 0 0 5px rgba(244, 67, 54, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
    }
  }
</style>

<div>
  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 mb-3">
    <div class="container-fluid">
      <a class="navbar-brand" href="#void">
        <img src="/images/Logo.png" alt="DiddySec" height="50">
      </a>
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
          <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" width="24" height="24" class="me-2 rounded-circle" alt="User"> Profile
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
          <li><a class="dropdown-item" href="#void">View Profile</a></li>
          <li><a class="dropdown-item" href="#void">Settings</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="/" on:click={() => goto('/')}>Logout</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container-fluid p-4">
    <div class="row">
      <!-- Left Panel -->
      <div class="col-lg-9">
        <!-- Status + Overview in One Row -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="status-box h-100" style="background-color: {getStatusBackground(threatStatus)}; position: relative;">
              <span class="live-badge">LIVE</span>

              {#if threatStatus === 'secure'}
                <img src="/images/secured.png" alt="secure" width="100px">
              {:else if threatStatus === 'warning'}
                <img src="/images/secured.png" alt="secure" width="100px">
              {/if}
              <div>
                <h3 class="mb-0">
                  {#if threatStatus === 'secure'}
                    No threats detected
                  {:else if threatStatus === 'warning'}
                    Potential threats detected
                  {:else}
                    Critical threats detected!
                  {/if}
                </h3>
                <small>
                  {#if threatStatus === 'secure'}
                    Systems are operating normally
                  {:else}
                    {currentStatus.intrusion_count} suspicious connections detected
                  {/if}
                </small>
                <div class="mt-2 d-flex align-items-center">
                  <small>Last updated: {lastUpdated}</small>
                  <button class="refresh-btn ms-2" on:click={refreshData} disabled={loadingDashboard}>
                    {loadingDashboard ? 'Updating...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 d-flex justify-content-center align-items-center">
            <div class="api-info-panel h-100" on:click={toggleApiInfoModal}>
              <h3>API Status</h3>
              <div class="api-status-indicators">
                <div class="status-item">
                  <span class="status-dot" class:status-online={apiStatus.live.online} class:status-offline={!apiStatus.live.online}></span>
                  <span>Live Detection API</span>
                </div>
                <div class="status-item">
                  <span class="status-dot" class:status-online={apiStatus.csv.online} class:status-offline={!apiStatus.csv.online}></span>
                  <span>CSV Analysis API</span>
                </div>
              </div>
              <br>
              <p class="api-refresh-time">Last checked: {apiStatus.lastChecked}</p>
            </div>
          </div>
          <div class="col-md-3 d-flex justify-content-center align-items-center">
            <button class="overview-button" data-bs-toggle="modal" data-bs-target="#uploadModal">
              <h2>Upload<br>Files</h2>
            </button>
          </div>
        </div>

        <!-- Line Chart -->
        <div class="card-box mb-4">
          <h4><b>Network Threats last 6 Months</b></h4>
          <canvas id="userChart"></canvas>
        </div>

        <!-- Device and Location Charts -->
        <div class="row">
          <div class="col-md-6">
            <div class="card-box">
              <h4><b>Traffic Type last 6 Months</b></h4>
              <canvas id="deviceChart"></canvas>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card-box">
              <h4><b>Proportion of Traffic last 6 Months</b></h4>
              <canvas id="proportionChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Live Status Cards -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card-box text-center">
              <h5>Total Connections</h5>
              <h2>{(currentStatus.normal_count + currentStatus.intrusion_count).toLocaleString()}</h2>
              <small class="text-muted">Last update: {lastUpdated}</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card-box text-center">
              <h5>Normal Traffic</h5>
              <h2>{currentStatus.normal_count.toLocaleString()}</h2>
              <small class="text-muted">{100 - currentStatus.percentage}% of total</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card-box text-center">
              <h5>Suspicious Traffic</h5>
              <h2 class={currentStatus.intrusion_count > 0 ? "text-danger" : ""}>
                {currentStatus.intrusion_count.toLocaleString()}
              </h2>
              <small class="text-muted">{currentStatus.percentage}% of total</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card-box text-center">
              <h5>Attack Type</h5>
              <h2 style="font-size: 1.5rem;">{currentStatus.intrusion_count > 0 ? currentStatus.attack_type : "None"}</h2>
              <small class="text-muted">Threat Level: {threatLevel}</small>
            </div>
          </div>
        </div>

        <!-- Network Tools -->
        <div class="card-box">
          <h4><b>Network Monitoring Tools</b></h4>
          <p>Monitor your network directly using our local capture client:</p>
          <div class="d-grid gap-2">
            <a href="https://github.com/adxze/ClientSidePython/releases/tag/1.1.0" class="btn btn-primary text-white" target="_blank">
              <i class="bi bi-download"></i> Download Capture Client
            </a>
            <a href="https://github.com/adxze/ClientSidePython/blob/1.1.0/README.md" class="btn btn-outline-secondary" target="_blank">
              <i class="bi bi-file-earmark-text"></i> View Installation Guide
            </a>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="col-lg-3">
        <div class="card-box-right right-panel">
          <h4 class="sticky-title"><b>Live Network Status</b></h4>

          {#if loadingDashboard && !detectionHistory.length}
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">Loading status data...</p>
            </div>
          {:else}
            <div class="alert alert-{threatStatus === 'secure' ? 'success' : threatStatus === 'warning' ? 'warning' : 'danger'} mb-3">
              <strong>
                {#if threatStatus === 'secure'}
                  <i class="bi bi-shield-check"></i> Network Secure
                {:else if threatStatus === 'warning'}
                  <i class="bi bi-exclamation-triangle"></i> Potential Threats
                {:else}
                  <i class="bi bi-exclamation-triangle-fill"></i> Under Attack
                {/if}
              </strong>
              <div class="mt-2 small">
                {#if threatStatus === 'secure'}
                  All systems operational
                {:else}
                  {currentStatus.intrusion_count} suspicious connections detected
                {/if}
              </div>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <span><i class="bi bi-clock"></i> Last Updated</span>
                <span>{lastUpdated}</span>
              </div>
              <div class="d-flex justify-content-between mt-2">
                <span><i class="bi bi-shield"></i> Protection Status</span>
                <span>
                  <span class="status-indicator status-{threatStatus === 'secure' ? 'safe' : threatStatus === 'warning' ? 'warning' : 'danger'}"></span>
                  {threatLevel}
                </span>
              </div>
              <div class="d-flex justify-content-between mt-2">
                <span><i class="bi bi-bar-chart"></i> Total Intrusions (24h)</span>
                <span>{dashboardStats.last_24h.intrusion || 0}</span>
              </div>
            </div>

            <hr>

            <h5 class="mb-3"><i class="bi bi-activity"></i> Recent Activity</h5>
            <ul class="list-group">
              {#each dashboardStats.hosts.slice(0, 3) as host}
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-pc-display"></i> {host.hostname}
                  </div>
                  <span class="badge bg-primary rounded-pill">{host.count} detections</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <div class="card-box-right right-panel">
          <h4 class="sticky-title"><b>Detection History</b></h4>

          {#if detectionHistory.length === 0}
            <div class="text-center py-4">
              {#if loadingDashboard}
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading history data...</p>
              {:else}
                <i class="bi bi-hourglass text-muted" style="font-size: 2rem;"></i>
                <p class="mt-3 text-muted">No detection history yet</p>
              {/if}
            </div>
          {:else}
            <ul class="list-unstyled">
              {#each detectionHistory as detection, i}
                {@const ddosPercentage = calculateDDoSPercentage(detection)}
                {@const severity = getSeverityLevel(ddosPercentage)}
                <li class="detection-item mb-3 {ddosPercentage >= 20 ? 'border-start border-danger border-3 ps-2' : ''}">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong>{formatTimestamp(detection.timestamp)}</strong>
                    <span class="badge bg-{severity.class}">
                      {severity.level}
                    </span>
                  </div>
                  <div class="mt-1 small">
                    {#if ddosPercentage >= 20}
                      <span class="text-danger">
                        <i class="bi bi-exclamation-triangle-fill me-1"></i>
                        <strong>{ddosPercentage}% DDoS traffic detected</strong>
                      </span>
                      <div class="text-muted small">
                        {detection.intrusion_count.toLocaleString()} suspicious / {(detection.normal_count + detection.intrusion_count).toLocaleString()} total connections
                      </div>
                    {:else}
                      <span class="text-success">
                        <i class="bi bi-shield-check me-1"></i>
                        <strong>Safe - {ddosPercentage}% DDoS traffic</strong>
                      </span>
                      <div class="text-muted small">
                        {(detection.normal_count + detection.intrusion_count).toLocaleString()} connections analyzed
                      </div>
                    {/if}
                  </div>

                  <!-- Attack type display if there's an intrusion (but not Mixed/Generic DDoS) -->
                  {#if ddosPercentage > 0 && detection.attack_type && detection.attack_type !== "Unknown" && detection.attack_type !== "Mixed / Generic DDoS"}
                    <div class="mt-1">
                      <span class="badge bg-secondary small">
                        <i class="bi bi-bug"></i> {detection.attack_type}
                      </span>
                    </div>
                  {/if}

                  <div class="mt-1">
                    <button class="btn btn-sm btn-link p-0" on:click={() => viewDetectionDetails(detection.capture_id)}>
                      View details
                    </button>
                  </div>
                </li>
              {/each}
            </ul>

            <div class="text-center mt-3">
              <button class="btn btn-sm btn-outline-secondary" on:click={() => goto('/history')}>
                View Full History
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    &copy; 2025 DiddySec &mdash;
    <a href="#void">About</a> | <a href="#void">Support</a> | <a href="#void">Contact Us</a>
  </div>

  <!-- Modal Upload CSV -->
  <div class="modal fade" id="uploadModal" tabindex="-1" aria-labelledby="uploadModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content" style="border: 2px solid black; border-radius: 12px;">
        <div class="modal-header">
          <h5 class="modal-title" id="uploadModalLabel">Upload Network Traffic File</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form on:submit={handleSubmit}>
            <div class="mb-3">
              <label for="fileInput" class="form-label">Select PCAP or CSV file for analysis</label>
              <input bind:this={fileInput} type="file" class="form-control" id="fileInput" accept=".csv,.pcap,.pcapng" />
              <small class="text-muted">Supported formats: CSV with flow data, PCAP network captures</small>
            </div>
            <div class="d-grid">
              <button type="submit" class="btn btn-primary" disabled={loading}>
                {#if loading}
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                {:else}
                  Upload and Analyze
                {/if}
              </button>
            </div>
          </form>
          {#if error}
            <div class="alert alert-danger mt-3">{error}</div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="apiInfoModal" tabindex="-1" aria-labelledby="apiInfoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content" style="border: 2px solid black; border-radius: 12px;">
        <div class="modal-header">
          <h5 class="modal-title">DiddySec API Connection Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Modal content with API details -->
          <div class="row">
            <div class="col-md-6">
              <h4>Live Detection API</h4>
              <div class={apiStatus.live.online ? "text-success" : "text-danger"}>
                Status: {apiStatus.live.online ? "ONLINE" : "OFFLINE"}
              </div>
            </div>
            <div class="col-md-6">
              <h4>CSV Analysis API</h4>
              <div class={apiStatus.csv.online ? "text-success" : "text-danger"}>
                Status: {apiStatus.csv.online ? "ONLINE" : "OFFLINE"}
              </div>
            </div>
          </div>

          <button class="btn btn-primary mt-3" on:click={checkApiStatus}>
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  </div>
</div>