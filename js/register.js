import { getUsers, createUser } from "./service/api.js";

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get form values
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const terms = document.getElementById("terms").checked;

    const selectedRole =
        document.querySelector('input[name="role"]:checked');


    // Clear previous message
    registerMessage.textContent = "";
    registerMessage.style.color = "";


    // ================= VALIDATION =================

    if (!name) {
        showMessage("Please enter your full name.", "red");
        return;
    }

    if (!email) {
        showMessage("Please enter your email address.", "red");
        return;
    }

    if (!email.includes("@")) {
        showMessage("Please enter a valid email address.", "red");
        return;
    }

    if (!password) {
        showMessage("Please enter a password.", "red");
        return;
    }

    if (password.length < 6) {
        showMessage(
            "Password must contain at least 6 characters.",
            "red"
        );
        return;
    }

    if (!confirmPassword) {
        showMessage(
            "Please confirm your password.",
            "red"
        );
        return;
    }

    if (password !== confirmPassword) {
        showMessage(
            "Passwords do not match.",
            "red"
        );
        return;
    }

    if (!selectedRole) {
        showMessage(
            "Please select Candidate or Recruiter.",
            "red"
        );
        return;
    }

    if (!terms) {
        showMessage(
            "Please accept the terms and conditions.",
            "red"
        );
        return;
    }


    // ================= CREATE USER =================

    try {

        registerButton.disabled = true;
        registerButton.textContent = "Creating Account...";

        registerMessage.textContent = "Creating your account...";
        registerMessage.style.color = "#2563eb";


        // Get existing users
        const users = await getUsers();


        // Check duplicate email
        const existingUser = users.find(
            user =>
                user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {

            showMessage(
                "An account with this email already exists.",
                "red"
            );

            registerButton.disabled = false;
            registerButton.textContent = "Create Account";

            return;
        }


        // Create new user
        const newUser = {

            name: name,

            email: email,

            password: password,

            role: selectedRole.value

        };


        await createUser(newUser);


        // Success
        registerMessage.textContent =
            "Account created successfully! Redirecting to login...";

        registerMessage.style.color = "#16a34a";


        // Redirect after 1.5 seconds
        setTimeout(function () {

            window.location.href = "login.html";

        }, 1500);


    } catch (error) {

        console.error("Registration error:", error);

        registerMessage.textContent =
            "Unable to create account. Make sure JSON Server is running.";

        registerMessage.style.color = "#dc2626";

        registerButton.disabled = false;

        registerButton.textContent = "Create Account";

    }

});


// ================= MESSAGE FUNCTION =================

function showMessage(message, color) {

    registerMessage.textContent = message;

    registerMessage.style.color = color;

}