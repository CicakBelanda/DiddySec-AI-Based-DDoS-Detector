<script>
    import { goto } from "$app/navigation";

    let email = "";
    let password = "";
    let errorMessage = "";
    let isLoading = false;

    // Hardcoded authentication (no API call)
    const authenticateUser = async (email, password) => {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Hardcoded valid credentials
        const validCredentials = [
            { email: "admin@app.com", password: "admin123" },
            { email: "user@example.com", password: "password123" },
            { email: "test@test.com", password: "test" }
        ];

        // Check if credentials match
        const isValid = validCredentials.some(
          cred => cred.email === email && cred.password === password
        );

        return isValid;
    };

    const login = async (event) => {
        event.preventDefault();

        errorMessage = "";
        isLoading = true;

        try {
            const isAuthenticated = await authenticateUser(email, password);

            if (isAuthenticated) {
                // Store auth state
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('userEmail', email);
                goto('/dashboard');
            } else {
                errorMessage = "Invalid email or password. Please try again.";
            }
        } catch (error) {
            errorMessage = "Login failed. Please try again.";
        }

        isLoading = false;
    };
</script>

<style>
    .body-login {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f8f9fa;
        font-family: 'Space Grotesk', sans-serif;
    }
    .login-container {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        border: 2px solid black;
        box-shadow: 0 2px 0px black;
        width: 350px;
    }
    .login-btn {
        background-color: #d32f2f;
        border: none;
    }
    .login-btn:hover {
        background-color: #b71c1c;
    }
    .login-btn:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    .divider {
        display: flex;
        align-items: center;
        text-align: center;
    }
    .divider::before, .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #ddd;
    }
    .divider:not(:empty)::before {
        margin-right: .5em;
    }
    .divider:not(:empty)::after {
        margin-left: .5em;
    }
    .btn-login {
        background: white;
        box-shadow: 0 2px 0px black;
        transition: all 0.3s ease-in-out;
        border: 2px solid black;
        padding: 12px;
    }
    .btn-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 0px black;
        transition: all 0.3s ease-in-out;
        border: 2px solid black;
    }
    .error-message {
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        text-align: center;
    }
</style>

<section class="d-flex flex-row align-items-center body-login">
    <div class="m-3">
        <img src="/images/login_icon.png" alt="Login Icon" style="max-height: 550px;">
    </div>
    <div class="login-container">
        <h3 class="text-center">Welcome Back</h3>

        <div class="d-flex mt-4 justify-content-center">
            <button class="btn btn-login d-flex align-items-center justify-content-center mx-1">
                <img src="/images/google_icon.png" alt="Google Icon" style="max-height: 20px;" class="me-2"> Google
            </button>
            <button class="btn btn-login d-flex align-items-center justify-content-center mx-1">
                <img src="/images/github_icon.png" alt="GitHub Icon" style="max-height: 20px;" class="me-2"> Github
            </button>
        </div>
        <div class="divider my-3">Or</div>
        <form on:submit={login}>
            <div class="mb-3">
                <input
                  type="email"
                  class="form-control"
                  placeholder="Email"
                  required
                  bind:value={email}
                  disabled={isLoading}
                >
            </div>
            <div class="mb-3 position-relative">
                <input
                  type="password"
                  class="form-control"
                  placeholder="Password"
                  required
                  bind:value={password}
                  disabled={isLoading}
                >
            </div>
            <div class="text-end mb-3">
                <a href="#void" class="text-decoration-none">Forget Password?</a>
            </div>
            {#if errorMessage}
                <div class="error-message">{errorMessage}</div>
            {/if}
            <button
              type="submit"
              class="btn btn-danger w-100 login-btn"
              disabled={isLoading || !email || !password}
            >
                {#if isLoading}
                    Logging in...
                {:else}
                    Log In
                {/if}
            </button>
        </form>
        <p class="text-center mt-3">Don't have an account? <a href="/register" class="text-danger text-decoration-none" on:click={() => goto('/register')}>Sign Up</a></p>
    </div>
</section>