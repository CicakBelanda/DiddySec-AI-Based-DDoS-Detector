<script>
    export let features = [
        { title: "Network Traffic Monitoring", img: "/images/feature_icon_1.png", bg: "feature-light", redTitle: true },
        { title: "DDoS Attack Detection", img: "/images/feature_icon_2.png", bg: "feature-red", redTitle: false },
        { title: "Threat Notification", img: "/images/feature_icon_3.png", bg: "feature-dark", redTitle: false },
        { title: "Mitigation Action", img: "/images/feature_icon_4.png", bg: "feature-light", redTitle: true },
        { title: "Protocol Setup", img: "/images/feature_icon_5.png", bg: "feature-light", redTitle: true },
        { title: "View History of DDoS Attack", img: "/images/feature_icon_6.png", bg: "feature-red", redTitle: false },
    ];
</script>

<style>
    :global(body) {
        font-family: "Space Grotesk", sans-serif;
    }

    .features-section {
        text-align: left;
        margin-top: 50px;
        font-family: "Space Grotesk", sans-serif;
    }

    .feature-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 20px;
        padding: 30px;
        font-size: 1.2rem;
        box-shadow: 0 5px 0px black;
        transition: all 0.3s ease-in-out;
    }

    .feature-box:hover {
        transform: translateY(-5px);
    }

    .feature-box img {
        height: 6rem;
    }

    /* Background color variations */
    .feature-light {
        background-color: #f8f9fa;
        border: 2px solid black;
    }

    .feature-dark {
        background-color: #121217;
        color: white;
        border: 2px solid black;
    }

    .feature-red {
        background-color: #c81e1e;
        color: white;
        border: 2px solid black;
    }

    .feature-title {
        display: inline-block;
        font-size: x-large;
        font-weight: 500;
        background: white;
        padding: 5px 10px;
        border-radius: 5px;
        color: black;
    }

    .feature-title.red {
        background: #c81e1e;
        color: white;
    }
</style>

<div class="container features-section pb-5" id="features">
    <div class="d-flex align-items-center mb-4">
        <h2 class="mb-3 feature-title red me-4" style="font-size: xx-large;">Features</h2>
        <p>At DiddySec, we provide a comprehensive suite of cybersecurity solutions to protect software from digital threats. Our services include:</p>
    </div>

    <div class="row g-3">
        {#each features as feature}
            <div class="col-md-6">
                <div class="feature-box {feature.bg}">
                    <span class="feature-title {feature.redTitle ? 'red' : ''}">{feature.title}</span>
                    <img src={feature.img} alt="Feature Icon">
                </div>
            </div>
        {/each}
    </div>
</div>
