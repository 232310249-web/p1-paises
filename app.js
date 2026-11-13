const API = "https://api.restcountries.com/countries/v5";
const CAMPOS = "response_fields=names.common,capitals,region,population,flag.url_png,languages,currencies";

let paisesActuales = [];

async function buscarPais(nombre) {
    const url = `${API}/name?q=${encodeURIComponent(nombre)}&${CAMPOS}`;

    const respuesta = await fetch(url, {
        headers: {
            "Authorization": "Bearer rc_live_2b132c431d254d9b8a99516ed03bd060"
        }
    });

    if (!respuesta.ok) {
        if (respuesta.status === 404) {
            throw new Error("No se encontró ningún país con ese nombre.");
        }

        throw new Error(`Error del servidor (código ${respuesta.status}).`);
    }

    const datos = await respuesta.json();

    return datos.data.objects;
}


async function buscarRegion(region) {

    const url = `${API}/region/${region}?${CAMPOS}`;

    const respuesta = await fetch(url, {
        headers: {
            "Authorization": "Bearer rc_live_2b132c431d254d9b8a99516ed03bd060"
        }
    });

    if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los países de la región.");
    }

    const datos = await respuesta.json();

    return datos.data.objects;
}


function mostrarPaises(paises) {
    const contenedor = document.getElementById("resultados");

    contenedor.innerHTML = "";

    paisesActuales = paises;

    paises.forEach(pais => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta";

        tarjeta.innerHTML = `
            <img src="${pais.flag.url_png}" alt="Bandera de ${pais.names.common}">
            <h3>${pais.names.common}</h3>
            <p><b>Capital:</b> ${pais.capitals && pais.capitals.length > 0 ? pais.capitals[0].name : "Sin capital"}</p>
            <p><b>Región:</b> ${pais.region}</p>
            <p><b>Población:</b> ${pais.population.toLocaleString("es-MX")}</p>

            <!-- NUEVO: Información adicional -->
            <div class="detalles" hidden>
                <p><b>Idiomas:</b> ${pais.languages ? Object.values(pais.languages).map(idioma => idioma.name || idioma).join(", ") : "Sin información"}</p>
                <p><b>Monedas:</b> ${pais.currencies ? Object.values(pais.currencies).map(m => m.name).join(", ") : "Sin información"}</p>
            </div>

            <p><small>Haz clic para ver más información</small></p>
        `;

        tarjeta.addEventListener("click", () => {
            const detalles = tarjeta.querySelector(".detalles");
            detalles.hidden = !detalles.hidden;
        });

        contenedor.appendChild(tarjeta);
    });
}


function ordenarPaises() {

    const orden = document.getElementById("ordenar").value;

    if (orden === "mayor") {
        paisesActuales.sort((a, b) => b.population - a.population);
    }

    if (orden === "menor") {
        paisesActuales.sort((a, b) => a.population - b.population);
    }

    mostrarPaises(paisesActuales);
}


const form = document.getElementById("formBuscar");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("txtPais").value.trim();
    mensaje.textContent = "Cargando...";

    try {
        const paises = await buscarPais(nombre);
        mostrarPaises(paises);
        mensaje.textContent = `${paises.length} resultado(s)`;
    } catch (error) {
        document.getElementById("resultados").innerHTML = "";
        mensaje.textContent = error.message;
    }
});


const region = document.getElementById("region");

region.addEventListener("change", async () => {

    if (region.value === "") return;

    mensaje.textContent = "Cargando países...";

    try {
        const paises = await buscarRegion(region.value);
        mostrarPaises(paises);
        mensaje.textContent = `${paises.length} resultado(s)`;
    } catch (error) {
        document.getElementById("resultados").innerHTML = "";
        mensaje.textContent = error.message;
    }
});


const ordenar = document.getElementById("ordenar");

ordenar.addEventListener("change", () => {

    if (paisesActuales.length > 0) {
        ordenarPaises();
    }

});