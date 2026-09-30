// =====================================================
// API SERVICE
// =====================================================

// Axios is loaded from the CDN in the HTML pages.
// If your browser reports "axios is not defined",
// make sure Axios is included before the module script.

// =====================================================
// BASE URL
// =====================================================

const API_URL = "http://localhost:3000";


// =====================================================
// USERS
// =====================================================

// Get all users

export async function getUsers() {

    try {

        const response =
            await axios.get(
                `${API_URL}/users`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error fetching users:",
            error
        );

        throw error;

    }

}


// Create user

export async function createUser(user) {

    try {

        const response =
            await axios.post(
                `${API_URL}/users`,
                user
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error creating user:",
            error
        );

        throw error;

    }

}


// Get user by ID

export async function getUserById(id) {

    try {

        const response =
            await axios.get(
                `${API_URL}/users/${id}`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error fetching user:",
            error
        );

        throw error;

    }

}


// =====================================================
// JOBS
// =====================================================

// Get all jobs

export async function getJobs() {

    try {

        const response =
            await axios.get(
                `${API_URL}/jobs`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error fetching jobs:",
            error
        );

        throw error;

    }

}


// Get job by ID

export async function getJobById(id) {

    try {

        const response =
            await axios.get(
                `${API_URL}/jobs/${id}`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error fetching job:",
            error
        );

        throw error;

    }

}


// Create job

export async function createJob(job) {

    try {

        const response =
            await axios.post(
                `${API_URL}/jobs`,
                job
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error creating job:",
            error
        );

        throw error;

    }

}


// Update job

export async function updateJob(id, job) {

    try {

        const response =
            await axios.put(
                `${API_URL}/jobs/${id}`,
                job
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error updating job:",
            error
        );

        throw error;

    }

}


// Delete job

export async function deleteJob(id) {

    try {

        const response =
            await axios.delete(
                `${API_URL}/jobs/${id}`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error deleting job:",
            error
        );

        throw error;

    }

}


// =====================================================
// APPLICATIONS
// =====================================================

// Get all applications

export async function getApplications() {

    try {

        const response =
            await axios.get(
                `${API_URL}/applications`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error fetching applications:",
            error
        );

        throw error;

    }

}


// Get application by ID

export async function getApplicationById(id) {

    try {

        const response =
            await axios.get(
                `${API_URL}/applications/${id}`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error fetching application:",
            error
        );

        throw error;

    }

}


// Create application

export async function createApplication(application) {

    try {

        const response =
            await axios.post(
                `${API_URL}/applications`,
                application
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error creating application:",
            error
        );

        throw error;

    }

}


// Update application

export async function updateApplication(
    id,
    application
) {

    try {

        const response =
            await axios.put(
                `${API_URL}/applications/${id}`,
                application
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error updating application:",
            error
        );

        throw error;

    }

}


// Delete application

export async function deleteApplication(id) {

    try {

        const response =
            await axios.delete(
                `${API_URL}/applications/${id}`
            );

        return response.data;

    }

    catch (error) {

        console.error(
            "Error deleting application:",
            error
        );

        throw error;

    }

}


// =====================================================
// APPLICATIONS BY USER
// =====================================================

export async function getApplicationsByUser(userId) {

    const response =
        await axios.get(`${API_URL}/applications`);

    return response.data.filter(
        application =>
            String(application.userId) ===
            String(userId)
    );
}


export async function getApplicationsByJob(jobId) {

    const response =
        await axios.get(`${API_URL}/applications`);

    return response.data.filter(
        application =>
            String(application.jobId) ===
            String(jobId)
    );
}