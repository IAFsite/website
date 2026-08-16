/* =========================
   GET GENERATION ID
========================= */

const params =
    new URLSearchParams(window.location.search);

const generationId =
    params.get("id");


/* =========================
   LOAD STUDENTS
========================= */

async function loadStudents() {

    const studentList =
        document.getElementById("student-list");

    const generationName =
        document.getElementById("generation-name");


    if (!generationId) {

        showError(
            "Kode angkatan tidak ditemukan."
        );

        return;

    }


    try {

        /* =========================
           LOAD GENERATION DATABASE
        ========================= */

        const response =
            await fetch(
                `https://raw.githubusercontent.com/IAFsite/dbea/main/nexsac/data/${encodeURIComponent(generationId)}.json`
            );


        if (!response.ok) {

            throw new Error(
                `Data angkatan ${generationId} gagal dimuat (HTTP ${response.status})`
            );

        }


        const data =
            await response.json();


        /* =========================
           GENERATION
        ========================= */

        if (generationName) {

            generationName.textContent =
                data.generation?.name ||
                `MURID ANGKATAN ${generationId}`;

        }


        /* =========================
           STUDENTS
        ========================= */

        const students =
            Array.isArray(data.students)
                ? data.students
                : [];


        studentList.innerHTML = "";


        if (students.length === 0) {

            studentList.innerHTML = `

                <div class="load-error">

                    <h2>
                        Belum ada data murid
                    </h2>

                    <p>
                        Data murid untuk angkatan ini belum tersedia.
                    </p>

                </div>

            `;

            return;

        }


        /* =========================
           RENDER STUDENTS
        ========================= */

        students.forEach(
            (student, index) => {


                /*
                 * Default profile:
                 *
                 * 1  → 1.png
                 * 2  → 2.png
                 * ...
                 * 12 → 12.png
                 * 13 → 1.png
                 */

                const defaultProfile =
                    (index % 12) + 1;


                /* =========================
                   PROFILE PHOTO
                ========================= */

                const photo =
                    student.photo !== null &&
                    student.photo !== ""
                        ? student.photo
                        : `asset/default-profile/${defaultProfile}.png`;


                /* =========================
                   CARD
                ========================= */

                const card =
                    document.createElement("a");


                card.className =
                    "student-card";


                card.href =
                    `profile.html?id=${encodeURIComponent(student.id)}&generation=${encodeURIComponent(generationId)}`;


                card.innerHTML = `

                    <img
                        src="${escapeHTML(photo)}"
                        class="student-photo"
                        alt="Foto ${escapeHTML(student.name)}"
                        loading="lazy"
                    >


                    <div class="student-info">

                        <h2 class="student-name">
                            ${escapeHTML(student.name)}
                        </h2>


                        <div class="student-id">

                            NEXUS SAC |
                            ${escapeHTML(student.id)}

                        </div>

                    </div>

                `;


                studentList.appendChild(card);

            }
        );

    }


    catch (error) {

        console.error(
            "Gagal memuat data murid:",
            error
        );


        showError(error.message);

    }

}


/* =========================
   ERROR
========================= */

function showError(message) {

    const studentList =
        document.getElementById("student-list");


    if (!studentList)
        return;


    studentList.innerHTML = `

        <div class="load-error">

            <h2>
                Data murid tidak dapat dimuat
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(text) {

    return String(text)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================
   START
========================= */

loadStudents();