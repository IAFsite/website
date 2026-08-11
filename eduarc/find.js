const params = new URLSearchParams(location.search);

const archiveId = params.get("id") || "";

const grade = archiveId.slice(0, 3);
const subject = archiveId.slice(3, 4);

let database = [];
let meta = {};

/* =========================
   BACK BUTTON
========================= */

const backBtn = document.getElementById("backBtn");

if (backBtn) {

    backBtn.href = `grade.html?id=${grade}`;

}

/* =========================
   LOAD DATA
========================= */

async function load() {

    try {

        const res = await fetch(`https://raw.githubusercontent.com/IAFsite/dbea/main/${grade}/${subject}/data.json`);

        if (!res.ok) throw new Error("File not found");

        const json = await res.json();

        meta = json.meta || json;
        database = json.data || json.subject || [];

        const title = meta.show_as || "IAF Archive";

        document.title = `IAF | EDUARC ${title}`;

        document.getElementById("pageTitle").textContent = title;

        render(database);

    } catch (err) {

        console.error(err);

        document.getElementById("pageTitle").textContent = "IAF Archive";

        document.getElementById("list").innerHTML = `
            <div style="padding:50px;text-align:center;color:#777;">
                Failed to load data
            </div>
        `;

    }

}

/* =========================
   REG PARSER
========================= */

function parseReg(reg) {

    return {

        grade: reg.slice(0,3),

        subject: reg.slice(3,4),

        number: reg.slice(4,7),

        date:
            reg.slice(7,9)+"/"+
            reg.slice(9,11)+"/"+
            reg.slice(11,15)

    };

}

const ASSET_BASE = "https://raw.githubusercontent.com/IAFsite/dbea/main/media/";

function asset(path){
    return `${ASSET_BASE}${path}`;
}



/* INLINE MARKDOWN */

function parseInline(text){

    text = text
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");


    // inline code
    text = text.replace(
        /`(.*?)`/g,
        "<code>$1</code>"
    );


    // bold
    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // underline
    text = text.replace(
        /__(.*?)__/g,
        "<u>$1</u>"
    );


    // italic
    text = text.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );


    // delete
    text = text.replace(
        /~~(.*?)~~/g,
        "<del>$1</del>"
    );


    // link
    text = text.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2">$1</a>'
    );


    return text;

}



function parseContent(text=""){

    const lines = text.split("\n");


    let html = "";

    let code = false;

    let table = false;

    let tableRows = [];


    let list = false;

    let numberList = false;


    let align = "";



    for(let raw of lines){


        const line = raw.trim();



        /* CODE */

        if(line=="#code"){

            code=true;

            html+="<pre><code>";

            continue;

        }


        if(line=="#endcode"){

            code=false;

            html+="</code></pre>";

            continue;

        }


        if(code){

            html += raw
            .replace(/</g,"&lt;")
            .replace(/>/g,"&gt;")
            +"\n";

            continue;

        }





        /* TABLE */

if(line=="#table"){

    table=true;
    tableRows=[];
    continue;

}

if(line=="#endtable"){

    table=false;

    html += `
    <div class="edu-table-wrap">
    <table class="edu-table">
    `;

    tableRows.forEach((row,index)=>{

        // Skip separator
        if(index==1) return;

        const cells=row
            .split("|")
            .map(x=>x.trim());

        html += "<tr>";

        cells.forEach(cell=>{

            if(index==0){
                html += `<th>${parseInline(cell)}</th>`;
            }else{
                html += `<td>${parseInline(cell)}</td>`;
            }

        });

        html += "</tr>";

    });

    html += `
    </table>
    </div>
    `;

    continue;

}

if(table){

    tableRows.push(line);
    continue;

}





        /* ALIGN */

        if(line=="#center"){

            align="center";

            html+=`<div class="edu-align-center">`;

            continue;

        }


        if(line=="#left"){

            align="left";

            html+=`<div class="edu-align-left">`;

            continue;

        }


        if(line=="#right"){

            align="right";

            html+=`<div class="edu-align-right">`;

            continue;

        }



        if(line=="#endalign"){

            html+="</div>";

            align="";

            continue;

        }





        /* HEADING */

        if(line.startsWith("#h1")){

            html+=`
            <h1>${parseInline(
                line.replace("#h1","").trim()
            )}</h1>
            `;

            continue;

        }



        if(line.startsWith("#h2")){

            html+=`
            <h2>${parseInline(
                line.replace("#h2","").trim()
            )}</h2>
            `;

            continue;

        }



        if(line.startsWith("#h3")){

            html+=`
            <h3>${parseInline(
                line.replace("#h3","").trim()
            )}</h3>
            `;

            continue;

        }





        /* LINE */

        if(line=="___"){

            html+="<hr>";

            continue;

        }




        /* NOTE */

        if(line.startsWith("#note")){

            html+=`
            <div class="edu-note">
            ${parseInline(
                line.replace("#note","").trim()
            )}
            </div>
            `;

            continue;

        }


/* ERROR PLACEHOLDER */

if(line.startsWith("#empty")){

    html += `
    <img
    class="edu-image"
    src="${asset("empty.png")}"
    loading="lazy">
    `;

    continue;

}


if(line.startsWith("#404")){

    html += `
    <img
    class="edu-image"
    src="${asset("404.png")}"
    loading="lazy">
    `;

    continue;

}


if(line.startsWith("#delet")){

    html += `
    <img
    class="edu-image"
    src="${asset("delet.png")}"
    loading="lazy">
    `;

    continue;

}


        /* IMAGE */

        if(line.startsWith("#image")){

            const src=line
            .replace("#image","")
            .trim();


            html+=`
            <img
            class="edu-image"
            src="${asset(src)}"
            loading="lazy">
            `;


            continue;

        }





        /* VIDEO */

        if(line.startsWith("#video")){

            const src=line
            .replace("#video","")
            .trim();


            html+=`
            <video
            class="edu-video"
            controls
            src="${asset(src)}">
            </video>
            `;


            continue;

        }





        /* AUDIO */

        if(line.startsWith("#audio")){

            const src=line
            .replace("#audio","")
            .trim();


            html+=`
            <audio
            controls
            src="${asset(src)}">
            </audio>
            `;


            continue;

        }





        /* PDF */

        if(line.startsWith("#pdf")){

            const src=line
            .replace("#pdf","")
            .trim();


            html+=`
            <iframe
            class="edu-pdf"
            src="${asset(src)}">
            </iframe>
            `;


            continue;

        }





        /* FILE */

        if(line.startsWith("#file")){


            const src=line
            .replace("#file","")
            .trim();


            const name=src
            .split("/")
            .pop();


            html+=`
            <a
            class="edu-file"
            href="${asset(src)}"
            download>
            📦 ${name}
            </a>
            `;


            continue;

        }







        /* BLOCKQUOTE */

        if(line.startsWith(">")){


            html+=`
            <blockquote>
            ${parseInline(
                line.substring(1).trim()
            )}
            </blockquote>
            `;


            continue;

        }






        /* UL LIST */

        if(line.startsWith("-")){


            html+=`
            <ul>
            <li>
            ${parseInline(
                line.substring(1).trim()
            )}
            </li>
            </ul>
            `;


            continue;

        }





        /* NUMBER LIST */

        if(/^\d+\./.test(line)){


            html+=`
            <ol>
            <li>
            ${parseInline(
                line.replace(/^\d+\./,"").trim()
            )}
            </li>
            </ol>
            `;


            continue;

        }







        /* NORMAL TEXT */


        if(line!=""){


            html+=`
            <p>
            ${parseInline(line)}
            </p>
            `;


        }

        if(line.startsWith("#404")){

    const text = line.replace("#404","").trim();

    html += `
        <figure>
            <img
                class="edu-image"
                src="${asset("404.png")}"
                loading="lazy">
            ${text ? `<figcaption>${parseInline(text)}</figcaption>` : ""}
        </figure>
    `;

    continue;
}



    }


    return html;

}

/* =========================
   RENDER LIST
========================= */

function render(data){

    const wrap = document.getElementById("list");

    wrap.innerHTML = "";

    if(!data.length){

        wrap.innerHTML=`
            <div style="padding:50px;text-align:center;color:#777;">
                No document found
            </div>
        `;

        return;

    }

    data.forEach(file=>{

        const info = parseReg(file.reg_id);

        const card = document.createElement("div");

        card.className = "unit";

        card.style.setProperty("--bg",`url(${meta.wp||""})`);

        card.innerHTML=`

            <div class="unit-info">

                <h3>${file.title}</h3>

                <div class="reg">
                    REG-ID : ${file.reg_id}
                </div>

                <div class="meta">
                    ${meta.show_as||""}
                    •
                    #${info.number}
                    •
                    ${info.date}
                </div>

            </div>

        `;

        card.onclick=()=>{

            if(window.innerWidth<900){

                location.href=`read.html?id=${encodeURIComponent(file.reg_id)}`;

                return;

            }

            select(file);

        };

        wrap.appendChild(card);

    });

}

/* =========================
   SELECT
========================= */

function select(file){

    const info = parseReg(file.reg_id);

    document.getElementById("bg").src = meta.wp || "";

    document.getElementById("title").textContent =
        file.title || "UNKNOWN";

    document.getElementById("desc").textContent =
        meta.show_as || "";

    const infoBox =
        document.getElementById("info");

    infoBox.innerHTML="";

    [

        ["REG-ID",file.reg_id],

        ["Subject",meta.show_as||""],

        ["Entry",info.number],

        ["Date",info.date]

    ].forEach(item=>{

        const div=document.createElement("div");

        div.className="info-box";

        div.textContent=`${item[0]}: ${item[1]}`;

        infoBox.appendChild(div);

    });

const content = Array.isArray(file.content)
    ? file.content.join("\n")
    : (file.content || "");

document.getElementById("content").innerHTML =
    parseContent(content);

}

/* =========================
   SEARCH
========================= */

function applyFilter(){

    const q=document
        .getElementById("search")
        .value
        .toLowerCase();



}

load();