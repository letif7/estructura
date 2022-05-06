const cheerio = require("cheerio");
const request = require("request-promise");
const fs = require("fs");
const csv = require("csv-parser");
const path = require('path');
const writeStream = fs.createWriteStream("Resultados.csv");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.port || 3000;

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

async function init(list_lenguages) {
  //console.log(list_lenguages);
  writeStream.write("NOMBRE_LENGUAJE\tNRO_APARICIONES\n");
  list_lenguages.forEach(async function (lenguaje, index) {
    //console.log(`${index} : ${lenguaje}`);
    const $ = await request({
      url: "https://github.com/topics" + "/" + `${lenguaje}`,
      transform: (body) => cheerio.load(body),
    });
    const websitetitulo = $("title");
    //console.log(websitetitulo.text());
    const classTopic = await $("div.d-md-flex> div.col-md-8").find("h2").text();
    const nro_apariciones = classTopic.replace(/\D/g, "");
    writeStream.write(`${lenguaje}\t${nro_apariciones}\n`);
    //console.log(classTopic.replace(/\D/g,'')+"->"+`${lenguaje}`);
  });
}

function procesador() {
  var data = fs.readFileSync("Resultados.csv").toLocaleString();
  var listObject = [];
  // STRING TO ARRAY
  var rows = data.split("\n"); // SPLIT ROWS
  rows.forEach((row) => {
    columns = row.split("\t"); //SPLIT COLUMNS
    listObject.push(columns);
    //console.log(columns);
  });
  //console.log(listObject);

  var leng_aparicion = listObject.filter(
    (item, item2) => item[0] != "NOMBRE_LENGUAJE" && item[0] != ""
  );
  //console.log(leng_aparicion);

  //calculo del minimo y maximo nro de apariciones
  var min = 999999999;
  var max = 0;
  leng_aparicion.forEach((element, i) => {
    //console.log(i + " : " + element[0] + " , " + element[1]);
    var el = element[1];
    if (Number(el) > max) {
      max = Number(el);
    }
    if (Number(el) < min) {
      min = Number(el);
    }
  });
  console.log(min + " <- min : max -> " + max);

  //console.table(leng_aparicion);
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
    res.send("hola mundo jeje");
  });

  const listaGrafico = [];
  leng_aparicion.forEach((element, i) => {
    var tmp = {};
    tmp.NOMBRE_LENGUAJE = element[0];
    tmp.NRO_APARICIONES = Number(element[1]);
    listaGrafico.push(tmp);
  });

  listaGrafico.sort((a, b) => {
    const orden_rating = b.NRO_APARICIONES - a.NRO_APARICIONES;
    return orden_rating;
  });

  listaGrafico.splice(10, 10);
  //console.log(listaGrafico);

  app.get("/lenguajes", (req, res) => {
    res.json(listaGrafico);
  });

  app.listen(port, () =>
    /*console.log(
      `Ir a http://localhost:${port}/grafico para ver el grafico de barras`
    ),*/
    console.log("Ingrese esta direccion en su navegador para observar el grafico de barras: "+path.join(__dirname,'document.html'))
  );

}

const puppeteer = require('puppeteer');

async function abrirNavegador(){
    const navegador = await puppeteer.launch({ headless: false});
    const pagina = navegador.newPage();
    const url = path.join(__dirname,'document.html');
    await (await pagina).goto(url);
}

init(list_lenguages);
setTimeout(procesador,35000);
setTimeout(abrirNavegador,36000);