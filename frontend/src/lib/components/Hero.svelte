<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let image_path = "/images/forbidden.png"; 

    const features = [
        {
            icon: "images/hero_icon_1.png",
            title: "Powerful DDoS Defense",
            description: "We detect and mitigate threats in real-time, preventing downtime and ensuring your software stays online."
        },
        {
            icon: "images/hero_icon_2.png",
            title: "Scalable Security",
            description: "DiddySec provides superior DDoS protection. Your software remains secure and accessible without any downtime!"
        },
        {
            icon: "images/hero_icon_3.png",
            title: "24/7 Expert Support",
            description: "Our team provides 24/7 threat response, security audits, and continuous optimization to protect your systems from evolving cyberthreats."
        }
    ];
</script>

<style>
    .hero-section {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 50px;
        margin-top: 40px;
    }

    .hero-content h1 {
        font-weight: 700;
        font-size: 3rem;
    }

    .hero-content p {
        font-size: 1.1rem;
        color: #555;
    }

    .hero-content {
        font-family: "Space Grotesk", sans-serif;
    }
    
    .btn-secure {
        border: 2px solid black;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 1.2rem;
        background-color: white;
        color: black;
        transition: all 0.3s ease;
    }

    .btn-secure:hover {
        background-color: #c81e1e;
        color: white;
        border-color: #c81e1e;
    }

    .hero-image {
        text-align: center;
    }

    .hero-image img {
        max-width: 100%;
        height: auto;
    }

    .feature-section {
        padding: 50px 0;
    }

    .feature-card {
        border: 2px solid black;
        border-radius: 10px;
        padding: 20px;
        text-align: left;
        background: white;
        box-shadow: 0 5px 0px black;
        transition: all 0.3s ease-in-out;
        font-family: "DM Sans", sans-serif;
    }

    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 0px black, 0 5px 15px rgba(0, 0, 0, 0.15);
    }

    .card-padding {
        padding-left: 3rem;   /* px-5 → 3rem (Bootstrap scale) */
        padding-right: 3rem;  /* px-5 → 3rem */
        padding-top: 2rem;  /* pt-4 → 1.5rem */
        padding-bottom: 2rem; /* pb-1 → 0.25rem */
    }

    /* Responsive adjustments */
    @media (max-width: 992px) {
        .hero-section {
            text-align: center;
            margin-top: 140px;
        }
        .hero-image {
            margin-top: 30px;
        }
    }
</style>

<section class="container-sm hero-section py-0 mb-4" id="hero">
    <div class="row align-items-center">
        <!-- Left Content -->
        <div class="col-lg-6 hero-content pe-5">
            <h1>Cyber Threats Never Rest, <br /> Neither Do We</h1>
            <p>
                Our cybersecurity solutions protect businesses from DDoS attacks and online threats through advanced
                mitigation, traffic monitoring, traffic filtering, and robust network security.
            </p>
            <a href="/login" class="btn-link" on:click={() => goto('/login')}><button class="btn btn-secure mt-3">Secure Your Network</button></a>
        </div>

        <!-- Right Image -->
        <div class="col-lg-6 hero-image">
            <img src={image_path} alt="Forbidden 404" />
        </div>
    </div>
</section>

<section class="container feature-section pt-0">
    <div class="row g-4">
        {#each features as feature}
            <div class="col-md-4">
                <div class="feature-card d-flex flex-column h-100 card-padding">
                    <div class="d-flex align-items-center pb-3">
                        <img src={feature.icon} alt="Feature Icon" height="30px">
                        <h5 class="ps-2 m-0"><b>{feature.title}</b></h5>
                    </div>
                    <p class="flex-grow-1 mb-0">{feature.description}</p>
                </div>
            </div>
        {/each}
    </div>
</section>
