import {
    getJobById,
    getApplicationsByJob,
    getUsers,
    updateApplication
} from "./service/api.js";


// ===============================
// VARIABLES
// ===============================

let currentJob = null;
let applications = [];
let users = [];


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    setupEvents();
    initializePage();

});


// ===============================
// SETUP EVENTS
// ===============================

function setupEvents() {

    const search =
        document.getElementById("applicantSearch");

    const filter =
        document.getElementById("statusFilter");

    const backButton =
        document.getElementById("backDashboardBtn");


    if (search) {

        search.addEventListener("input", () => {

            displayApplicants(
                getFilteredApplications()
            );

        });

    }


    if (filter) {

        filter.addEventListener("change", () => {

            displayApplicants(
                getFilteredApplications()
            );

        });

    }


    if (backButton) {

        backButton.addEventListener("click", () => {

            sessionStorage.removeItem("selectedJobId");

            window.location.href =
                "recruiter-dashboard.html";

        });

    }

}


// ===============================
// INITIALIZE
// ===============================

async function initializePage() {

    const container =
        document.getElementById("applicantsContainer");


    const loggedInUser =
        getLoggedInUser();


    if (!loggedInUser) {

        window.location.href = "login.html";

        return;

    }


    if (loggedInUser.role !== "recruiter") {

        window.location.href =
            "candidate-dashboard.html";

        return;

    }


    const jobId =
        sessionStorage.getItem("selectedJobId");


    if (!jobId) {

        showMessage(
            "No job selected."
        );

        return;

    }


    try {

        const [
            job,
            jobApplications,
            allUsers
        ] = await Promise.all([

            getJobById(jobId),

            getApplicationsByJob(jobId),

            getUsers()

        ]);


        currentJob = job;

        applications =
            jobApplications || [];

        users =
            allUsers || [];


        displayJob();


        displayApplicants(
            applications
        );


    } catch (error) {

        console.error(
            "Error loading applicants:",
            error
        );


        if (container) {

            container.innerHTML = `

                <div style="
                    text-align:center;
                    padding:40px;
                ">

                    <h3>
                        Unable to load applicants
                    </h3>

                    <p>
                        Please make sure JSON Server is running.
                    </p>

                </div>

            `;

        }

    }

}


// ===============================
// DISPLAY JOB
// ===============================

function displayJob() {

    const title =
        document.getElementById(
            "jobSummaryTitle"
        );

    const company =
        document.getElementById(
            "jobSummaryCompany"
        );

    const logo =
        document.getElementById(
            "jobSummaryLogo"
        );

    const count =
        document.getElementById(
            "applicantCount"
        );


    if (title) {

        title.textContent =
            currentJob.title;

    }


    if (company) {

        company.textContent =
            `${currentJob.company} • ${currentJob.location}`;

    }


    if (logo) {

        logo.textContent =
            currentJob.company
                ? currentJob.company
                    .charAt(0)
                    .toUpperCase()
                : "J";

    }


    if (count) {

        count.textContent =
            `${applications.length} ${
                applications.length === 1
                    ? "Applicant"
                    : "Applicants"
            }`;

    }

}


// ===============================
// DISPLAY APPLICANTS
// ===============================

function displayApplicants(list) {

    const container =
        document.getElementById(
            "applicantsContainer"
        );


    if (!container) {

        return;

    }


    if (!list.length) {

        container.innerHTML = `

            <div style="
                text-align:center;
                padding:50px;
            ">

                <h3>
                    No applicants found
                </h3>

                <p>
                    No candidates have applied for this job yet.
                </p>

            </div>

        `;

        return;

    }


    let html = `

        <div style="overflow-x:auto;">

            <table class="applicants-table">

                <thead>

                    <tr>

                        <th>Candidate</th>

                        <th>Resume</th>

                        <th>Applied On</th>

                        <th>Status</th>

                        <th>Change Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

    `;


    list.forEach(application => {

        const user =
            users.find(
                item =>
                    String(item.id) ===
                    String(application.userId)
            );


        if (!user) {

            return;

        }


        html += `

            <tr>

                <td>

                    <strong>
                        ${escapeHTML(user.name)}
                    </strong>

                    <br>

                    <small>
                        ${escapeHTML(user.email)}
                    </small>

                </td>


                <td>

                    📄 ${
                        escapeHTML(
                            application.resume ||
                            "Not provided"
                        )
                    }

                </td>


                <td>

                    ${formatDate(
                        application.appliedDate
                    )}

                </td>


                <td>

                    <span class="status-badge">

                        ${escapeHTML(
                            application.status
                        )}

                    </span>

                </td>


                <td>

                    <select
                        class="status-select"
                        data-id="${application.id}">

                        ${createOption(
                            "Applied",
                            application.status
                        )}

                        ${createOption(
                            "Under Review",
                            application.status
                        )}

                        ${createOption(
                            "Shortlisted",
                            application.status
                        )}

                        ${createOption(
                            "Interview",
                            application.status
                        )}

                        ${createOption(
                            "Selected",
                            application.status
                        )}

                        ${createOption(
                            "Rejected",
                            application.status
                        )}

                    </select>

                </td>


                <td>

                    <button
                        class="update-status-btn"
                        data-id="${application.id}">

                        Update

                    </button>

                </td>

            </tr>

        `;

    });


    html += `

                </tbody>

            </table>

        </div>

    `;


    container.innerHTML = html;


    attachUpdateButtons();

}


// ===============================
// CREATE OPTION
// ===============================

function createOption(
    value,
    current
) {

    return `

        <option
            value="${value}"
            ${value === current ? "selected" : ""}>

            ${value}

        </option>

    `;

}


// ===============================
// UPDATE BUTTONS
// ===============================

function attachUpdateButtons() {

    const buttons =
        document.querySelectorAll(
            ".update-status-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                const id =
                    button.dataset.id;


                const select =
                    document.querySelector(
                        `.status-select[data-id="${id}"]`
                    );


                const newStatus =
                    select.value;


                const application =
                    applications.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );


                if (!application) {

                    return;

                }


                try {

                    button.disabled = true;

                    button.textContent =
                        "Updating...";


                    await updateApplication(
                        id,
                        {
                            ...application,
                            status: newStatus
                        }
                    );


                    application.status =
                        newStatus;


                    button.textContent =
                        "Updated ✓";


                    setTimeout(() => {

                        displayApplicants(
                            getFilteredApplications()
                        );

                    }, 500);


                } catch (error) {

                    console.error(
                        "Update error:",
                        error
                    );


                    button.disabled = false;

                    button.textContent =
                        "Update";


                    alert(
                        "Could not update status."
                    );

                }

            }
        );

    });

}


// ===============================
// SEARCH + FILTER
// ===============================

function getFilteredApplications() {

    const searchElement =
        document.getElementById(
            "applicantSearch"
        );

    const filterElement =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        filterElement
            ? filterElement.value
            : "";


    return applications.filter(
        application => {

            const user =
                users.find(
                    item =>
                        String(item.id) ===
                        String(application.userId)
                );


            if (!user) {

                return false;

            }


            const matchesSearch =
                !search ||
                user.name
                    .toLowerCase()
                    .includes(search) ||
                user.email
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =
                !status ||
                application.status === status;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


// ===============================
// MESSAGE
// ===============================

function showMessage(message) {

    const container =
        document.getElementById(
            "applicantsContainer"
        );


    if (container) {

        container.innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
            ">

                <h3>
                    ${escapeHTML(message)}
                </h3>

            </div>

        `;

    }

}


// ===============================
// DATE
// ===============================

function formatDate(date) {

    if (!date) {

        return "-";

    }


    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ===============================
// GET LOGGED-IN USER
// ===============================

function getLoggedInUser() {

    const data =
        localStorage.getItem(
            "loggedInUser"
        ) ||
        sessionStorage.getItem(
            "loggedInUser"
        );


    if (!data) {

        return null;

    }


    try {

        return JSON.parse(data);

    } catch {

        return null;

    }

}