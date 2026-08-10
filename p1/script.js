const DATA_URL = "wrkos/furru/data.json";

const initialVisible = 3;
const loadAmount = 3;

let furruDatabase = [];
let visibleCount = initialVisible;


/* =========================
   ELEMENTS
========================= */

const grid = document.getElementById(
    "featured-furru-grid"
);

const showMoreButton = document.getElementById(
    "show-more"
);

const countElement = document.getElementById(
    "furru-count"
);


/* =========================
   LOAD JSON
========================= */

async function loadFurruData() {

    try {

        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        /*
            JSON structure:

            {
                personnel: {
                    FP001: {...},
                    FP002: {...}
                }
            }
        */

        furruDatabase = Object.entries(
            data.personnel || {}
        ).map(([id, furru]) => {

            return {
                id: id,

                name: furru.name,
                sn: furru.sn,
                reg: furru.reg,

                gender: furru.sex,
                deploy: furru.deploy,

                heightNoEars:
                    furru.height_no_ears,

                heightWithEars:
                    furru.height_with_ears,

                model: furru.model,

                image: furru.profile,

                role: furru.role,

                outfits: furru.outfits || [],

                /*
                    Individual page
                */

                page:
                    `furru/?id=${encodeURIComponent(id)}`
            };

        });


        /*
            Optional:
            sort berdasarkan FP number
        */

        furruDatabase.sort(
            (a, b) =>
                a.id.localeCompare(
                    b.id,
                    undefined,
                    { numeric: true }
                )
        );


        updateCount();

        renderFurru();


    } catch (error) {

        console.error(
            "Failed to load Furru database:",
            error
        );

        showDatabaseError();

    }

}


/* =========================
   COUNT
========================= */

function updateCount() {

    if (!countElement) return;

    countElement.textContent =
        `${furruDatabase.length} ENTITIES`;

}


/* =========================
   CREATE CARD
========================= */

function createFurruCard(furru) {

    const card =
        document.createElement("a");

    card.className =
        "furru-card";

    card.href =
        furru.page;


    card.innerHTML = `

        <div class="furru-card-image">

            <img
                src="${furru.image}"
                alt="${escapeHTML(furru.name)} — ${furru.id}"
                loading="lazy"
            >

            <div class="furru-card-overlay">

                VIEW ENTITY

                <span>→</span>

            </div>

        </div>


        <div class="furru-card-info">

            <div>

                <span class="furru-id">
                    ${escapeHTML(furru.id)}
                </span>

                <h3>
                    ${escapeHTML(furru.name)}
                </h3>

            </div>


            <div class="furru-meta">

                <span>
                    ${escapeHTML(
                        furru.gender
                            .toUpperCase()
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        furru.role
                            .toUpperCase()
                    )}
                </span>

            </div>

        </div>

    `;

    return card;

}


/* =========================
   RENDER
========================= */

function renderFurru() {

    if (!grid) return;

    grid.innerHTML = "";


    const visibleFurru =
        furruDatabase.slice(
            0,
            visibleCount
        );


    visibleFurru.forEach(
        furru => {

            grid.appendChild(
                createFurruCard(furru)
            );

        }
    );


    updateButton();

}


/* =========================
   SHOW MORE
========================= */

function updateButton() {

    if (!showMoreButton) return;


    if (
        visibleCount >=
        furruDatabase.length
    ) {

        showMoreButton.textContent =
            "All Furru Loaded";

        showMoreButton.disabled =
            true;

    } else {

        const remaining =
            furruDatabase.length -
            visibleCount;

        showMoreButton.textContent =
            `Show More (${remaining})`;

        showMoreButton.disabled =
            false;

    }

}


if (showMoreButton) {

    showMoreButton.addEventListener(
        "click",
        () => {

            visibleCount +=
                loadAmount;

            renderFurru();

        }
    );

}


/* =========================
   DATABASE ERROR
========================= */

function showDatabaseError() {

    if (!grid) return;

    grid.innerHTML = `

        <div class="database-error">

            <strong>
                FURRU DATABASE UNAVAILABLE
            </strong>

            <span>
                Unable to load personnel data.
            </span>

        </div>

    `;

}


/* =========================
   BASIC HTML ESCAPE
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    loadFurruData
);