const params =
    new URLSearchParams(window.location.search);

const generationId =
    params.get("id") || "";


/* =========================
   RESEARCH TYPE
========================= */

const researchTypes = {

    a: {
        name: "3S3C",
    },

    b: {
        name: "Laporan",
    }

};


/* =========================
   LOAD GENERATION
========================= */

async function loadGeneration() {

    const generationName =
        document.getElementById("generation-name");

    const studentCard =
        document.getElementById("student-card");

    const studentGenerationName =
        document.getElementById(
            "student-generation-name"
        );

    const studentGenerationCount =
        document.getElementById(
            "student-generation-count"
        );

    const researchTypesContainer =
        document.getElementById(
            "research-types"
        );


    /* =========================
       CHECK ID
    ========================= */

    if (!generationId) {

        showError(
            researchTypesContainer,
            "Nomor angkatan tidak ditemukan."
        );

        return;

    }


    try {

        /* =========================
           LOAD JSON
        ========================= */

        const response =
            await fetch(
                `https://raw.githubusercontent.com/IAFsite/dbea/main/nexsac/data/${encodeURIComponent(generationId)}.json`
            );


        if (!response.ok) {

            throw new Error(
                `Data angkatan tidak dapat dimuat (HTTP ${response.status}).`
            );

        }


        const data =
            await response.json();


        /* =========================
           GENERATION
        ========================= */

        const generation =
            data.generation || {};


        const students =
            Array.isArray(data.students)
                ? data.students
                : [];


        const displayGeneration =
            generation.name ||
            `ANGKATAN ${generationId}`;


        /* =========================
           HEADER
        ========================= */

        generationName.textContent =
            displayGeneration;


        /* =========================
           STUDENT CARD
        ========================= */

        studentGenerationName.textContent =
            `Murid ${displayGeneration
                .toLowerCase()
                .replace(/^angkatan\s+/i, "Angkatan ")
            }`;


        studentGenerationCount.textContent =
            `${students.length} murid`;


        studentCard.href =
            `muridangkatan.html?id=${encodeURIComponent(generationId)}`;


        /* =========================
           FIND AVAILABLE TYPES
        ========================= */

        const availableTypes =
            new Map();


        for (const student of students) {

            for (
                const research
                of student.research || []
            ) {

                const type =
                    research.type;


                if (
                    type &&
                    researchTypes[type]
                ) {

                    if (
                        !availableTypes.has(type)
                    ) {

                        availableTypes.set(
                            type,
                            0
                        );

                    }


                    availableTypes.set(
                        type,
                        availableTypes.get(type) + 1
                    );

                }

            }

        }


        /* =========================
           CLEAR
        ========================= */

        researchTypesContainer.innerHTML = "";


        /* =========================
           NO DATA
        ========================= */

        if (
            availableTypes.size === 0
        ) {

            showError(
                researchTypesContainer,
                "Belum ada jenis penelitian pada angkatan ini."
            );

            return;

        }


        /* =========================
           CREATE CARDS
        ========================= */

        for (
            const [type, count]
            of availableTypes
        ) {

            const info =
                researchTypes[type];


            const card =
                document.createElement("a");


            card.className =
                "research-type-card";


            /*
             * Flow:
             *
             * angkatan.html?id=09
             * ↓
             * penelitian.html?id=09&type=a
             */

            card.href =
                `penelitian.html?id=${encodeURIComponent(generationId)}&type=${encodeURIComponent(type)}`;


            card.innerHTML = `

                <div class="research-type-content">

                    <h2>
                        ${escapeHTML(info.name)}
                    </h2>

                    <span class="research-count">
                        ${count} File
                    </span>

                </div>

            `;


            researchTypesContainer.appendChild(
                card
            );

        }

    }


    catch (error) {

        console.error(
            "Gagal memuat data angkatan:",
            error
        );


        showError(
            researchTypesContainer,
            error.message
        );

    }

}


/* =========================
   ERROR
========================= */

function showError(
    container,
    message
) {

    if (!container)
        return;


    container.innerHTML = `

        <div class="load-error">

            <h2>
                Data tidak dapat dimuat
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================
   ESCAPE HTML
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

loadGeneration();