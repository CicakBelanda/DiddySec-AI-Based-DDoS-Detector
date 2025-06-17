<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
  
    let logo_path = "images/Logo.png";
  
    onMount(() => {
      // Activate Bootstrap ScrollSpy
      const scrollSpy = new bootstrap.ScrollSpy(document.body, {
        target: "#navbarScroll",
      });
    });
  </script>
  
  <style>
    .shield-up {
      border: 2px solid #191A23;
      border-radius: 0.55rem;
      font-size: 1.25rem;
      padding: 0.75rem 1.5rem;
      background-color: #ffffff;
      color: #000000;
      transition: background-color 0.6s, border-color 0.3s;
      cursor: pointer;
    }
  
    .shield-up:hover {
      background-color: #C81E1E;
      color: #ffffff;
      border: 2px solid #C81E1E;
    }
  
    .nav-item {
      font-family: "Space Grotesk", sans-serif;
      font-size: 1.25rem;
    }
  
    .navi {
      color: #000000;
      text-decoration: none;
    }
  
    .navi:hover {
      color: #C81E1E;
    }
  </style>
  
  <nav class="navbar navbar-expand-lg py-4 px-5 fixed-top bg-white" id="navbarScroll">
    <div class="container-fluid">
      <a class="navbar-brand" href="#void">
        <img src={logo_path} alt="DiddySec" height="50">
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
        <ul class="navbar-nav">
          <li class="nav-item px-4 d-flex align-items-center">
            <a class="nav-link navi" href="#hero">About us</a>
          </li>
          <li class="nav-item px-4 d-flex align-items-center">
            <a class="nav-link navi" href="#features">Features</a>
          </li>
          <li class="nav-item px-4 d-flex align-items-center">
            <a class="nav-link navi" href="#pricing">Pricing</a>
          </li>
          <li class="nav-item px-4 d-flex align-items-center">
            <a class="nav-link navi" href="#testimonials">Testimonial</a>
          </li>
          <li class="nav-item px-4 d-flex align-items-center">
            <a class="shield-up text-decoration-none" href="/login" on:click={() => goto('/login')}>Shield Up</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  