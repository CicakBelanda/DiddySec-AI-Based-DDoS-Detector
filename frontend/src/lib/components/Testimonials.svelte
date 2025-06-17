<script>
    const testimonials = [
      {
        name: "Michael Tan",
        role: "NexaTech Solutions",
        image: "/images/testi_img_1.png",
        text: "DiddySec provides excellent DDoS protection. Our website remains secure and accessible without any downtime!"
      },
      {
        name: "Aisha Rahman",
        role: "Visionary Digital",
        image: "/images/testi_img_2.png",
        text: "Their real-time monitoring and advanced mitigation strategies keep our business safe from even the most complex cyber threats."
      },
      {
        name: "David Liu",
        role: "Innovatech Global",
        image: "/images/testi_img_3.png",
        text: "The scalable security solutions offered by DiddySec adapt to our growing needs, providing seamless protection."
      },
      {
        name: "Pragos",
        role: "Luminex Systems",
        image: "/images/testi_img_4.png",
        text: "Excellent customer support and top-tier cybersecurity services—DiddySec truly prioritizes online safety and performance!"
      }
    ];
</script>
  
<style>
    * {
      font-family: "Space Grotesk", sans-serif;
    }
  
    .testimonials-section {
      text-align: center;
      padding: 50px 20px;
    }
  
    .testimonials-title {
      display: inline-block;
      font-size: xx-large;
      font-weight: 500;
      background: white;
      padding: 5px 10px;
      border-radius: 5px;
      color: white;
      background-color: #c81e1e;
    }
  
    .testimonial-card {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 5px 0px black;
      transition: all 0.3s ease-in-out;
      border: 2px solid black;
      min-height: 500px;
    }
  
    .testimonial-card:hover {
      transform: translateY(-5px);
    }
  
    .testimonial-img {
      width: 170px;
      height: 170px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 15px;
      border: 3px solid #aaaaaa;
    }
  
    .testimonial-name {
      font-weight: bold;
      color: red;
      margin-top: 10px;
    }
  
    .testimonial-role {
      font-size: 0.9rem;
      color: #888;
    }
</style>
  
<div class="container testimonials-section" id="testimonials">
    <div class="d-flex align-items-center mb-4">
      <h2 class="testimonials-title me-4 mb-3">Testimonials</h2>
      <p>Hear from Our Satisfied Clients: Read Our Testimonials to Learn More about Our Digital Marketing Services</p>
    </div>
  
    <div class="row mt-4">
      {#each testimonials as t}
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="testimonial-card text-center p-4">
            <img src={t.image} alt={t.name} class="testimonial-img">
            <p>{t.text}</p>
            <p class="testimonial-name">{t.name}</p>
            <p class="testimonial-role">{t.role}</p>
          </div>
        </div>
      {/each}
    </div>
</div>
  