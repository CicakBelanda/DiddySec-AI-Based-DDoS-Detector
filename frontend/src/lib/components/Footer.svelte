<script>
    const contactInfo = {
      email: "info@diddysec.com",
      phone: "+62 852-1743-68951",
      address: "Jl. Merdeka No. 123, Jakarta, Indonesia 10110"
    };
  
    const navLinks = [
      { text: "About us", href: "#" },
      { text: "Features", href: "#" },
      { text: "Testimonial", href: "#" },
      { text: "Pricing", href: "#" }
    ];
</script>
  
<style>
    .footer {
      background-color: #191a23;
      padding: 50px;
      border-radius: 40px 40px 0 0;
      margin: 0 auto;
      max-width: 1200px;
      font-family: "Space Grotesk", sans-serif;
      color: #ffffff;
      margin-bottom: 0px;
      padding-bottom: 0px;
    }
  
    .footer-logo img {
      width: 150px;
    }
  
    .footer-nav a {
      color: white;
      text-decoration: none;
      margin: 0 10px;
    }
  
    .footer-nav a:hover {
      text-decoration: underline;
    }
  
    .contact-btn {
      background-color: #c81e1e;
      color: white;
      border: none;
      border-radius: 10px;
      padding: 5px 15px;
    }
  
    .subscribe-box {
      background-color: #292a32;
      padding: 40px;
      border-radius: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
    }
  
    .subscribe-input {
      background-color: #191a23;
      border: 1px solid #666;
      color: white;
      border-radius: 20px;
      padding: 10px 20px;
      margin-right: 10px;
      outline: none;
      width: 250px;
    }
  
    .subscribe-btn {
      background-color: #c81e1e;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 10px 20px;
      transition: all 0.3s ease-in-out;
    }
    
    .subscribe-btn:hover {
      background-color: white;
      color: black;
    }
  
    @media (max-width: 480px) {
      .footer-logo img {
        width: 100px;
      }
      .subscribe-box {
        padding: 20px;
      }
    }
    
    @media (max-width: 768px) {
      .footer {
        margin-left: 20px;
        margin-right: 20px;
        padding: 30px;
        border-radius: 20px;
      }

      .footer-logo img {
        width: 120px;
      }

      .footer-nav {
        margin-top: 15px;
        text-align: center;
      }

      .footer-nav a {
        margin: 5px;
        display: block;
      }

      .footer-links {
        text-align: center;
        margin-bottom: 20px;
      }

      .subscribe-box {
        flex-direction: column;
        gap: 5px;
        padding: 20px;
        margin-top: 20px;
      }

      .subscribe-input {
        width: 100%;
        margin-right: 0;
      }

      .subscribe-btn {
        width: 100%;
      }

      .footer-bottom {
        padding-top: 10px;
      }
    }

    @media (max-width: 480px) {
      .footer-logo img {
        width: 100px;
      }

      .subscribe-box {
        padding: 15px;
      }

      .contact-btn {
        width: 100%;
        margin-bottom: 10px;
      }

      .footer-bottom p {
        font-size: 14px;
      }
    }
</style>
  
<footer class="footer text-center">
    <div class="container p-3">
      <div class="row">
        <div class="col-md-6 footer-logo text-start">
          <img src="images/logo_white.png" alt="DiddySec" />
        </div>
        <div class="col-md-6 footer-nav text-start">

          {#each navLinks as link}
            <a href={link.href}>{link.text}</a>
          {/each}
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-md-6 footer-links text-start">
          <button class="contact-btn">Contact us:</button>
          <p>Email: {contactInfo.email}</p>
          <p>Phone: {contactInfo.phone}</p>
          <p>{contactInfo.address}</p>
        </div>
        <div class="col-md-6 d-flex justify-content-center align-items-center">
          <div class="subscribe-box">
            <input type="email" placeholder="Email" class="subscribe-input" />
            <button class="subscribe-btn">Subscribe</button>
          </div>
        </div>
      </div>
      <hr>
      <div class="footer-bottom text-center mt-4">
        <p>© 2025 DiddySec. All Rights Reserved. <a href="#void" class="privacy-link">Privacy Policy</a></p>
      </div>
    </div>
</footer>
