
const STORAGE_KEY = "lifedrop_donors";

const donorForm = document.getElementById("donorForm");
const donorMessage = document.getElementById("donorMessage");
const donorResults = document.getElementById("donorResults");
const resultCount = document.getElementById("resultCount");

function getDonors() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveDonors(donors) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donors));
}

function showMessage(element, message, type = "success") {
    element.textContent = message;
    element.className = "message " + type;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// DONOR REGISTRATION
donorForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const age = Number(document.getElementById("donorAge").value);

    if (age < 18 || age > 100) {
        showMessage(
            donorMessage,
            "Please enter a valid age and check donation eligibility with a blood bank.",
            "error"
        );
        return;
    }

    const donor = {
        id: Date.now().toString(),
        name: document.getElementById("donorName").value.trim(),
        age: age,
        bloodGroup: document.getElementById("bloodGroup").value,
        phone: document.getElementById("donorPhone").value.trim(),
        email: document.getElementById("donorEmail").value.trim(),
        city: document.getElementById("donorCity").value.trim(),
        available: document.getElementById("donorConsent").checked
    };

    if (!donor.available) {
        showMessage(
            donorMessage,
            "Please agree to be contacted before registering.",
            "error"
        );
        return;
    }

    const donors = getDonors();
    donors.unshift(donor);

    try {
        saveDonors(donors);

        showMessage(
            donorMessage,
            "Registration successful! Your demo details are saved in this browser."
        );

        donorForm.reset();
        renderDonors();
    } catch (error) {
        showMessage(
            donorMessage,
            "Unable to save data in this browser.",
            "error"
        );
    }
});

// SEARCH AND DISPLAY DONORS
function renderDonors() {
    const selectedGroup = document.getElementById("searchGroup").value;
    const selectedCity = document.getElementById("searchCity")
        .value.trim().toLowerCase();

    const matches = getDonors().filter(donor => {
        const groupMatches =
            !selectedGroup || donor.bloodGroup === selectedGroup;

        const cityMatches =
            !selectedCity ||
            (donor.city || "").toLowerCase().includes(selectedCity);

        return donor.available && groupMatches && cityMatches;
    });

    resultCount.textContent =
        matches.length + (matches.length === 1 ? " donor found" : " donors found");

    if (matches.length === 0) {
        donorResults.innerHTML = `
            <div class="empty-state">
                No matching demo donors found.
                Try another blood group or city, or register a donor above.
            </div>`;
        return;
    }

    donorResults.innerHTML = matches.map(donor => `
        <article class="donor-card">
            <h3>${escapeHTML(donor.name)}</h3>
            <span class="blood-badge">
                ${escapeHTML(donor.bloodGroup)}
            </span>
            <p>Age: ${escapeHTML(donor.age)}</p>
            <p>City: ${escapeHTML(donor.city)}</p>
            <p>Phone: ${escapeHTML(donor.phone)}</p>
            <p>Email: ${escapeHTML(donor.email || "Not provided")}</p>
        </article>
    `).join("");
}

document.getElementById("searchBtn")
    .addEventListener("click", renderDonors);

document.getElementById("searchGroup")
    .addEventListener("change", renderDonors);

document.getElementById("searchCity")
    .addEventListener("input", renderDonors);

// EMERGENCY BLOOD REQUEST
const requestForm = document.getElementById("requestForm");
const requestMessage = document.getElementById("requestMessage");
const requestOutput = document.getElementById("requestOutput");
const copyRequest = document.getElementById("copyRequest");

requestForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const patient = document.getElementById("patientName").value.trim();
    const group = document.getElementById("requestGroup").value;
    const units = document.getElementById("units").value;
    const hospital = document.getElementById("hospital").value.trim();
    const city = document.getElementById("requestCity").value.trim();
    const phone = document.getElementById("requestPhone").value.trim();
    const emailField = document.getElementById("requestEmail");
    const email = emailField ? emailField.value.trim() : "";
    const notes = document.getElementById("requestNotes").value.trim();

    const request = [
        "BLOOD DONATION REQUEST",
        "Patient/contact: " + patient,
        "Blood group needed: " + group,
        "Units needed: " + units,
        "Hospital: " + hospital,
        "City/area: " + city,
        "Contact number: " + phone,
        email ? "Email: " + email : "",
        notes ? "Additional details: " + notes : ""
    ].filter(Boolean).join("\n");

    requestOutput.value = request;
    requestOutput.hidden = false;
    copyRequest.hidden = false;

    showMessage(
        requestMessage,
        "Request prepared. Copy the details and contact a hospital or blood bank."
    );
});

copyRequest.addEventListener("click", async function() {
    try {
        await navigator.clipboard.writeText(requestOutput.value);
        showMessage(requestMessage, "Request details copied successfully.");
    } catch {
        requestOutput.focus();
        requestOutput.select();

        showMessage(
            requestMessage,
            "Request text selected. Press Ctrl+C to copy it."
        );
    }
});

// MOBILE NAVIGATION
const menuBtn = document.getElementById("menuBtn");
const navigation = document.getElementById("navigation");

menuBtn.addEventListener("click", function() {
    navigation.classList.toggle("open");
});

navigation.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function() {
        navigation.classList.remove("open");
    });
});

// CLEAR DEMO DONOR DATA
document.getElementById("clearData")
    .addEventListener("click", function() {
        const confirmed = confirm(
            "Are you sure you want to delete all demo donor registrations from this browser?"
        );

        if (confirmed) {
            localStorage.removeItem(STORAGE_KEY);
            renderDonors();

            showMessage(
                donorMessage,
                "Demo donor data has been cleared."
            );
        }
    });

// INITIALIZE THE APP
renderDonors();
