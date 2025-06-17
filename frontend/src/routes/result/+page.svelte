<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getApiBase, getApiKey } from '$lib/config';

  // Chart references
  let chartCanvas;
  let typeCanvas;
  let attackTimeCanvas;
  let pieChart;
  let barChart;
  let timeChart;

  // Extract passed state from navigation
  let data;
  $: data = $page?.state;

  // Determine which API was used
  let apiType = 'csv';
  $: apiType = $page?.state?.apiType || 'csv';

  // Default values
  let normalCount = 0;
  let intrusionCount = 0;
  let totalConnections = 0;
  let ddosPercentage = 0;
  let normalPercentage = 0;
  let attackType = "Unknown";
  let isDanger = false;
  let analysisSummary = "";
  let recommendationText = "";
  let alertLevel = "Low";
  let alertClass = "alert-success";
  let analysisTime = new Date().toLocaleString();

  let captureId = null;
  let loading = true;
  let error = null;
  let results = null;

  // Fetch additional data if we only have capture_id
  async function fetchResultDetails(captureId) {
    try {
      const apiBase = getApiBase(apiType);
      const apiKey = getApiKey(apiType);

      const response = await fetch(`${apiBase}/status/${captureId}`, {
        headers: { 'X-API-Key': apiKey }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const resultData = await response.json();

      if (resultData.status === 'completed') {
        return {
          result_counts: resultData.result_counts,
          attack_type: resultData.attack_type || "Unknown"
        };
      } else {
        throw new Error(`Result not complete: ${resultData.status}`);
      }
    } catch (err) {
      console.error("Error fetching result details:", err);
      return null;
    }
  }

  onMount(async () => {
    // If no data, go back to dashboard
    if (!data) {
      goto('/dashboard');
      return;
    }

    // If we only have a capture_id, fetch the full details
    if (data.capture_id && !data.result_counts) {
      const details = await fetchResultDetails(data.capture_id);
      if (details) {
        data = { ...data, ...details };
      }
    }

    // Extract counts and attack type
    normalCount = data.result_counts?.Normal ?? 0;
    intrusionCount = data.result_counts?.Intrusion ?? 0;
    attackType = data.attack_type || "Unknown";
    totalConnections = normalCount + intrusionCount;

    // Calculate percentages
    normalPercentage = totalConnections > 0 ? Math.round((normalCount / totalConnections) * 100) : 0;
    ddosPercentage = totalConnections > 0 ? Math.round((intrusionCount / totalConnections) * 100) : 0;

    // Determine if under attack
    isDanger = ddosPercentage > 30;

    // Set alert level based on percentage of intrusions
    if (ddosPercentage > 60) {
      alertLevel = "Critical";
      alertClass = "alert-danger";
      analysisSummary = "Critical DDoS attack in progress";
      recommendationText = "Immediately activate your DDoS protection service, implement traffic filtering, and contact your security team.";
    } else if (ddosPercentage > 40) {
      alertLevel = "High";
      alertClass = "alert-danger";
      analysisSummary = "Significant DDoS activity detected";
      recommendationText = "Implement traffic filtering and monitor network closely. Consider activating DDoS protection.";
    } else if (ddosPercentage > 30) {
      alertLevel = "Medium";
      alertClass = "alert-warning";
      analysisSummary = "Potential DDoS activity detected ";
      recommendationText = "Monitor network traffic closely and prepare mitigation strategies.";
    } else if (ddosPercentage > 10) {
      alertLevel = "Low";
      alertClass = "alert-warning";
      analysisSummary = "Minor anomalous traffic detected";
      recommendationText = "Continue monitoring network traffic for changes in patterns.";
    } else {
      alertLevel = "Safe";
      alertClass = "alert-success";
      analysisSummary = "No DDoS activity detected";
      recommendationText = "Network traffic appears normal. Continue regular monitoring.";
    }

    // Set DDoS types for visualization based on attack type
    // In a real implementation, this would be more sophisticated
    const ddosTypes = getAttackTypeDistribution(attackType, intrusionCount);

    // Render traffic proportion pie chart
    const ctx = chartCanvas.getContext('2d');
    pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Normal Traffic', 'DDoS Traffic'],
        datasets: [{
          data: [normalCount, intrusionCount],
          backgroundColor: ['#36a2eb', '#e53935'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const percentage = totalConnections > 0 ? Math.round((value / totalConnections) * 100) : 0;
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Attack type breakdown bar chart
    const typeCtx = typeCanvas.getContext('2d');
    barChart = new Chart(typeCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(ddosTypes),
        datasets: [{
          label: 'Number of Connections',
          data: Object.values(ddosTypes),
          backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    // Mock time-based attack data
    const timeCtx = attackTimeCanvas.getContext('2d');
    const now = new Date();
    const timeLabels = [];
    const attackData = [];

    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30 min intervals
      timeLabels.push(time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));

      if (isDanger && i < 3) {
        attackData.push(Math.round(intrusionCount / 3 * (3 - i) * (Math.random() * 0.4 + 0.8)));
      } else if (isDanger) {
        attackData.push(Math.round(intrusionCount / 10 * Math.random()));
      } else {
        attackData.push(Math.round(Math.random() * 5));
      }
    }

    timeChart = new Chart(timeCtx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [{
          label: 'Suspicious Connections',
          data: attackData,
          borderColor: '#e53935',
          backgroundColor: 'rgba(229, 57, 53, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
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

    loading = false;
  });

  // Helper function to generate attack type distribution
  function getAttackTypeDistribution(attackType, totalIntrusions) {
    if (totalIntrusions === 0) {
      return {
        'SYN Flood': 0,
        'UDP Flood': 0,
        'HTTP Flood': 0,
        'ICMP Flood': 0
      };
    }

    // Default distribution
    const distribution = {
      'SYN Flood': Math.round(totalIntrusions * 0.2),
      'UDP Flood': Math.round(totalIntrusions * 0.2),
      'HTTP Flood': Math.round(totalIntrusions * 0.2),
      'ICMP Flood': Math.round(totalIntrusions * 0.2),
      'Mixed / Generic DDoS': Math.round(totalIntrusions * 0.2)
    };

    if (attackType && attackType !== "Unknown") {
      Object.keys(distribution).forEach(k => {
        distribution[k] = Math.round(totalIntrusions * 0.1);
      });

      if (distribution[attackType]) {
        distribution[attackType] = Math.round(totalIntrusions * 0.6);
      } else {
        distribution[attackType] = Math.round(totalIntrusions * 0.6);
      }
    }

    return distribution;
  }

  function goBack() {
    goto('/dashboard');
  }

  // Function to determine which API was used
  function getApiName(type) {
    return type === 'live' ? 'Real-time Detection API' : 'CSV Analysis API';
  }
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

  .overview-button {
    background-color: #ffe2e6;
    border-radius: 12px;
    padding: 15px 30px;
    font-weight: 600;
    text-align: center;
    box-shadow: 0 5px 0px black;
    border: 2px solid black;
    font-size: 1.2rem;
    transition: all 0.3s ease-in-out;
    color: black;
    margin-top: 10px;
    width: 100%;
  }

  .overview-button:hover {
    transform: translateY(-5px);
    background-color: #c81e1e;
    color: white;
  }

  .result-box {
    font-size: 1.3rem;
    font-weight: bold;
    padding: 15px;
    border-radius: 12px;
    text-align: center;
    margin-bottom: 15px;
  }

  .result-safe {
    background-color: #81C784;
    color: white;
    border: 2px solid black;
    box-shadow: 0 5px 0px black;
  }

  .result-danger {
    background-color: #e53935;
    color: white;
    border: 2px solid black;
    box-shadow: 0 5px 0px black;
  }

  .stats-value {
    font-size: 2rem;
    font-weight: bold;
  }

  .stats-label {
    font-size: 0.9rem;
    color: #666;
  }

  .alert-box {
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 15px;
    border: 1px solid transparent;
  }

  .data-tile {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    height: 100%;
  }

  .chart-container {
    position: relative;
    height: 250px;
  }

  .api-badge {
    display: inline-block;
    padding: 5px 10px;
    background-color: #f8f9fa;
    border-radius: 16px;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 10px;
  }

  .loading-overlay {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255,255,255,0.8);
    z-index: 1000;
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

{#if loading}
  <div class="loading-overlay">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p class="mt-3">Loading analysis results...</p>
  </div>
{/if}

<div class="container">
  <h2 class="mb-4 text-center">Network Traffic Analysis Result</h2>

  <!-- API Badge - Shows which API was used -->
  <div class="text-center">
    <div class="api-badge">
      <i class="bi bi-server"></i> Analyzed using {getApiName(apiType)}
    </div>
  </div>

  <!-- Alert Status -->
  <div class="row">
    <div class="col-12">
      <div class="card-box">
        <div class="result-box {isDanger ? 'result-danger' : 'result-safe'}">
          {#if isDanger}
            ⚠️ DDoS Attack Detected! ({intrusionCount} suspicious connections)
          {:else}
            ✅ Network is safe. No DDoS detected.
          {/if}
        </div>

        <div class="alert {alertClass}">
          <h4><strong>Alert Level: {alertLevel}</strong></h4>
          <p><strong>Analysis Summary:</strong> {analysisSummary}</p>
          <p><strong>Recommendation:</strong> {recommendationText}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Stats Summary Row -->
  <div class="row">
    <div class="col-md-3">
      <div class="card-box text-center">
        <div class="stats-value">{totalConnections.toLocaleString()}</div>
        <div class="stats-label">Total Connections</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card-box text-center">
        <div class="stats-value">{normalCount.toLocaleString()}</div>
        <div class="stats-label">Normal Traffic ({normalPercentage}%)</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card-box text-center">
        <div class="stats-value">{intrusionCount.toLocaleString()}</div>
        <div class="stats-label">DDoS Traffic ({ddosPercentage}%)</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card-box text-center">
        <div class="stats-value">{alertLevel}</div>
        <div class="stats-label">Threat Level</div>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="row">
    <!-- Traffic Proportion -->
    <div class="col-md-4">
      <div class="card-box">
        <h5 class="text-center mb-3">Traffic Distribution</h5>
        <div class="chart-container">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
      </div>
    </div>

    <!-- Attack Types Breakdown -->
    <div class="col-md-4">
      <div class="card-box">
        <h5 class="text-center mb-3">Attack Type Breakdown</h5>
        <div class="chart-container">
          <canvas bind:this={typeCanvas}></canvas>
        </div>
      </div>
    </div>

    <!-- Attack Timeline -->
    <div class="col-md-4">
      <div class="card-box">
        <h5 class="text-center mb-3">Activity Timeline (Last 6 Hours)</h5>
        <div class="chart-container">
          <canvas bind:this={attackTimeCanvas}></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Details Row -->
  <div class="row mt-3">
    <div class="col-md-6">
      <div class="card-box">
        <h5>Analysis Details</h5>
        <table class="table">
          <tbody>
          <tr>
            <td>Analysis Method</td>
            <td>{apiType === 'live' ? 'Real-time Network Capture' : 'CSV File Analysis'}</td>
          </tr>
          <tr>
            <td>Analysis Time</td>
            <td>{analysisTime}</td>
          </tr>
          <tr>
            <td>Total Traffic Analyzed</td>
            <td>{totalConnections.toLocaleString()} connections</td>
          </tr>
          <tr>
            <td>DDoS Proportion</td>
            <td>{ddosPercentage}% of total traffic</td>
          </tr>
          <tr>
            <td>Primary Attack Vector</td>
            <td>{attackType !== "Unknown" ? attackType : 'None'}</td>
          </tr>
          <tr>
            <td>Network Status</td>
            <td><span class={isDanger ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                {isDanger ? 'Under Attack' : 'Normal'}
              </span></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card-box">
        <h5>Mitigation Actions</h5>
        {#if isDanger}
          <ul class="list-group mb-3">
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Enable rate limiting
              <button class="btn btn-sm btn-primary">Apply</button>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Block suspicious IPs
              <button class="btn btn-sm btn-primary">Apply</button>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Activate DDoS protection
              <button class="btn btn-sm btn-primary">Apply</button>
            </li>
            <li class="list-group-item d-flex justify-content-between align-items-center">
              Alert security team
              <button class="btn btn-sm btn-primary">Send</button>
            </li>
          </ul>
        {:else}
          <p class="alert alert-success">No mitigation actions required at this time. The network appears to be operating normally.</p>
        {/if}

        <button class="overview-button" on:click={goBack}>
          Return to Dashboard
        </button>
      </div>
    </div>
  </div>
</div>
