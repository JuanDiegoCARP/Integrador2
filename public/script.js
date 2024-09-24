//DOM
const departamentoSelect = document.getElementById('Departamentos'); 
const formulario = document.getElementById('formulario'); 
const obra = document.getElementById('Obra');
const ubicacion = document.getElementById('Ubicacion');
const dpto = document.getElementById('Departamentos');


// VARIABLES
const urlBase = 'https://collectionapi.metmuseum.org/public/collection/v1/'
const URLImagenes = "https://collectionapi.metmuseum.org/public/collection/v1/search?q=&hasImages=true"
const URLDpto = "https://collectionapi.metmuseum.org/public/collection/v1/departments"
const URLobjeto = "https://collectionapi.metmuseum.org/public/collection/v1/objects/"
const URLsearch = "https://collectionapi.metmuseum.org/public/collection/v1/search"



function FetchDptos() {

    const departamentos = fetch(`${urlBase}/departments`)   // Esto trae una promesa, al ser asincrono, por eso necesita un then, para que funcione.
    . then ((respuesta) => respuesta.json())                // aca se parsea la promesa a un objeto json.
    .then((data) => {                                       // y aca finalmente se usa el objeto json para traer las ubicaciones.

            const todaslasOpciones = document.createElement('option');
            todaslasOpciones.setAttribute('value', 0);
            todaslasOpciones.textContent = 'Todas las Opciones';

            departamentoSelect.appendChild(todaslasOpciones);

            console.log(data.departments)
        
            data.departments.forEach((departamento) => {    

            const opcion = document.createElement('option');
            opcion.setAttribute('value', departamento.departmentId); // Esta linea es para el value del select.
        
            opcion.textContent = departamento.displayName;  // 

            departamentoSelect.appendChild(opcion);
            
    

    });
 
    })
}
FetchDptos();


function fetchObjetos(objectIDs) {
    let objetosHTML = "";
    for(objectId of objectIDs) {
        fetch(URLobjeto + objectId) 
        .then((respuesta) => respuesta.json())
        .then((data) => {
        if(data.primaryImageSmall){
            let img = data.primaryImageSmall || "sin imagen.jpg";
            let titulo = data.title || "Sin informacion";
            let cultura = data.culture || "Sin informacion";
            let dinastia = data.dinasty  || "Sin informacion";

          if(titulo != "Sin informacion" ){ 
            objetosHTML += `<div class = "objeto"> <img src= "${img}"/>
          <h4 class = "titulo"> ${titulo} </h4>
          <h5 class = "cultura"> ${cultura} </h5>
          <h5 class = "dinastia">${dinastia}</h5>
          </div> ` 
        } 
         

            
         document.getElementById("grilla").innerHTML = objetosHTML;
    }
         console.log(data.objectID);
        })
}}


fetch(URLImagenes).then((respuesta) => respuesta.json()) 
.then((data) => {
fetchObjetos(data.objectIDs.slice (0, 21))  

})                                                                       




formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    let Obra = obra.value;
    let Ubi = ubicacion.value;   
    let Depa = dpto.value;
    if(Depa == 0 && Obra == '' && Ubi == '') {
        console.log("No hay filtro");
        Depa = "";
        Obra = "";
        Ubi = "";
        fetch(URLImagenes)
        .then(respuesta => respuesta.json())
        . then((data) => {

            fetchObjetos(data.objectIDs.slice (0, 21));

            })
            
            
            return;
    }
    buscarObjetosFiltrados(Obra, Ubi, Depa);
    console.log("Formulario Enviado");    
})
   




       
    

    
function buscarObjetosFiltrados(obra, ubi, depa) {

    if( ubi == 0) {
    ubi = "";
    }else if(ubi!=0) {
        ubi = "&geoLocation=" + ubi;
    }
    if(depa == 0) {
    depa = "";
    }else if(depa!=0) {
        depa = "&departmentId=" + depa;
    }

    
    console.log(URLsearch + "?q=" + obra + "&departamentId=" + depa + ubi);
    fetch(URLsearch + "?q=" + obra + depa + ubi)
    .then((respuesta) => respuesta.json())
    .then((data) => {
        if(!data.objectIDs){
            console.log("no se encontraron objetos");
            return  
        }else{
            console.log("se encontraron " + data.objectIDs.length + " objetos");
            fetchObjetos(data.objectIDs.slice(0, 21));            
        }

    })
}
