// =====================================================
// JOBS PAGE
// =====================================================

import { getJobs } from "./service/api.js";
import { handleError } from "../exception/exception.js";


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let allJobs = [];
let filteredJobs = [];


// =====================================================
// DOM ELEMENTS
// =====================================================

const jobsContainer =
    document.getElementById("allJobsContainer");

const resultsCount =
    document.getElementById("resultsCount");

const searchInput =
    document.getElementById("jobsSearchInput");

const locationInput =
    document.getElementById("jobsLocationInput");

const searchButton =
    document.getElementById("jobsSearchButton");

const experienceFilter =
    document.getElementById("experienceFilter");

const locationFilter =
    document.getElementById("locationFilter");

const salaryFilter =
    document.getElementById("salaryFilter");

const jobTypeFilter =
    document.getElementById("jobTypeFilter");

const sortJobs =
    document.getElementById("sortJobs");

const clearFilters =
    document.getElementById("clearFilters");

const loginBtn =
    document.getElementById("loginBtn");

const registerBtn =
    document.getElementById("registerBtn");


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    loadJobs();

    setupNavigation();

    setupEvents();

});


// =====================================================
// LOAD JOBS
// =====================================================

async function loadJobs() {

    try {

        showLoading();

        allJobs = await getJobs();

        filteredJobs = [...allJobs];

        displayJobs(filteredJobs);

    }

    catch (error) {

        console.error("Unable to load jobs:", error);

        handleError(error);

        showError();

    }

}


// =====================================================
// DISPLAY JOBS
// =====================================================

function displayJobs(jobs) {

    if (!jobsContainer) {
        return;
    }


    if (jobs.length === 0) {

        jobsContainer.innerHTML = `

            <div class="jobs-empty">

                <div class="jobs-empty-icon">
                    🔍
                </div>

                <h3>
                    No jobs found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        updateResultsCount(0);

        return;

    }


    jobsContainer.innerHTML = "";


    jobs.forEach(job => {

        const card =
            createJobCard(job);

        jobsContainer.appendChild(card);

    });


    updateResultsCount(jobs.length);

}


// =====================================================
// CREATE JOB CARD
// =====================================================

function createJobCard(job) {

    const card =
        document.createElement("article");

    card.className = "job-card";


    const skills =
        Array.isArray(job.skills)
            ? job.skills
            : [];


    const skillHTML =
        skills
            .slice(0, 4)
            .map(skill => `
                <span class="job-skill">
                    ${escapeHTML(skill)}
                </span>
            `)
            .join("");


    card.innerHTML = `

        <div class="job-card-header">

            <div class="company-logo">
                ${getCompanyInitial(job.company)}
            </div>

            <div class="job-card-title">

                <h3>
                    ${escapeHTML(job.title)}
                </h3>

                <p>
                    ${escapeHTML(job.company)}
                </p>

            </div>

        </div>


        <div class="job-meta">

            <span>
                📍 ${escapeHTML(job.location)}
            </span>

            <span>
                💼 ${escapeHTML(job.experience)}
            </span>

        </div>


        <div class="job-salary">

            💰 ${escapeHTML(job.salary)}

        </div>


        <div class="job-skills">

            ${skillHTML}

        </div>


        <p class="job-description">

            ${escapeHTML(
                truncateText(job.description, 120)
            )}

        </p>


        <div class="job-card-footer">

            <span class="job-date">

                Posted ${formatDate(job.postedDate)}

            </span>

            <button
                class="view-job-btn"
                data-job-id="${job.id}">

                View Details →

            </button>

        </div>

    `;


    const viewButton =
        card.querySelector(".view-job-btn");


    viewButton.addEventListener(
        "click",
        () => openJobDetails(job.id)
    );


    return card;

}


// =====================================================
// SEARCH
// =====================================================

function searchJobs() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    const locationTerm =
        locationInput.value
            .trim()
            .toLowerCase();


    filteredJobs =
        allJobs.filter(job => {

            const searchableText = [

                job.title,

                job.company,

                job.location,

                ...(Array.isArray(job.skills)
                    ? job.skills
                    : [])

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !searchTerm ||
                searchableText.includes(searchTerm);


            const matchesLocation =
                !locationTerm ||
                job.location
                    .toLowerCase()
                    .includes(locationTerm);


            return (
                matchesSearch &&
                matchesLocation
            );

        });


    applyFilters();

}


// =====================================================
// FILTERS
// =====================================================

function applyFilters() {

    const experience =
        experienceFilter.value;

    const location =
        locationFilter.value;

    const salary =
        salaryFilter.value;


    filteredJobs =
        filteredJobs.filter(job => {


            // EXPERIENCE

            let matchesExperience = true;

            if (experience) {

                matchesExperience =
                    job.experience
                        .toLowerCase()
                        .includes(
                            experience.toLowerCase()
                        );

            }


            // LOCATION

            const matchesLocation =
                !location ||
                job.location === location;


            // SALARY

            let matchesSalary = true;

            if (salary) {

                const minimumSalary =
                    Number(salary);

                const salaryNumbers =
                    extractSalaryNumbers(
                        job.salary
                    );


                if (salaryNumbers.length > 0) {

                    const highestSalary =
                        Math.max(
                            ...salaryNumbers
                        );

                    matchesSalary =
                        highestSalary >= minimumSalary;

                }

            }


            return (
                matchesExperience &&
                matchesLocation &&
                matchesSalary
            );

        });


    applySorting();

}


// =====================================================
// SORT
// =====================================================

function applySorting() {

    const sortValue =
        sortJobs.value;


    filteredJobs.sort((a, b) => {

        if (sortValue === "latest") {

            return new Date(b.postedDate)
                - new Date(a.postedDate);

        }


        if (sortValue === "oldest") {

            return new Date(a.postedDate)
                - new Date(b.postedDate);

        }


        if (sortValue === "title") {

            return a.title
                .localeCompare(b.title);

        }


        if (sortValue === "salary") {

            const salaryA =
                Math.max(
                    ...extractSalaryNumbers(
                        a.salary
                    )
                );

            const salaryB =
                Math.max(
                    ...extractSalaryNumbers(
                        b.salary
                    )
                );

            return salaryB - salaryA;

        }


        return 0;

    });


    displayJobs(filteredJobs);

}


// =====================================================
// SEARCH + FILTER COMBINATION
// =====================================================

function runSearchAndFilters() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();

    const locationTerm =
        locationInput.value
            .trim()
            .toLowerCase();

    const experience =
        experienceFilter.value;

    const location =
        locationFilter.value;

    const salary =
        salaryFilter.value;


    filteredJobs =
        allJobs.filter(job => {

            const searchableText = [

                job.title,

                job.company,

                job.location,

                ...(Array.isArray(job.skills)
                    ? job.skills
                    : [])

            ]
                .join(" ")
                .toLowerCase();


            const matchesSearch =
                !searchTerm ||
                searchableText.includes(searchTerm);


            const matchesSearchLocation =
                !locationTerm ||
                job.location
                    .toLowerCase()
                    .includes(locationTerm);


            const matchesExperience =
                !experience ||
                job.experience
                    .toLowerCase()
                    .includes(
                        experience.toLowerCase()
                    );


            const matchesLocation =
                !location ||
                job.location === location;


            let matchesSalary = true;


            if (salary) {

                const salaryNumbers =
                    extractSalaryNumbers(
                        job.salary
                    );


                if (salaryNumbers.length > 0) {

                    const highestSalary =
                        Math.max(
                            ...salaryNumbers
                        );

                    matchesSalary =
                        highestSalary >=
                        Number(salary);

                }

            }


            return (
                matchesSearch &&
                matchesSearchLocation &&
                matchesExperience &&
                matchesLocation &&
                matchesSalary
            );

        });


    applySorting();

}


// =====================================================
// CLEAR FILTERS
// =====================================================

function resetFilters() {

    searchInput.value = "";

    locationInput.value = "";

    experienceFilter.value = "";

    locationFilter.value = "";

    salaryFilter.value = "";

    jobTypeFilter.value = "";

    sortJobs.value = "latest";


    filteredJobs =
        [...allJobs];


    applySorting();

}


// =====================================================
// OPEN JOB DETAILS
// =====================================================

function openJobDetails(jobId) {

    sessionStorage.setItem(
        "selectedJobId",
        jobId
    );


    window.location.href =
        "job-details.html";

}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "login.html";

            }
        );

    }


    if (registerBtn) {

        registerBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "register.html";

            }
        );

    }

}


// =====================================================
// EVENTS
// =====================================================

function setupEvents() {

    searchButton.addEventListener(
        "click",
        runSearchAndFilters
    );


    searchInput.addEventListener(
        "keyup",
        event => {

            if (event.key === "Enter") {

                runSearchAndFilters();

            }

        }
    );


    locationInput.addEventListener(
        "keyup",
        event => {

            if (event.key === "Enter") {

                runSearchAndFilters();

            }

        }
    );


    experienceFilter.addEventListener(
        "change",
        runSearchAndFilters
    );


    locationFilter.addEventListener(
        "change",
        runSearchAndFilters
    );


    salaryFilter.addEventListener(
        "change",
        runSearchAndFilters
    );


    sortJobs.addEventListener(
        "change",
        () => {

            applySorting();

        }
    );


    clearFilters.addEventListener(
        "click",
        resetFilters
    );

}


// =====================================================
// RESULT COUNT
// =====================================================

function updateResultsCount(count) {

    if (!resultsCount) {
        return;
    }


    resultsCount.textContent =
        `${count} ${
            count === 1
                ? "job"
                : "jobs"
        } found`;

}


// =====================================================
// LOADING
// =====================================================

function showLoading() {

    jobsContainer.innerHTML = `

        <div class="jobs-loading">

            <div class="loader"></div>

            <p>
                Loading available jobs...
            </p>

        </div>

    `;

}


// =====================================================
// ERROR
// =====================================================

function showError() {

    jobsContainer.innerHTML = `

        <div class="jobs-empty">

            <div class="jobs-empty-icon">
                ⚠️
            </div>

            <h3>
                Unable to load jobs
            </h3>

            <p>
                Please make sure JSON Server
                is running and try again.
            </p>

        </div>

    `;


    updateResultsCount(0);

}


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
// EXTRACT SALARY NUMBERS
// =====================================================

function extractSalaryNumbers(salary) {

    if (!salary) {
        return [];
    }


    const matches =
        salary.match(/\d+(\.\d+)?/g);


    if (!matches) {
        return [];
    }


    return matches.map(Number);

}


// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(dateString) {

    if (!dateString) {
        return "Recently";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
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
// TEXT TRUNCATION
// =====================================================

function truncateText(text, maxLength) {

    if (!text) {
        return "";
    }


    if (text.length <= maxLength) {
        return text;
    }


    return (
        text.substring(0, maxLength)
        + "..."
    );

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}