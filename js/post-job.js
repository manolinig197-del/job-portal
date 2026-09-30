// =====================================================
// POST / EDIT JOB
// =====================================================

import {
    getJobById,
    createJob,
    updateJob
} from "./service/api.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const jobForm =
    document.getElementById("jobForm");

const pageTitle =
    document.getElementById("pageTitle");

const pageSubtitle =
    document.getElementById("pageSubtitle");

const jobTitle =
    document.getElementById("jobTitle");

const company =
    document.getElementById("company");

const locationInput =
    document.getElementById("location");

const salary =
    document.getElementById("salary");

const experience =
    document.getElementById("experience");

const skillInput =
    document.getElementById("skillInput");

const addSkillBtn =
    document.getElementById("addSkillBtn");

const skillsList =
    document.getElementById("skillsList");

const description =
    document.getElementById("description");

const submitJobBtn =
    document.getElementById("submitJobBtn");

const cancelBtn =
    document.getElementById("cancelBtn");

const backDashboardBtn =
    document.getElementById("backDashboardBtn");

const formMessage =
    document.getElementById("formMessage");


// =====================================================
// VARIABLES
// =====================================================

let skills = [];

let editingJobId =
    sessionStorage.getItem("editJobId");


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    initializePage
);


// =====================================================
// INITIALIZE PAGE
// =====================================================

async function initializePage() {

    const recruiter =
        getLoggedInUser();


    // Check login

    if (!recruiter) {

        window.location.href =
            "login.html";

        return;

    }


    // Only recruiter

    if (recruiter.role !== "recruiter") {

        window.location.href =
            "candidate-dashboard.html";

        return;

    }


    // Edit mode

    if (editingJobId) {

        await loadJobForEditing();

    }

}


// =====================================================
// LOAD JOB FOR EDITING
// =====================================================

async function loadJobForEditing() {

    try {

        pageTitle.textContent =
            "Edit Job";

        pageSubtitle.textContent =
            "Update the details of your job posting.";

        submitJobBtn.textContent =
            "Update Job";


        const job =
            await getJobById(
                editingJobId
            );


        if (!job) {

            showMessage(
                "Job not found.",
                "error"
            );

            return;

        }


        // Fill form

        jobTitle.value =
            job.title || "";

        company.value =
            job.company || "";

        locationInput.value =
            job.location || "";

        salary.value =
            job.salary || "";

        experience.value =
            job.experience || "";

        description.value =
            job.description || "";


        // Load skills

        skills =
            Array.isArray(job.skills)
                ? [...job.skills]
                : [];


        renderSkills();

    }

    catch (error) {

        console.error(
            "Error loading job:",
            error
        );


        showMessage(
            "Unable to load the job details.",
            "error"
        );

    }

}


// =====================================================
// ADD SKILL
// =====================================================

addSkillBtn.addEventListener(
    "click",
    addSkill
);


// Allow Enter key

skillInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addSkill();

        }

    }
);


// =====================================================
// ADD SKILL FUNCTION
// =====================================================

function addSkill() {

    const skill =
        skillInput.value.trim();


    if (!skill) {

        return;

    }


    // Prevent duplicate skills

    const alreadyExists =
        skills.some(
            existingSkill =>
                existingSkill.toLowerCase() ===
                skill.toLowerCase()
        );


    if (alreadyExists) {

        showMessage(
            "This skill has already been added.",
            "error"
        );

        return;

    }


    skills.push(skill);

    skillInput.value = "";


    hideMessage();

    renderSkills();

}


// =====================================================
// RENDER SKILLS
// =====================================================

function renderSkills() {

    skillsList.innerHTML = "";


    skills.forEach(
        (skill, index) => {

            const skillElement =
                document.createElement(
                    "div"
                );


            skillElement.className =
                "skill-item";


            skillElement.innerHTML = `

                <span>
                    ${escapeHTML(skill)}
                </span>

                <button
                    type="button"
                    class="remove-skill"
                    data-index="${index}">

                    ×

                </button>

            `;


            skillElement
                .querySelector(
                    ".remove-skill"
                )
                .addEventListener(
                    "click",
                    () => removeSkill(index)
                );


            skillsList.appendChild(
                skillElement
            );

        }
    );

}


// =====================================================
// REMOVE SKILL
// =====================================================

function removeSkill(index) {

    skills.splice(
        index,
        1
    );


    renderSkills();

}


// =====================================================
// SUBMIT FORM
// =====================================================

jobForm.addEventListener(
    "submit",
    handleSubmit
);


// =====================================================
// HANDLE SUBMIT
// =====================================================

async function handleSubmit(event) {

    event.preventDefault();


    hideMessage();


    // Validate

    const validationError =
        validateForm();


    if (validationError) {

        showMessage(
            validationError,
            "error"
        );

        return;

    }


    const recruiter =
        getLoggedInUser();


    if (!recruiter) {

        window.location.href =
            "login.html";

        return;

    }


    // Job object

    const jobData = {

        title:
            jobTitle.value.trim(),

        company:
            company.value.trim(),

        location:
            locationInput.value.trim(),

        salary:
            salary.value.trim(),

        experience:
            experience.value,

        skills:
            [...skills],

        description:
            description.value.trim(),

        postedDate:
            editingJobId
                ? undefined
                : getTodayDate(),

        recruiterId:
            String(recruiter.id)

    };


    try {

        submitJobBtn.disabled =
            true;


        submitJobBtn.textContent =
            editingJobId
                ? "Updating..."
                : "Publishing...";


        if (editingJobId) {

            // -----------------------------------------
            // UPDATE
            // -----------------------------------------

            /*
             * Get the existing job first so fields
             * such as postedDate are preserved.
             */

            const existingJob =
                await getJobById(
                    editingJobId
                );


            const updatedJob = {

                ...existingJob,

                title:
                    jobData.title,

                company:
                    jobData.company,

                location:
                    jobData.location,

                salary:
                    jobData.salary,

                experience:
                    jobData.experience,

                skills:
                    jobData.skills,

                description:
                    jobData.description,

                recruiterId:
                    String(recruiter.id)

            };


            await updateJob(
                editingJobId,
                updatedJob
            );


            showMessage(
                "Job updated successfully!",
                "success"
            );

        }

        else {

            // -----------------------------------------
            // CREATE
            // -----------------------------------------

            const newJob = {

                title:
                    jobData.title,

                company:
                    jobData.company,

                location:
                    jobData.location,

                salary:
                    jobData.salary,

                experience:
                    jobData.experience,

                skills:
                    jobData.skills,

                description:
                    jobData.description,

                postedDate:
                    getTodayDate(),

                recruiterId:
                    String(recruiter.id)

            };


            await createJob(
                newJob
            );


            showMessage(
                "Job published successfully!",
                "success"
            );

        }


        /*
         * Give the success message a moment to be
         * visible before returning to dashboard.
         */

        setTimeout(
            () => {

                sessionStorage.removeItem(
                    "editJobId"
                );


                window.location.href =
                    "recruiter-dashboard.html";

            },
            900
        );

    }

    catch (error) {

        console.error(
            "Error saving job:",
            error
        );


        showMessage(
            "Unable to save the job. Please try again.",
            "error"
        );


        submitJobBtn.disabled =
            false;


        submitJobBtn.textContent =
            editingJobId
                ? "Update Job"
                : "Publish Job";

    }

}


// =====================================================
// VALIDATE FORM
// =====================================================

function validateForm() {

    if (!jobTitle.value.trim()) {

        return "Please enter the job title.";

    }


    if (!company.value.trim()) {

        return "Please enter the company name.";

    }


    if (!locationInput.value.trim()) {

        return "Please enter the job location.";

    }


    if (!salary.value.trim()) {

        return "Please enter the salary.";

    }


    if (!experience.value) {

        return "Please select the experience level.";

    }


    if (skills.length === 0) {

        return "Please add at least one required skill.";

    }


    if (!description.value.trim()) {

        return "Please enter the job description.";

    }


    if (
        description.value.trim().length < 20
    ) {

        return "Job description should contain at least 20 characters.";

    }


    return null;

}


// =====================================================
// CANCEL
// =====================================================

cancelBtn.addEventListener(
    "click",
    goBack
);


backDashboardBtn.addEventListener(
    "click",
    goBack
);


function goBack() {

    sessionStorage.removeItem(
        "editJobId"
    );


    window.location.href =
        "recruiter-dashboard.html";

}


// =====================================================
// SHOW MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;


    formMessage.style.display =
        "block";


    formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// =====================================================
// HIDE MESSAGE
// =====================================================

function hideMessage() {

    formMessage.style.display =
        "none";

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

        return null;

    }

}


// =====================================================
// TODAY'S DATE
// =====================================================

function getTodayDate() {

    return new Date()
        .toISOString()
        .split("T")[0];

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

}