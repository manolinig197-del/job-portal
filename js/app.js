/* =====================================================
   JOBCONNECT - MAIN APPLICATION
===================================================== */

import {
    getJobs
} from "./service/api.js";

import {
    handleError
} from "../exception/exception.js";


/* =====================================================
   APPLICATION START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeApplication();

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

function initializeApplication() {

    setupNavigation();

    setupSearch();

    setupQuickSearch();

    setupCategories();

    setupHeroJob();

    setupRecruiterButton();

    setupViewAllJobs();

    loadFeaturedJobs();

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const loginBtn =
        document.getElementById("loginBtn");

    const registerBtn =
        document.getElementById("registerBtn");


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


/* =====================================================
   LOAD FEATURED JOBS
===================================================== */

async function loadFeaturedJobs() {

    const container =
        document.getElementById(
            "featuredJobsContainer"
        );

    const jobCount =
        document.getElementById("jobCount");


    if (!container) {
        return;
    }


    try {

        /*
            Get jobs through api.js.

            Axios is NOT used directly here.
        */

        const jobs =
            await getJobs();


        /* ---------------------------------------------
           Update job count
        --------------------------------------------- */

        if (jobCount) {

            jobCount.textContent =
                jobs.length + "+";

        }


        /* ---------------------------------------------
           No jobs
        --------------------------------------------- */

        if (!jobs || jobs.length === 0) {

            container.innerHTML = `
                <div class="loading-card">
                    <p>
                        No jobs available right now.
                    </p>
                </div>
            `;

            return;
        }


        /* ---------------------------------------------
           Display first 6 jobs
        --------------------------------------------- */

        const featuredJobs =
            jobs.slice(0, 6);


        container.innerHTML =
            featuredJobs
                .map(job => createJobCard(job))
                .join("");


        /*
            Add View Job button events
        */

        setupJobButtons();


    } catch (error) {

        handleError(error);

    }

}


/* =====================================================
   CREATE JOB CARD
===================================================== */

function createJobCard(job) {

    const skills =
        Array.isArray(job.skills)
            ? job.skills
            : [];


    const displayedSkills =
        skills
            .slice(0, 3)
            .map(skill => `
                <span>
                    ${escapeHtml(skill)}
                </span>
            `)
            .join("");


    const companyInitial =
        job.company
            ? job.company.charAt(0).toUpperCase()
            : "J";


    return `

        <article class="job-card">

            <div class="job-card-top">

                <div class="job-company-logo">
                    ${escapeHtml(companyInitial)}
                </div>

                <span class="job-type">
                    Full Time
                </span>

            </div>


            <h3>
                ${escapeHtml(job.title)}
            </h3>


            <p class="job-company">
                ${escapeHtml(job.company)}
            </p>


            <div class="job-card-meta">

                <span>
                    📍 ${escapeHtml(job.location)}
                </span>

                <span>
                    💰 ${escapeHtml(job.salary)}
                </span>

                <span>
                    💼 ${escapeHtml(job.experience)}
                </span>

            </div>


            <div class="job-skills">

                ${displayedSkills}

            </div>


            <div class="job-card-bottom">

                <span class="job-date">

                    Posted:
                    ${formatDate(job.postedDate)}

                </span>


                <button
                    class="job-view-btn"
                    data-job-id="${job.id}">

                    View Job

                </button>

            </div>

        </article>

    `;
}


/* =====================================================
   VIEW JOB BUTTONS
===================================================== */

function setupJobButtons() {

    const buttons =
        document.querySelectorAll(
            ".job-view-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const jobId =
                    button.dataset.jobId;


                /*
                    Store selected job ID.

                    job-details.html will use it later.
                */

                sessionStorage.setItem(
                    "selectedJobId",
                    jobId
                );


                window.location.href =
                    "job-details.html";

            }
        );

    });

}


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    const searchBtn =
        document.getElementById(
            "searchBtn"
        );

    const jobSearch =
        document.getElementById(
            "jobSearch"
        );

    const locationSearch =
        document.getElementById(
            "locationSearch"
        );


    if (!searchBtn) {
        return;
    }


    searchBtn.addEventListener(
        "click",
        async () => {

            const searchText =
                jobSearch.value
                    .trim()
                    .toLowerCase();


            const locationText =
                locationSearch.value
                    .trim()
                    .toLowerCase();


            /*
                If both fields are empty,
                show all jobs.
            */

            if (
                searchText === "" &&
                locationText === ""
            ) {

                document
                    .getElementById("featuredJobs")
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

                return;
            }


            try {

                const jobs =
                    await getJobs();


                const filteredJobs =
                    jobs.filter(job => {

                        const title =
                            (
                                job.title || ""
                            ).toLowerCase();


                        const company =
                            (
                                job.company || ""
                            ).toLowerCase();


                        const location =
                            (
                                job.location || ""
                            ).toLowerCase();


                        const skills =
                            Array.isArray(
                                job.skills
                            )
                                ? job.skills
                                    .join(" ")
                                    .toLowerCase()
                                : "";


                        const matchesJob =
                            searchText === "" ||
                            title.includes(searchText) ||
                            company.includes(searchText) ||
                            skills.includes(searchText);


                        const matchesLocation =
                            locationText === "" ||
                            location.includes(
                                locationText
                            );


                        return (
                            matchesJob &&
                            matchesLocation
                        );

                    });


                /*
                    Save filtered results.
                */

                sessionStorage.setItem(
                    "jobSearchResults",
                    JSON.stringify(filteredJobs)
                );


                /*
                    For now display the results
                    directly on the homepage.
                */

                displaySearchResults(
                    filteredJobs
                );


            } catch (error) {

                handleError(error);

            }

        }
    );

}


/* =====================================================
   DISPLAY SEARCH RESULTS
===================================================== */

function displaySearchResults(jobs) {

    const container =
        document.getElementById(
            "featuredJobsContainer"
        );


    if (!container) {
        return;
    }


    /*
        Scroll to jobs section.
    */

    document
        .getElementById("featuredJobs")
        ?.scrollIntoView({
            behavior: "smooth"
        });


    if (jobs.length === 0) {

        container.innerHTML = `

            <div class="loading-card">

                <p>
                    😕 No jobs found.
                </p>

                <p>
                    Try another job title,
                    skill or location.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        jobs
            .map(job => createJobCard(job))
            .join("");


    setupJobButtons();

}


/* =====================================================
   QUICK SEARCH BUTTONS
===================================================== */

function setupQuickSearch() {

    const buttons =
        document.querySelectorAll(
            ".quick-search"
        );


    const jobSearch =
        document.getElementById(
            "jobSearch"
        );


    if (!jobSearch) {
        return;
    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const searchValue =
                    button.dataset.search;


                jobSearch.value =
                    searchValue;


                document
                    .getElementById("searchBtn")
                    ?.click();

            }
        );

    });

}


/* =====================================================
   CATEGORY BUTTONS
===================================================== */

function setupCategories() {

    const categoryButtons =
        document.querySelectorAll(
            ".category-card"
        );


    const jobSearch =
        document.getElementById(
            "jobSearch"
        );


    if (!jobSearch) {
        return;
    }


    categoryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const category =
                    button.dataset.category;


                jobSearch.value =
                    category;


                document
                    .getElementById("searchBtn")
                    ?.click();

            }
        );

    });

}


/* =====================================================
   HERO JOB
===================================================== */

function setupHeroJob() {

    const heroJobBtn =
        document.getElementById(
            "heroJobBtn"
        );


    if (!heroJobBtn) {
        return;
    }


    heroJobBtn.addEventListener(
        "click",
        async () => {

            try {

                const jobs =
                    await getJobs();


                if (
                    jobs &&
                    jobs.length > 0
                ) {

                    sessionStorage.setItem(
                        "selectedJobId",
                        jobs[0].id
                    );


                    window.location.href =
                        "job-details.html";

                }

            } catch (error) {

                handleError(error);

            }

        }
    );

}


/* =====================================================
   POST A JOB
===================================================== */

function setupRecruiterButton() {

    const postJobBtn =
        document.getElementById(
            "postJobBtn"
        );


    if (!postJobBtn) {
        return;
    }


    postJobBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "login.html";

        }
    );

}


/* =====================================================
   VIEW ALL JOBS
===================================================== */

function setupViewAllJobs() {

    const button =
        document.getElementById(
            "viewAllJobsBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "jobs.html";

        }
    );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {

    if (!date) {
        return "Recently";
    }


    const jobDate =
        new Date(date);


    if (Number.isNaN(
        jobDate.getTime()
    )) {

        return "Recently";

    }


    return jobDate.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}