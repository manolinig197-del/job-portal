// =====================================================
// JOB DETAILS PAGE
// =====================================================

import {
    getJobs,
    getUsers,
    getApplications,
    createApplication
} from "./service/api.js";

import {
    handleError
} from "../exception/exception.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const loading =
    document.getElementById("detailsLoading");

const wrapper =
    document.getElementById("jobDetailsWrapper");

const errorSection =
    document.getElementById("detailsError");

const backJobsBtn =
    document.getElementById("backJobsBtn");

const errorBackBtn =
    document.getElementById("errorBackBtn");

const applyNowBtn =
    document.getElementById("applyNowBtn");

const loginMessage =
    document.getElementById("loginMessage");


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    loadJobDetails
);


// =====================================================
// LOAD JOB DETAILS
// =====================================================

async function loadJobDetails() {

    try {

        const jobId =
            sessionStorage.getItem(
                "selectedJobId"
            );


        // No job selected

        if (!jobId) {

            showJobError();

            return;

        }


        const jobs =
            await getJobs();


        const job =
            jobs.find(
                item =>
                    String(item.id) ===
                    String(jobId)
            );


        // Job not found

        if (!job) {

            showJobError();

            return;

        }


        displayJob(job);

    }

    catch (error) {

        console.error(
            "Error loading job:",
            error
        );

        handleError(error);

        showJobError();

    }

}


// =====================================================
// DISPLAY JOB
// =====================================================

function displayJob(job) {

    // Company logo

    document.getElementById(
        "companyLogo"
    ).textContent =
        getCompanyInitial(
            job.company
        );


    // Main information

    document.getElementById(
        "jobTitle"
    ).textContent =
        job.title || "Job Title";


    document.getElementById(
        "jobCompany"
    ).textContent =
        job.company || "Company";


    document.getElementById(
        "jobLocation"
    ).textContent =
        `📍 ${job.location || "Not specified"}`;


    document.getElementById(
        "jobExperience"
    ).textContent =
        `💼 ${job.experience || "Not specified"}`;


    document.getElementById(
        "jobSalary"
    ).textContent =
        `💰 ${job.salary || "Not specified"}`;


    // Description

    document.getElementById(
        "jobDescription"
    ).textContent =
        job.description ||
        "No description available.";


    // Skills

    displaySkills(job.skills);


    // Overview

    document.getElementById(
        "overviewCompany"
    ).textContent =
        job.company || "-";


    document.getElementById(
        "overviewLocation"
    ).textContent =
        job.location || "-";


    document.getElementById(
        "overviewExperience"
    ).textContent =
        job.experience || "-";


    document.getElementById(
        "overviewSalary"
    ).textContent =
        job.salary || "-";


    document.getElementById(
        "overviewDate"
    ).textContent =
        formatDate(job.postedDate);


    // Apply button

    applyNowBtn.onclick =
        () => handleApply(job);


    // Show page

    loading.style.display =
        "none";

    wrapper.style.display =
        "block";

}


// =====================================================
// DISPLAY SKILLS
// =====================================================

function displaySkills(skills) {

    const skillsContainer =
        document.getElementById(
            "skillsList"
        );


    skillsContainer.innerHTML = "";


    if (
        !Array.isArray(skills) ||
        skills.length === 0
    ) {

        skillsContainer.innerHTML = `

            <span class="skill-tag">
                Skills not specified
            </span>

        `;

        return;

    }


    skills.forEach(skill => {

        const skillElement =
            document.createElement(
                "span"
            );


        skillElement.className =
            "skill-tag";


        skillElement.textContent =
            skill;


        skillsContainer.appendChild(
            skillElement
        );

    });

}


// =====================================================
// APPLY FOR JOB
// =====================================================

async function handleApply(job) {

    hideLoginMessage();


    // Check logged-in user

    const user =
        getLoggedInUser();


    if (!user) {

        showLoginMessage(
            "Please login as a candidate before applying."
        );

        return;

    }


    // Recruiters cannot apply

    if (user.role !== "candidate") {

        showLoginMessage(
            "Only candidates can apply for jobs."
        );

        return;

    }


    try {

        applyNowBtn.disabled =
            true;

        applyNowBtn.textContent =
            "Checking...";


        const applications =
            await getApplications();


        // Check duplicate application

        const alreadyApplied =
            applications.some(
                application =>
                    String(application.jobId) ===
                    String(job.id) &&
                    String(application.userId) ===
                    String(user.id)
            );


        if (alreadyApplied) {

            showLoginMessage(
                "You have already applied for this job."
            );

            applyNowBtn.disabled =
                false;

            applyNowBtn.textContent =
                "Already Applied";

            return;

        }


        // Create application

        applyNowBtn.textContent =
            "Applying...";


        const application = {

            jobId: String(job.id),

            userId: String(user.id),

            resume:
                user.resume ||
                "resume-not-uploaded.pdf",

            status: "Applied",

            appliedDate:
                getTodayDate()

        };


        await createApplication(
            application
        );


        // Success

        applyNowBtn.textContent =
            "✓ Application Submitted";


        applyNowBtn.style.background =
            "#16a34a";


        showLoginMessage(
            "Your application has been submitted successfully!"
        );


        loginMessage.style.background =
            "#f0fdf4";

        loginMessage.style.color =
            "#15803d";


    }

    catch (error) {

        console.error(
            "Application error:",
            error
        );

        handleError(error);


        applyNowBtn.disabled =
            false;

        applyNowBtn.textContent =
            "Apply Now";

    }

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
// LOGIN MESSAGE
// =====================================================

function showLoginMessage(message) {

    loginMessage.textContent =
        message;

    loginMessage.style.display =
        "block";

}


function hideLoginMessage() {

    loginMessage.style.display =
        "none";

}


// =====================================================
// JOB ERROR
// =====================================================

function showJobError() {

    loading.style.display =
        "none";

    wrapper.style.display =
        "none";

    errorSection.style.display =
        "block";

}


// =====================================================
// BACK TO JOBS
// =====================================================

backJobsBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "jobs.html";

    }
);


errorBackBtn.addEventListener(
    "click",
    () => {

        window.location.href =
            "jobs.html";

    }
);


// =====================================================
// COMPANY INITIAL
// =====================================================

function getCompanyInitial(company) {

    if (!company) {

        return "J";

    }


    return company
        .trim()
        .charAt(0)
        .toUpperCase();

}


// =====================================================
// DATE
// =====================================================

function formatDate(dateString) {

    if (!dateString) {

        return "Recently";

    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Recently";

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
// TODAY'S DATE
// =====================================================

function getTodayDate() {

    const today =
        new Date();


    return today
        .toISOString()
        .split("T")[0];

}