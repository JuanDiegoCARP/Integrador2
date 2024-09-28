
// DOM
const selectDepartamento = document.getElementById('Departamentos'); 
const formulario = document.getElementById('formulario'); 
const inputObra = document.getElementById('Obra');
const inputUbicacion = document.getElementById('Ubicacion');
const paginacionDiv = document.getElementById('paginacion'); 
const tooltip = document.getElementById('tooltip');


// VARIABLES
const urlBase = 'https://collectionapi.metmuseum.org/public/collection/v1/';
const urlImagenes = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true";
const urlDepartamentos = "https://collectionapi.metmuseum.org/public/collection/v1/departments";
const urlObjeto = "https://collectionapi.metmuseum.org/public/collection/v1/objects/";
const urlBuscar = "https://collectionapi.metmuseum.org/public/collection/v1/search";


// Paginación
let paginaActual = 1; 
const objetosPorPagina = 10; 
let totalResultados = 0; 
let datosBusquedaActual = []; 

// Obtener departamentos
function obtenerDepartamentos() {
    fetch(urlDepartamentos)
        .then((respuesta) => respuesta.json())
        .then((data) => {
            const opcionTodas = document.createElement('option');
            opcionTodas.setAttribute('value', 0);
            opcionTodas.textContent = 'Todas las Opciones';
            selectDepartamento.appendChild(opcionTodas);

            data.departments.forEach((departamento) => {
                const opcion = document.createElement('option');
                opcion.setAttribute('value', departamento.departmentId);
                opcion.textContent = departamento.displayName;
                selectDepartamento.appendChild(opcion);
            });
        });
}

obtenerDepartamentos();

// Función para traducir
async function traducir(texto, idiomaDestino) {
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: texto, targetLang: idiomaDestino })
        });
        const resultado = await response.json();
        return resultado.translatedText;
    } catch (error) {
        console.error('Error al traducir:', error);
        return texto; 
    }
}

// Función para obtener objetos y mostrarlos
async function obtenerObjetos(idsObjetos) {
    let objetosHTML = "";
    let inicio = (paginaActual - 1) * objetosPorPagina;
    let fin = inicio + objetosPorPagina;
    let idsPaginados = idsObjetos.slice(inicio, fin); 

    for (let idObjeto of idsPaginados) {
        try {
            const respuesta = await fetch(urlObjeto + idObjeto);
            const data = await respuesta.json();

            if (data.primaryImageSmall) {
                let img = data.primaryImageSmall || "sin-imagen.jpg";

                let titulo = await traducir(data.title || "Sin información", "es");
                let cultura = await traducir(data.culture || "Sin información", "es");
                let dinastia = await traducir(data.dynasty || "Sin información", "es");
                let Fecha = data.objectDate || "Sin información";
                
                objetosHTML += 
                `<div class="objeto"> 
                    <img onmouseover = "mostrarDetalles(event,'${Fecha}')" onmouseout = "ocultarDetalles()" src="${img}" alt="${titulo}"/> 
                    <h4 class="Titulo">${titulo}</h4>
                    <h4 class="Cultura">Cultura: ${cultura}</h4>
                    <h4 class="Dinastia">Dinastía: ${dinastia}</h4>
                    ${data.additionalImages && data.additionalImages.length > 0 ? 
                        `<button class="openModalBtn" data-id="${data.objectID}">Ver más imágenes</button>` : 
                        ''
                    }
                </div>`;
            }
        } catch (error) {
            console.error('Error al obtener el objeto:', error);
        }
    }
    document.getElementById("cargando").style.display = "none";
    document.getElementById("grilla").innerHTML = objetosHTML;

    const botones = document.querySelectorAll('.openModalBtn');
    botones.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            const idObjeto = e.target.getAttribute('data-id');
            abrirModal(idObjeto);
        });
    });

    // Generar botones de paginación
    generarBotonesPaginacion(idsObjetos.length);
}

// Función para generar botones de paginación
function generarBotonesPaginacion(totalObjetos) {
    paginacionDiv.innerHTML = ''; // Limpiar botones anteriores

    const totalPaginas = Math.ceil(totalObjetos / objetosPorPagina);

    // Botón "Anterior"
    if (paginaActual > 1) {
        const botonAnterior = document.createElement('button');
        botonAnterior.textContent = 'Anterior';
        botonAnterior.addEventListener('click', () => {
            document.getElementById("grilla").innerHTML = "";
            document.getElementById("cargando").style.display = "block";
            paginaActual--;
            obtenerObjetos(datosBusquedaActual.slice(0, 100));
        });
        paginacionDiv.appendChild(botonAnterior);
    }

    // Botón "Siguiente"
    if (paginaActual < totalPaginas) {
        const botonSiguiente = document.createElement('button');
        botonSiguiente.textContent = 'Siguiente';
        botonSiguiente.addEventListener('click', () => {
            document.getElementById("grilla").innerHTML = "";
            document.getElementById("cargando").style.display = "block";
            paginaActual++;
            obtenerObjetos(datosBusquedaActual.slice(0, 100));
        });
        paginacionDiv.appendChild(botonSiguiente);
    }

    // Mostrar información de página
    const infoPagina = document.createElement('span');
    infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    paginacionDiv.appendChild(infoPagina);
}

// Inicializar la carga de imágenes
fetch(urlImagenes)
    .then((respuesta) => respuesta.json())
    .then((data) => {
        datosBusquedaActual = data.objectIDs; 
        obtenerObjetos(datosBusquedaActual.slice(0, 100));
    });

// Evento del formulario de búsqueda
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let obra = inputObra.value;
    let ubicacion = inputUbicacion.value;   
    let departamento = selectDepartamento.value;

    paginaActual = 1; 

    if (departamento == 0 && obra == '' && ubicacion == '') {
        fetch(urlImagenes)
            .then(respuesta => respuesta.json())
            .then((data) => {
                datosBusquedaActual = data.objectIDs;
                obtenerObjetos(datosBusquedaActual.slice(0, 100));
            });
        return;
    }
    buscarObjetosFiltrados(obra, ubicacion, departamento);
});

// Función para buscar objetos filtrados
function buscarObjetosFiltrados(obra, ubicacion, departamento) {
    if (ubicacion == 0) ubicacion = "";
    else ubicacion = "&geoLocation=" + ubicacion;

    if (departamento == 0) departamento = "";
    else departamento = "&departmentId=" + departamento;

    fetch(urlBuscar + "?q=" + obra + departamento + ubicacion)
        .then((respuesta) => respuesta.json())
        .then((data) => {
            if (!data.objectIDs) {
                console.log("No se encontraron objetos");
                document.getElementById("objetos").innerHTML = "No se encontraron objetos";
                return;
            } else { 
                document.getElementById("cargando").style.display = "block";
                document.getElementById("objetos").innerHTML = "";    
                datosBusquedaActual = data.objectIDs;
                document.getElementById("grilla").innerHTML = "";
                obtenerObjetos(datosBusquedaActual.slice(0, 100));
                console.log(data.objectIDs.length);
            }
        });
}

// Función para abrir el modal y cargar imágenes
function abrirModal(idObjeto) {
    fetch(`${urlObjeto}${idObjeto}`)
        .then(response => response.json())
        .then(data => {
            const contenedorImagen = document.getElementById('imageContainer');
            contenedorImagen.innerHTML = ''; 

            if (data.additionalImages && data.additionalImages.length > 0) {
                data.additionalImages.forEach((srcImagen) => {
                    const img = document.createElement('img');
                    img.src = srcImagen;
                    contenedorImagen.appendChild(img);
                });
            } else {
                contenedorImagen.innerHTML = '<p>No hay imágenes adicionales.</p>';
            }

            const modal = document.getElementById('myModal');
            modal.style.display = "block";
        });
}

// Cerrar el modal cuando se hace clic en la "X"
document.querySelector('.close').onclick = function() {
    const modal = document.getElementById('myModal');
    modal.style.display = "none";
};

// Cerrar el modal si se hace clic fuera del contenido
window.onclick = function(event) {
    const modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Cerrar el modal con la tecla "Escape"
window.onkeydown = function(event) {
    if (event.key === "Escape") {
        document.getElementById('myModal').style.display = "none";
    }
};
function mostrarDetalles (event, fecha) {
    console.log("Fecha:", fecha);
    tooltip.innerHTML = `Fecha: ${fecha}`;
    tooltip.style.display = 'block';
    tooltip.style.left = event.pageX + 'px';
    tooltip.style.top = event.pageY + 'px';

}
function ocultarDetalles() {
    tooltip.style.display = 'none';
}