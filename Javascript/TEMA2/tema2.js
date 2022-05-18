const puppeteer = require("puppeteer");
const fs = require("fs");
const writeStream = fs.createWriteStream("Resultados.csv");
const path = require("path");

const HashMap = require("hashmap");
const hashmap = new HashMap();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.port || 3000;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  //la pagina espera al selector
  const listaTopicsAll = [];
  for (var i = 1; i < 11; i++) {//hasta 10
    await page.goto("https://github.com/topics/java?page=" + i);
    await page.waitForSelector("#js-pjax-container");
    await page.waitForTimeout(1000);
    console.log("Pagina: "+i);

    const listaTopics = await page.evaluate(() => {
      const divClass = document.querySelectorAll(
        "div.d-md-flex.gutter-md div.col-md-8.col-lg-9 article.border.rounded.color-shadow-small.color-bg-subtle.my-4 div.color-bg-default.rounded-bottom-2"
      );
      const divArray = [];
      divClass.forEach((etiquetaDiv) => {
        const div = etiquetaDiv.querySelectorAll("div");
        const divTopics = div[2];
        const divUpdate = div[3];

        const topics = divTopics.querySelectorAll("a");
        const topicsPorFecha = [];
        topics.forEach((topic) => {
          topicsPorFecha.push(topic.innerText);
        });

        const update = divUpdate.querySelector("ul li.mr-4 relative-time");
        if (update != null) {
          const datetime = update.getAttribute("datetime");
          fechaTopic = new Date(datetime);

          //calcular 30 dias en milisegundos
          let fecha1 = new Date("2022-01-01T00:00:00Z");
          let fecha2 = new Date("2022-01-31T00:00:00Z");
          let msUnMes = fecha2 - fecha1;
          let fechaHoy = new Date();

          if (fechaHoy - fechaTopic <= msUnMes) {
            divArray.push(topicsPorFecha);
          }
        }
      });
      return divArray;
    });
    listaTopicsAll.push(listaTopics);
  }

  //se va a agregar a un hashmap para juntar los topics repetidos
  for (var array of listaTopicsAll) {
    for (var element of array) {
      for (var el of element) {
        if (!hashmap.has(el)) {
          hashmap.set(el, 1);
        } else {
          var cantidad = hashmap.get(el);
          cantidad = cantidad + 1;
          hashmap.set(el, cantidad);
        }
      }
    }
  }

  //se guarda en el archivo Resultados.csv y los valores del hashmap cargar en un objeto
  const topicsObject = [];
  writeStream.write("TOPIC\tNRO_APARICIONES\n");
  hashmap.forEach(function (valor, clave) {
    //console.log(clave + " : " + valor);
    writeStream.write(`${clave}\t${valor}\n`);
    tmp = {};
    tmp.TOPIC = clave;
    tmp.NRO_APARICIONES = valor;
    topicsObject.push(tmp);
  });

  //se ordenan de acuerdo a sus nros de operaciones
  topicsObject.sort((a, b) => {
    const orden_rating = b.NRO_APARICIONES - a.NRO_APARICIONES;
    return orden_rating;
  });
  
  //ordenado
  console.table(topicsObject);
  //obtiene los 20 primeros datos
  topicsObject.splice(20);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.get("/topics", (req, res) => {
    res.json(topicsObject);
  });

  app.listen(port, () => {
    //console.log(`Datos cargados al servidor http://localhost:${port}/topics`);
    console.log("Ingrese esta direccion en su navegador para observar el grafico de barras: "+path.join(__dirname,'document.html'))
  });

  await browser.close();

  const navegador = await puppeteer.launch({ headless: false});
  const pagina = navegador.newPage();
  const url = path.join(__dirname,'index.html');
  await (await pagina).goto(url);
  
})();
