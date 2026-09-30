import { getUsers } from "./service/api.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get login values
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    // Clear previous message
    loginMessage.textContent = "";
    loginMessage.style.color = "";

    // Validation
    if (!email || !password) {
        loginMessage.textContent =
            "Please enter email and password.";
        loginMessage.style.color = "red";
        return;
    }

    try {

        loginMessage.textContent = "Logging in...";
        loginMessage.style.color = "#2563eb";

        // Get users from JSON Server
        const users = await getUsers();

        // Find matching user
        const user = users.find(
            user =>
                user.email.toLowerCase() === email.toLowerCase() &&
                user.password === password
        );

        // Invalid login
        if (!user) {
            loginMessage.textContent =
                "Invalid email or password.";
            loginMessage.style.color = "red";
            return;
        }

        // Save logged-in user
        const loggedInUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify(loggedInUser)
        );

        // Redirect based on role
        if (user.role === "recruiter") {

            window.location.href =
                "recruiter-dashboard.html";

        } else {

            window.location.href =
                "candidate-dashboard.html";

        }

    } catch (error) {

        console.error("Login error:", error);

        loginMessage.textContent =
            "Unable to login. Make sure JSON Server is running.";

        loginMessage.style.color = "red";
    }

});