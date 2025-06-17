<script>
    import { slide } from "svelte/transition";
    
    let activeStep = null;

    let steps = [
        { id: 1, title: "Risk Assessment & Proactive Protection", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 2, title: "Real-Time Monitoring & Threat Detection", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 3, title: "Advanced Mitigation & Scalable Defense", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 4, title: "Rapid Response & Continuous Optimization", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }
    ];

    function toggleStep(id) {
        activeStep = activeStep === id ? null : id;
    }

    function handleKeydown(event, id) {
        if (event.key === "Enter" || event.key === " ") {
            toggleStep(id);
        }
    }

    export let title = "Let’s Secure What Matters";
    export let description = "Contact us today to discover how DiddySec can protect your software from DDoS attacks and ensure uninterrupted online security.";
    export let buttonText = "Premium Security at the Right Price";
    export let imageUrl = "/images/pricing_icon.png";
</script>

<style>
    .process {
        font-family: "Space Grotesk", sans-serif;
    }

    .process-title {
        font-size: xx-large;
        font-weight: 500;
        background: #c81e1e;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        display: inline-block;
    }

    .process-box {
        border-radius: 35px;
        border: 2px solid black;
        padding: 30px;
        box-shadow: 0 5px 0px black;
        transition: all 0.3s ease-in-out;
        cursor: pointer;
        overflow: hidden;
        background-color: #f3f3f3;
        color: black;
    }

    .process-box.active {
        background-color: #c81e1e;
        color: white;
    }

    .process-box h3 {
        font-size: 1.8rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .process-box:hover {
        transform: translateY(-5px);
    }

    .process-number {
        font-size: 3rem;
        font-weight: bold;
        margin-right: 10px;
    }

    .toggle-icon {
        width: 40px;
        height: 40px;
        font-size: 1.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        color: black;
        border-radius: 50%;
        border: 1.5px solid black;
    }

    .security-section {
        background-color: #f3f3f3;
        border-radius: 30px;
        padding: 40px;
    }

    .security-title {
        font-size: 1.8rem;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .security-text {
        font-size: 1rem;
        color: #444;
        margin-bottom: 20px;
    }

    .security-button {
        border: 1.5px solid black;
        padding: 20px 40px;
        border-radius: 15px;
        font-weight: 400;
        background: white;
        transition: all 0.3s ease;
    }

    .security-button:hover {
        background: red;
        color: white;
    }

    .security-image {
        width: 100%;
        max-width: 400px;
    }

    @media (max-width: 768px) {
        .security-section {
            text-align: center;
        }
    }
</style>

<div class="container mt-5 py-4 process">
    <div class="d-flex align-items-center mb-4">
        <h2 class="process-title me-4">Our Working Process</h2>
        <p class="mt-2">Step-by-Step Guide to Securing Your Software from DDoS Attacks</p>
    </div>

    <div class="mt-4">
        {#each steps as step}
            <div 
                class="process-box {activeStep === step.id ? 'active' : ''} mb-3" 
                on:click={() => toggleStep(step.id)}
                on:keydown={(event) => handleKeydown(event, step.id)}
                tabindex="0"
                role="button"
                aria-expanded={activeStep === step.id}
            >
                <h3>
                    <span class="process-number">{step.id < 10 ? `0${step.id}` : step.id}</span>
                    {step.title}
                    <span class="toggle-icon">{activeStep === step.id ? "-" : "+"}</span>
                </h3>
                {#if activeStep === step.id}
                    <div class="collapse-content" transition:slide>
                        <hr>
                        <p>{step.content}</p>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>


<div class="container my-5 pb-4" id="pricing">
    <div class="security-section d-flex flex-column flex-lg-row align-items-center justify-content-between">
        <!-- Text Content -->
        <div class="text-content pe-5">
            <h2 class="security-title">{title}</h2>
            <p class="security-text">{description}</p>
            <button class="security-button">{buttonText}</button>
        </div>

        <div class="mt-4 mt-lg-0 ms-5">
            <img src={imageUrl} alt="Security Illustration" class="security-image">
        </div>
    </div>
</div>