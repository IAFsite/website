/* =========================
   GET PARAMETERS
========================= */

const params =
    new URLSearchParams(window.location.search);

const studentId =
    params.get("id") || "";

const generationIdParam =
    params.get("generation") || "";


/* =========================
   RESEARCH TYPE
========================= */

const researchTypes = {

    a: "3S3C",

    b: "Laporan"

};


/* =========================
   LOAD PROFILE
========================= */

async function loadProfile() {

    if (!studentId) {

        showError(
            "Kode murid tidak ditemukan."
        );

        return;

    }


    try {

        /* =========================
           FIND GENERATION
        ========================= */

        const generationId =
            generationIdParam ||
            await findStudentGeneration(
                studentId
            );


        if (!generationId) {

            throw new Error(
                `Murid dengan kode "${studentId}" tidak ditemukan.`
            );

        }


        /* =========================
           LOAD DATABASE
        ========================= */

const response =
    await fetch(
        `https://raw.githubusercontent.com/IAFsite/dbea/main/nexsac/data/${encodeURIComponent(generationId)}.json`
    );


        if (!response.ok) {

            throw new Error(
                `Data angkatan ${generationId} gagal dimuat (HTTP ${response.status}).`
            );

        }


        const data =
            await response.json();


        /* =========================
           STUDENTS
        ========================= */

        const students =
            Array.isArray(data.students)
                ? data.students
                : [];


        /* =========================
           FIND STUDENT
        ========================= */

        const studentIndex =
            students.findIndex(
                student =>
                    String(student.id) ===
                    String(studentId)
            );


        if (studentIndex === -1) {

            throw new Error(
                `Murid dengan kode "${studentId}" tidak ditemukan.`
            );

        }


        const student =
            students[studentIndex];


        /* =========================
           GENERATION
        ========================= */

        const generationName =
            data.generation?.name ||
            `ANGKATAN ${generationId}`;


        /* =========================
           HEADER
        ========================= */

        const pageTitle =
            document.getElementById(
                "page-title"
            );


        if (pageTitle) {

            pageTitle.textContent =
                `MURID ${generationName}`;

        }


        document.title =
            `${student.name || "Profil Murid"} | Sekolah Alam Cikeas`;


        /* =========================
           PROFILE
        ========================= */

        renderProfile(
            student,
            studentIndex
        );


        /* =========================
           AWARDS
        ========================= */

        renderAwards(
            student.awards
        );


        /* =========================
           RESEARCH
        ========================= */

        renderResearch(
            student.research
        );

    }


    catch (error) {

        console.error(
            "Gagal memuat profile:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================
   FIND GENERATION
========================= */

async function findStudentGeneration(
    id
) {

    /*
     * Daftar database angkatan.
     *
     * Tambahkan ID database di sini
     * jika nanti ada angkatan baru.
     */

    const generations = [

        "00"

    ];


    for (
        const generationId
        of generations
    ) {

        try {

            const response =
                await fetch(
                    `https://raw.githubusercontent.com/IAFsite/dbea/main/nexsac/data/${encodeURIComponent(generationId)}.json`
                );


            if (!response.ok)
                continue;


            const data =
                await response.json();


            const students =
                Array.isArray(data.students)
                    ? data.students
                    : [];


            const found =
                students.some(
                    student =>
                        String(student.id) ===
                        String(id)
                );


            if (found) {

                return generationId;

            }

        }


        catch (error) {

            console.warn(
                `Gagal memeriksa database ${generationId}:`,
                error
            );

        }

    }


    return null;

}


/* =========================
   RENDER PROFILE
========================= */

function renderProfile(
    student,
    index
) {

    const nameElement =
        document.getElementById(
            "profile-name"
        );


    const idElement =
        document.getElementById(
            "profile-id"
        );


    const photoElement =
        document.getElementById(
            "profile-photo"
        );


    /* =========================
       NAME
    ========================= */

    if (nameElement) {

        nameElement.textContent =
            student.name ||
            "Nama tidak tersedia";

    }


    /* =========================
       ID
    ========================= */

    if (idElement) {

        idElement.textContent =
            `NEXUS SAC | ${student.id || "-"}`;

    }


    /* =========================
       DEFAULT PROFILE
    ========================= */

    /*
     * 1  → 1.png
     * 2  → 2.png
     * ...
     * 12 → 12.png
     * 13 → 1.png
     */

    const defaultProfile =
        (index % 12) + 1;


    const photo =
        student.photo !== null &&
        student.photo !== ""
            ? student.photo
            : `asset/default-profile/${defaultProfile}.png`;


    if (photoElement) {

        photoElement.src =
            photo;

        photoElement.alt =
            `Foto ${student.name || "murid"}`;

    }

}


/* =========================
   RENDER AWARDS
========================= */

function renderAwards(
    awards
) {

    const section =
        document.getElementById(
            "awards-section"
        );


    const list =
        document.getElementById(
            "awards-list"
        );


    if (!section || !list)
        return;


    /* =========================
       NO AWARDS
    ========================= */

    if (
        !Array.isArray(awards) ||
        awards.length === 0
    ) {

        section.hidden = true;

        return;

    }


    /* =========================
       CLEAR
    ========================= */

    list.innerHTML = "";


    /* =========================
       RENDER
    ========================= */

    awards.forEach(
        award => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "award";


            const title =
                typeof award === "string"
                    ? award
                    : award.title || "-";


            item.innerHTML = `

                <div class="award-title">

                    ${escapeHTML(title)}

                </div>

            `;


            list.appendChild(item);

        }
    );


    section.hidden = false;

}


/* =========================
   RENDER RESEARCH
========================= */

function renderResearch(
    researchList
) {

    const container =
        document.getElementById(
            "research-list"
        );


    const count =
        document.getElementById(
            "research-count"
        );


    if (!container)
        return;


    const research =
        Array.isArray(researchList)
            ? researchList
            : [];


    /* =========================
       CLEAR
    ========================= */

    container.innerHTML = "";


    /* =========================
       COUNT
    ========================= */

    if (count) {

        count.textContent =
            `${research.length} penelitian`;

    }


    /* =========================
       EMPTY
    ========================= */

    if (research.length === 0) {

        container.innerHTML = `

            <div class="load-error">

                <h2>
                    Belum ada penelitian
                </h2>

                <p>
                    Murid ini belum memiliki penelitian.
                </p>

            </div>

        `;

        return;

    }


    /* =========================
       CARDS
    ========================= */

    research.forEach(
        paper => {

            const card =
                document.createElement(
                    "a"
                );


            card.className =
                "research-card";


            card.href =
                `paper.html?id=${encodeURIComponent(
                    paper.id
                )}`;


            card.innerHTML = `

                <span class="research-type">

                    ${escapeHTML(
                        researchTypes[paper.type] ||
                        "Penelitian"
                    )}

                </span>


                <h3 class="research-title">

                    ${escapeHTML(
                        paper.title ||
                        "Tanpa Judul"
                    )}

                </h3>


                <div class="research-meta">

                    ${escapeHTML(
                        paper.id || "-"
                    )}

                    |

                    ${escapeHTML(
                        paper.year || "-"
                    )}

                </div>

            `;


            container.appendChild(card);

        }
    );

}


/* =========================
   ERROR
========================= */

function showError(
    message
) {

    const container =
        document.querySelector(
            ".container"
        );


    if (!container)
        return;


    container.innerHTML = `

        <div class="load-error">

            <h2>
                Profil tidak dapat dimuat
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

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================
   START
========================= */

loadProfile();