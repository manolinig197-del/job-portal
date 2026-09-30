// =====================================================
// RECRUITER DASHBOARD
// =====================================================

import {
    getJobs,
    getApplications,
    getUsers,
    deleteJob
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

const recruiterWelcome =
    document.getElementById("recruiterWelcome");

const recruiterName =
    document.getElementById("recruiterName");

const recruiterEmail =
    document.getElementById("recruiterEmail");

const recruiterAvatar =
    document.getElementById("recruiterAvatar");

const totalPostedJobs =
    document.getElementById("totalPostedJobs");

const totalApplicants =
    document.getElementById("totalApplicants");

const totalShortlisted =
    document.getElementById("totalShortlisted");

const totalSelected =
    document.getElementById("totalSelected");

const recruiterJobsCount =
    document.getElementById("recruiterJobsCount");

const recruiterJobsContainer =
    document.getElementById(
        "recruiterJobsContainer"
    );

const postNewJobBtn =
    document.getElementById(
        "postNewJobBtn"
    );

const logoutBtn =
    document.getElementById(
        "recruiterLogoutBtn"
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

    const recruiter =
        getLoggedInUser();


    // User is not logged in

    if (!recruiter) {

        window.location.href =
            "login.html";

        return;

    }


    // Only recruiters can access this page

    if (recruiter.role !== "recruiter") {

        window.location.href =
            "candidate-dashboard.html";

        return;

    }


    displayRecruiterProfile(
        recruiter
    );


    await loadRecruiterData(
        recruiter
    );

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

        return JSON.parse(
            userData
        );

    }

    catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        return null;

    }

}


// =====================================================
// DISPLAY PROFILE
// =====================================================

function displayRecruiterProfile(
    recruiter
) {

    const name =
        recruiter.name ||
        "Recruiter";


    recruiterName.textContent =
        name;


    recruiterEmail.textContent =
        recruiter.email || "";


    recruiterWelcome.textContent =
        `Welcome, ${name} 👋`;


    recruiterAvatar.textContent =
        getInitials(name);

}


// =====================================================
// LOAD RECRUITER DATA
// =====================================================

async function loadRecruiterData(
    recruiter
) {

    try {

        recruiterJobsContainer.innerHTML = `

            <div class="recruiter-loading">

                Loading your job postings...

            </div>

        `;


        const [
            jobs,
            applications,
            users
        ] = await Promise.all([

            getJobs(),

            getApplications(),

            getUsers()

        ]);


        /*
         * Existing jobs in db.json may not yet have
         * recruiterId.
         *
         * For this college project, we display:
         * 1. Jobs belonging to this recruiter
         * 2. Existing jobs that have no recruiterId
         *
         * Once jobs are posted through the recruiter
         * dashboard, they will contain recruiterId.
         */

        const recruiterJobs =
            jobs.filter(job => {

                if (!job.recruiterId) {

                    return true;

                }

                return String(
                    job.recruiterId
                ) === String(
                    recruiter.id
                );

            });


        displayStatistics(
            recruiterJobs,
            applications
        );


        displayJobs(
            recruiterJobs,
            applications
        );


    }

    catch (error) {

        console.error(
            "Error loading recruiter data:",
            error
        );


        recruiterJobsContainer.innerHTML = `

            <div class="recruiter-empty">

                <div class="recruiter-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load dashboard
                </h3>

                <p>
                    Make sure JSON Server is running
                    and try again.
                </p>

            </div>

        `;

    }

}


// =====================================================
// STATISTICS
// =====================================================

function displayStatistics(
    jobs,
    applications
) {

    totalPostedJobs.textContent =
        jobs.length;


    /*
     * Applications belonging to the recruiter's jobs
     */

    const jobIds =
        jobs.map(
            job => String(job.id)
        );


    const recruiterApplications =
        applications.filter(
            application =>
                jobIds.includes(
                    String(application.jobId)
                )
        );


    totalApplicants.textContent =
        recruiterApplications.length;


    totalShortlisted.textContent =
        recruiterApplications.filter(
            application =>
                application.status ===
                "Shortlisted"
        ).length;


    totalSelected.textContent =
        recruiterApplications.filter(
            application =>
                application.status ===
                "Selected"
        ).length;

}


// =====================================================
// DISPLAY JOBS
// =====================================================

function displayJobs(
    jobs,
    applications
) {

    recruiterJobsCount.textContent =
        `${jobs.length} ${
            jobs.length === 1
                ? "job"
                : "jobs"
        }`;


    if (jobs.length === 0) {

        recruiterJobsContainer.innerHTML = `

            <div class="recruiter-empty">

                <div class="recruiter-empty-icon">
                    💼
                </div>

                <h3>
                    No job postings yet
                </h3>

                <p>
                    Post your first job and start
                    receiving applications.
                </p>

                <button
                    class="post-job-btn"
                    id="emptyPostJobBtn">

                    + Post New Job

                </button>

            </div>

        `;


        document
            .getElementById(
                "emptyPostJobBtn"
            )
            .addEventListener(
                "click",
                goToPostJob
            );


        return;

    }


    /*
     * Latest jobs first
     */

    const sortedJobs =
        [...jobs].sort(
            (a, b) =>
                new Date(b.postedDate) -
                new Date(a.postedDate)
        );


    recruiterJobsContainer.innerHTML = "";


    sortedJobs.forEach(job => {

        const applicationCount =
            applications.filter(
                application =>
                    String(
                        application.jobId
                    ) === String(job.id)
            ).length;


        const card =
            createJobCard(
                job,
                applicationCount
            );


        recruiterJobsContainer
            .appendChild(card);

    });

}


// =====================================================
// CREATE JOB CARD
// =====================================================

function createJobCard(
    job,
    applicationCount
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "recruiter-job-card";


    const skills =
        Array.isArray(job.skills)
            ? job.skills
            : [];


    const skillText =
        skills
            .slice(0, 3)
            .map(
                skill =>
                    escapeHTML(skill)
            )
            .join(" • ");


    card.innerHTML = `

        <div class="recruiter-job-main">

            <h3>
                ${escapeHTML(
                    job.title
                )}
            </h3>

            <p class="recruiter-job-company">

                ${escapeHTML(
                    job.company
                )}

            </p>


            <div class="recruiter-job-meta">

                <span>
                    📍 ${escapeHTML(
                        job.location
                    )}
                </span>

                <span>
                    💰 ${escapeHTML(
                        job.salary
                    )}
                </span>

                <span>
                    💼 ${escapeHTML(
                        job.experience
                    )}
                </span>

                <span>
                    👥 ${applicationCount}
                    ${
                        applicationCount === 1
                            ? "Applicant"
                            : "Applicants"
                    }
                </span>

                ${
                    skillText
                        ? `
                            <span>
                                🛠️ ${skillText}
                            </span>
                        `
                        : ""
                }

            </div>

        </div>


        <div class="recruiter-job-actions">

            <button
                class="job-action-btn applicants-btn"
                data-action="applicants">

                Applicants

            </button>


            <button
                class="job-action-btn edit-job-btn"
                data-action="edit">

                Edit

            </button>


            <button
                class="job-action-btn delete-job-btn"
                data-action="delete">

                Delete

            </button>

        </div>

    `;


    // Applicants

    card
        .querySelector(
            '[data-action="applicants"]'
        )
        .addEventListener(
            "click",
            () => {

                sessionStorage.setItem(
                    "selectedJobId",
                    job.id
                );


                window.location.href =
                    "applicants.html";

            }
        );


    // Edit

    card
        .querySelector(
            '[data-action="edit"]'
        )
        .addEventListener(
            "click",
            () => {

                sessionStorage.setItem(
                    "editJobId",
                    job.id
                );


                window.location.href =
                    "post-job.html";

            }
        );


    // Delete

    card
        .querySelector(
            '[data-action="delete"]'
        )
        .addEventListener(
            "click",
            () => deleteJobPost(
                job
            )
        );


    return card;

}


// =====================================================
// DELETE JOB
// =====================================================

async function deleteJobPost(job) {

    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${job.title}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await deleteJob(
            job.id
        );


        alert(
            "Job deleted successfully."
        );


        window.location.reload();

    }

    catch (error) {

        console.error(
            "Error deleting job:",
            error
        );


        alert(
            "Unable to delete the job. Please try again."
        );

    }

}


// =====================================================
// POST NEW JOB
// =====================================================

postNewJobBtn.addEventListener(
    "click",
    goToPostJob
);


function goToPostJob() {

    sessionStorage.removeItem(
        "editJobId"
    );


    window.location.href =
        "post-job.html";

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

        sessionStorage.removeItem(
            "editJobId"
        );

        sessionStorage.removeItem(
            "selectedJobId"
        );


        window.location.href =
            "index.html";

    }
);


// =====================================================
// INITIALS
// =====================================================

function getInitials(name) {

    if (!name) {

        return "R";

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
        .replace(
            /&/g,
            "&amp;"
        )
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
        // Logout
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }

}