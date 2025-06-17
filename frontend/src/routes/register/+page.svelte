<script>
    import { goto } from "$app/navigation";

    let name = "";
    let email = "";
    let password = "";
    let confirmPassword = "";

    const register = () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        alert(`Registering user: ${name}, Email: ${email}`);
    };
</script>

<style>
    .body-register {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f8f9fa;
        font-family: 'Space Grotesk', sans-serif;
    }
    .register-container {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        border: 2px solid black;
        box-shadow: 0 2px 0px black;
        width: 350px;
    }
    .register-btn {
        background-color: #d32f2f;
        border: none;
    }
    .register-btn:hover {
        background-color: #b71c1c;
    }
</style>

<section class="d-flex flex-row align-items-center body-register">
    <div class="m-3">
        <img src="/images/login_icon.png" alt="Login Icon" style="max-height: 550px;">
    </div>
    <div class="register-container">
        <h3 class="text-center">Create Account</h3>
        <form on:submit|preventDefault={register}>
            <div class="mb-3">
                <input type="text" class="form-control" placeholder="Name" required bind:value={name}>
            </div>
            <div class="mb-3">
                <input type="email" class="form-control" placeholder="Email" required bind:value={email}>
            </div>
            <div class="mb-3">
                <input type="password" class="form-control" placeholder="Password" required bind:value={password}>
            </div>
            <div class="mb-3">
                <input type="password" class="form-control" placeholder="Confirm Password" required bind:value={confirmPassword}>
            </div>
            <button type="submit" class="btn btn-danger w-100 register-btn" on:click={() => goto('/dashboard')}>Sign Up</button>
        </form>
        <p class="text-center mt-3">Already have an account? <a href="/login" class="text-danger text-decoration-none" on:click={() => goto('/login')}>Log In</a></p>
    </div>
</section>
