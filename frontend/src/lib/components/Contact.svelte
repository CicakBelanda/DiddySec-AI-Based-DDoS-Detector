<script>
    import { slide } from "svelte/transition";
    let contactOption = 'sayHi';

    function toggleAdditionalFields(option) {
        contactOption = option;
    }
</script>

<style>
    .contact-section {
        background-color: #f4f4f4;
        border-radius: 20px;
        padding: 40px;
        position: relative;
        display: flex;
        align-items: flex-start;
        justify-content: flex-start;
    }

    .contact-title {
        font-size: xx-large;
        font-weight: 500;
        color: white;
        background-color: #c81e1e;
        padding: 8px 20px;
        border-radius: 5px;
        display: inline-block;
    }

    .form-control, .btn {
        border-radius: 10px;
    }

    .icon-right {
        position: absolute;
        right: 0px;
        height: 400px;
    }

    .form-box {
        width: 700px;
    }

    .button-submit {
        background-color: black;
        color: white;
    }

    .button-submit:hover {
        background-color: #c81e1e;
        color: white;
    }

    @media (max-width: 1200px) {
        .icon-right {
            display: none;
        }
    }

    @media (max-width: 992px) {
        .form-box {
            width: 200%;
        }
    }

    @media (max-width: 768px) {
        .form-box {
            width: 100%;
        }
    }
</style>

<div class="container pb-5">
    <div class="d-flex align-items-center mb-4">
        <h2 class="contact-title mb-3 me-4">Contact Us</h2>
        <p>Connect with Us: Let's Discuss Your Digital Marketing Needs</p>
    </div>

    <div class="contact-section mx-auto ps-5">
        <div class="form-container ps-5" style="margin-right: 20px;">
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" bind:group={contactOption} value="sayHi" checked>
                <label class="form-check-label" for="shieldUp">Say Hi</label>
            </div>
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" bind:group={contactOption} value="shieldUp">
                <label class="form-check-label" for="shieldUp">Shield Up</label>
            </div>
            <form class="form-box mt-4">
                <div class="mb-3">
                    <label for="name" class="form-label">Name*</label>
                    <input type="text" class="form-control" id="name" placeholder="Name">
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email*</label>
                    <input type="email" class="form-control" id="email" placeholder="Email">
                </div>
                {#if contactOption === 'shieldUp'}
                    <div class="mb-3">
                        <label for="company" class="form-label">Company</label>
                        <input type="text" class="form-control" id="company" placeholder="Company">
                    </div>
                    <div class="mb-3">
                        <label for="website" class="form-label">Website URL*</label>
                        <input type="url" class="form-control" id="website" placeholder="Website URL">
                    </div>
                    <div class="mb-3">
                        <label for="threatConcerns" class="form-label">Threat Concerns*</label>
                        <textarea class="form-control" id="threatConcerns" rows="4" placeholder="Describe your threat concerns"></textarea>
                    </div>
                {/if}
                <div class="mb-3">
                    <label for="message" class="form-label">Message*</label>
                    <textarea class="form-control" id="message" rows="4" placeholder="Message"></textarea>
                </div>
                <button type="submit" class="btn button-submit w-100">Send Message</button>
            </form>
        </div>

        {#if contactOption === 'shieldUp'}
            <img src="images/contact_icon.png" alt="Contact Icon" class="icon-right" style="bottom: 25%;" transition:slide>
        {:else}
            <img src="images/contact_icon.png" alt="Contact Icon" class="icon-right" style="bottom: 5%;" transition:slide>
        {/if}
        
    </div>
</div>
