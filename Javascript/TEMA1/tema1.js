const cheerio = require("cheerio");
const request = require("request-promise");
const fs = require("fs");
//const csv = require("csv-parser");
const path = require('path');
const writeStream = fs.createWriteStream("Resultados.csv");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.port || 4000;

const list_lenguages = new Array(
    "python",
    "c",
    "java",
    "cpp",
    "csharp",
    "visual-basic",
    "javascript",
    "assembly-language",
    "sql",
    "php",
    "r",
    "object-pascal",
    "go",
    "swift",
    "ruby",
    "visual-basic-for-applications",
    "objective-c",
    "perl",
    "lua",
    "matlab"
  );

//funcion para extraer los numeros de apariciones de cada lenguaje y guarda en el archivo Resultados
async function init(list_lenguages) {
  writeStream.write("NOMBRE_LENGUAJE\tNRO_APARICIONES\n");
  list_lenguages.forEach(async function (lenguaje, index) {
    const $ = await request({
      url: "https://github.com/topics" + "/" + `${lenguaje}`,
      transform: (body) => cheerio.load(body),
    });
    const websitetitulo = $("title");
    const classTopic = await $("div.d-md-flex> div.col-md-8").find("h2").text();
    const nro_apariciones = classTopic.replace(/\D/g, "");
    console.log(nro_apariciones+" -> "+`${lenguaje}`);
    writeStream.write(`${lenguaje}\t${nro_apariciones}\n`);
  });
}

//funcion obtiene los datos de Resultados, lo procesa y envía en un servidor
function procesador() {
  var data = fs.readFileSync("Resultados.csv").toLocaleString();
  var listObject = [];
  var rows = data.split("\n"); // SPLIT ROWS
  rows.forEach((row) => {
    columns = row.split("\t"); //SPLIT COLUMNS
    listObject.push(columns);
  });

  //se elimina la primera y la ultima linea
  var leng_aparicion = listObject.filter(
    (item, item2) => item[0] != "NOMBRE_LENGUAJE" && item[0] != ""
  );

  //calculo del minimo y maximo nro de apariciones
  var min = 999999999;
  var max = 0;
  leng_aparicion.forEach((element, i) => {
    var el = element[1];
    if (Number(el) > max) {
      max = Number(el);
    }
    if (Number(el) < min) {
      min = Number(el);
    }
  });
  console.log(min + " <- min : max -> " + max);

  //calculo del raiting
  leng_aparicion.forEach((element, i) => {
    var ratin_github = ((Number(element[1]) - min) / (max - min)) * 100;
    element[2] = ratin_github.toFixed(2);
  });

  //se crea un array de objetos
  const lenguajeslista = [];
  leng_aparicion.forEach((element, i) => {
    var tmp = {};
    tmp.NOMBRE_LENGUAJE = element[0];
    tmp.RATIN_GITHUB = Number(element[1]);
    tmp.NRO_APARICIONES = Number(element[2]);
    lenguajeslista.push(tmp);
  });

  //se ordena descendentemente el array de objetos segun el rating_github
  lenguajeslista.sort((a, b) => {
    const orden_rating = b.RATIN_GITHUB - a.RATIN_GITHUB;
    return orden_rating;
  });
  //se muestra en consola la lista de lenguajes rating y nro de apariciones
  console.table(lenguajeslista);

  //LANZAR SERVIDOR
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.get("/", (req, res) => {
    res.send("prueba de servidor");
  });

  //crear lista de objetos para el grafico
  const listaGrafico = [];
  leng_aparicion.forEach((element, i) => {
    var tmp = {};
    tmp.NOMBRE_LENGUAJE = element[0];
    tmp.NRO_APARICIONES = Number(element[1]);
    listaGrafico.push(tmp);
  });

  //se ordena descendentemente segun el numero de apariciones
  listaGrafico.sort((a, b) => {
    const orden_rating = b.NRO_APARICIONES - a.NRO_APARICIONES;
    return orden_rating;
  });

  //se obtienen los 10 primeros lenguajes
  listaGrafico.splice(10, 10);

  //ruta del servidor
  app.get("/lenguajes", (req, res) => {
    res.json(listaGrafico);
  });

  app.listen(port, () =>
    console.log("Ingrese esta direccion en su navegador para observar el grafico de barras: "+path.join(__dirname,'document.html'))
  );

}

const puppeteer = require('puppeteer');

//funcion que permite abrir el navegador de forma automatica
async function abrirNavegador(){
    const navegador = await puppeteer.launch({ headless: false});
    const pagina = navegador.newPage();
    const url = path.join(__dirname,'document.html');
    await (await pagina).goto(url);
}

init(list_lenguages);
setTimeout(procesador,36000);
setTimeout(abrirNavegador,37000);