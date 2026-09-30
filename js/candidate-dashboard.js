// =====================================================
// CANDIDATE DASHBOARD
// =====================================================

import {
    getApplicationsByUser,
    getJobs
} from "./service/api.js";
// Check whether the user is logged in
const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser")
);

if (!loggedInUser) {
    window.location.href = "login.html";
}

// =====================================================
// DOM ELEMENTS
// =====================================================

const welcomeUser =
    document.getElementById("welcomeUser");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileAvatar =
    document.getElementById("profileAvatar");

const totalApplications =
    document.getElementById("totalApplications");

const reviewApplications =
    document.getElementById("reviewApplications");

const shortlistedApplications =
    document.getElementById(
        "shortlistedApplications"
    );

const selectedApplications =
    document.getElementById(
        "selectedApplications"
    );

const applicationsContainer =
    document.getElementById(
        "applicationsContainer"
    );

const logoutBtn =
    document.getElementById("logoutBtn");

const browseJobsBtn =
    document.getElementById(
        "browseJobsBtn"
    );


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

async function initializeDashboard() {

    const user =
        getLoggedInUser();


    // No logged-in user

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    // Only candidates

    if (user.role !== "candidate") {

        window.location.href =
            "recruiter-dashboard.html";

        return;

    }


    displayUserProfile(user);


    await loadApplications(user.id);

}


// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getLoggedInUser() {

    const localUser =
        localStorage.getItem(
            "loggedInUser"
        );

    const sessionUser =
        sessionStorage.getItem(
            "loggedInUser"
        );


    const userData =
        localUser || sessionUser;


    if (!userData) {

        return null;

    }


    try {

        return JSON.parse(userData);

    }

    catch (error) {

        console.error(
            "Invalid login data:",
            error
        );

        return null;

    }

}


// =====================================================
// DISPLAY USER PROFILE
// =====================================================

function displayUserProfile(user) {

    const name =
        user.name || "Candidate";


    profileName.textContent =
        name;


    profileEmail.textContent =
        user.email || "";


    welcomeUser.textContent =
        `Welcome, ${name} 👋`;


    profileAvatar.textContent =
        getInitials(name);

}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications(userId) {

    try {

        applicationsContainer.innerHTML = `

            <div class="dashboard-loading">

                Loading your applications...

            </div>

        `;


        const [
            applications,
            jobs
        ] = await Promise.all([

            getApplicationsByUser(userId),

            getJobs()

        ]);


        updateStatistics(
            applications
        );


        displayApplications(
            applications,
            jobs
        );

    }

    catch (error) {

        console.error(
            "Error loading applications:",
            error
        );


        applicationsContainer.innerHTML = `

            <div class="empty-applications">

                <div class="empty-applications-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load applications
                </h3>

                <p>
                    Please make sure JSON Server
                    is running and try again.
                </p>

            </div>

        `;

    }

}


// =====================================================
// UPDATE STATISTICS
// =====================================================

function updateStatistics(
    applications
) {

    const total =
        applications.length;


    const underReview =
        applications.filter(
            application =>
                application.status ===
                "Under Review"
        ).length;


    const shortlisted =
        applications.filter(
            application =>
                application.status ===
                "Shortlisted"
        ).length;


    const selected =
        applications.filter(
            application =>
                application.status ===
                "Selected"
        ).length;


    totalApplications.textContent =
        total;


    reviewApplications.textContent =
        underReview;


    shortlistedApplications.textContent =
        shortlisted;


    selectedApplications.textContent =
        selected;

}


// =====================================================
// DISPLAY APPLICATIONS
// =====================================================

function displayApplications(
    applications,
    jobs
) {

    if (
        !applications ||
        applications.length === 0
    ) {

        applicationsContainer.innerHTML = `

            <div class="empty-applications">

                <div class="empty-applications-icon">
                    📭
                </div>

                <h3>
                    No applications yet
                </h3>

                <p>
                    You haven't applied for any jobs.
                    Start exploring opportunities today.
                </p>

                <button
                    class="browse-jobs-btn"
                    id="emptyBrowseJobs">

                    Browse Jobs

                </button>

            </div>

        `;


        const emptyBrowseJobs =
            document.getElementById(
                "emptyBrowseJobs"
            );


        emptyBrowseJobs.addEventListener(
            "click",
            goToJobs
        );


        return;

    }


    // Sort newest application first

    const sortedApplications =
        [...applications].sort(
            (a, b) =>
                new Date(b.appliedDate) -
                new Date(a.appliedDate)
        );


    let tableHTML = `

        <div class="applications-table-wrapper">

            <table class="applications-table">

                <thead>

                    <tr>

                        <th>
                            Job
                        </th>

                        <th>
                            Company
                        </th>

                        <th>
                            Location
                        </th>

                        <th>
                            Applied On
                        </th>

                        <th>
                            Status
                        </th>

                    </tr>

                </thead>

                <tbody>

    `;


    sortedApplications.forEach(
        application => {

            const job =
                jobs.find(
                    item =>
                        String(item.id) ===
                        String(application.jobId)
                );


            if (!job) {
                return;
            }


            tableHTML += `

                <tr>

                    <td>

                        <span class="job-name">

                            ${escapeHTML(
                                job.title
                            )}

                        </span>

                    </td>


                    <td>

                        <span class="company-name">

                            ${escapeHTML(
                                job.company
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            job.location
                        )}

                    </td>


                    <td>

                        ${formatDate(
                            application.appliedDate
                        )}

                    </td>


                    <td>

                        ${createStatusBadge(
                            application.status
                        )}

                    </td>

                </tr>

            `;

        }
    );


    tableHTML += `

                </tbody>

            </table>

        </div>

    `;


    applicationsContainer.innerHTML =
        tableHTML;

}


// =====================================================
// STATUS BADGE
// =====================================================

function createStatusBadge(status) {

    const safeStatus =
        status || "Applied";


    let className =
        "status-applied";


    switch (safeStatus) {

        case "Under Review":

            className =
                "status-review";

            break;


        case "Shortlisted":

            className =
                "status-shortlisted";

            break;


        case "Interview":

            className =
                "status-interview";

            break;


        case "Selected":

            className =
                "status-selected";

            break;


        case "Rejected":

            className =
                "status-rejected";

            break;

    }


    return `

        <span
            class="status-badge ${className}">

            ${escapeHTML(safeStatus)}

        </span>

    `;

}


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "loggedInUser"
        );

        sessionStorage.removeItem(
            "loggedInUser"
        );


        window.location.href =
            "index.html";

    }
);


// =====================================================
// BROWSE JOBS
// =====================================================

browseJobsBtn.addEventListener(
    "click",
    goToJobs
);


function goToJobs() {

    window.location.href =
        "jobs.html";

}


// =====================================================
// GET INITIALS
// =====================================================

function getInitials(name) {

    if (!name) {

        return "U";

    }


    const words =
        name
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();

    }


    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(dateString) {

    if (!dateString) {

        return "-";

    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
        // Logou
}