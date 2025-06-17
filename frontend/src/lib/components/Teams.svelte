<script>
    const teamMembers = [
      {
        name: "Kevin Handoyo",
        role: "Front-End Developer",
        description: "Expert in front-end development with deep knowledge of HTML, CSS, JavaScript, and modern frameworks.",
        image: "images/team_1.png",
        linkedin: "https://www.linkedin.com/in/kevin-joseph-handoyo/"
      },
      {
        name: "Adiguna Ligawan",
        role: "Back-End Developer",
        description: "Expert in back-end development with strong proficiency in databases, APIs, and server-side technologies.",
        image: "images/team_2.png",
        linkedin: "https://www.linkedin.com/in/adiguna-sanjaya-ligawan-a417b1291/"
      },
      {
        name: "Ananda Putra",
        role: "UI/UX Designer",
        description: "Expert in UI/UX design with a deep understanding of user research, wireframing, prototyping, and interactive design.",
        image: "images/nigga.jpg",
        linkedin: "https://www.linkedin.com/in/anandasamudramahaputra/"
    }//,
    //   {
    //     name: "Kristian Pasaribu",
    //     role: "AI Engineer",
    //     description: "Expert in building intelligent systems with a strong foundation in machine learning and data analysis.",
    //     image: "https://placehold.co/300",
    //     linkedin: "#"
    //   },
    //   {
    //     name: "Ofellia Marvella",
    //     role: "AI Engineer",
    //     description: "Expert in building intelligent systems with a strong foundation in machine learning and data analysis.",
    //     image: "https://placehold.co/300",
    //     linkedin: "#"
    //   }
    ];
</script>
  
<style>
    .team-section {
        text-align: center;
        padding: 50px 20px;
    }

    .team-title {
        display: inline-block;
        font-size: xx-large;
        font-weight: 500;
        background: white;
        padding: 5px 15px;
        border-radius: 5px;
        color: white;
        background-color: #c81e1e;
        margin-bottom: 20px;
    }

    .team-description {
        margin-bottom: 30px;
        color: #555;
    }

    .team-card {
        background: white;
        border-radius: 50px;
        padding: 30px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 5px 0px black;
        transition: all 0.3s ease-in-out;
        border: 2px solid black;
    }

    .team-card:hover {
        transform: translateY(-5px);
    }

    .team-img {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 15px;
        border: 3px solid #aaaaaa;
    }

    .team-name {
        font-weight: bold;
        margin-top: 10px;
        color: black;
        font-size: 1.25rem;
    }

    .team-role {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 10px;
    }

    .linkedin-icon {
        position: absolute;
        top: 20px;
        right: 30px;
        color: black;
        font-size: 1.5rem;
    }
</style>
  
<div class="container team-section">
    <div class="d-flex align-items-center mb-4">
        <h2 class="team-title me-4 mb-3">Team</h2>
        <p>Meet our expert team dedicated to delivering powerful and effective cybersecurity solutions.</p>
    </div>
  
    <div class="row justify-content-center">
        {#each teamMembers as member}
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="team-card text-center">
                    <a href={member.linkedin} target="_blank" class="linkedin-icon" aria-label=" "><i class="fab fa-linkedin"></i></a>
                    <img src={member.image} alt={member.name} class="team-img" />
                    <p class="team-name">{member.name}</p>
                    <p class="team-role">{member.role}</p>
                    <hr>
                    <p class="team-description">{member.description}</p>
                </div>
            </div>
        {/each}
    </div>
</div>
  