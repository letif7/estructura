const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.port || 3000;
const cors = require('cors');

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.get("/",(req, res)=>{
    res.send("hola mundo jeje");
});

var fs = require("fs");
const csv = require('csv-parser');
const console = require("console");
// READ CSV INTO STRING
var data = fs.readFileSync("Resultados.csv").toLocaleString();


var listObject =[];
// STRING TO ARRAY
var rows = data.split("\n"); // SPLIT ROWS
rows.forEach((row) => {
    columns = row.split("\t"); //SPLIT COLUMNS
    listObject.push(columns);
    //console.log(columns);
})
//console.log(listObject);

var leng_aparicion = listObject.filter((item,item2) => item[0] != "NOMBRE_LENGUAJE" && item[0] != '');
//console.log(leng_aparicion);

var min = 999999999;
var max = 0;
leng_aparicion.forEach((element,i)=>{
    console.log(i+" : "+element[0]+" , "+element[1]);
    var el = element[1];
    if(Number(el)>max){
        max = Number(el);
    }
    if(Number(el)<min){
        min = Number(el);
    }
})

//console.log(min+" <- min : max -> "+max);
console.table(leng_aparicion)
//console.log("\t\tNOMBRE_LENGUAJE\t\tRATING_GITHUB\tNRO_APARICIONES");
leng_aparicion.forEach((element,i)=>{
    var ratin_github = (Number(element[1])-min)/(max-min)*100;
    element[2] = ratin_github.toFixed(2);
})

    const lenguajeslista = [];
    leng_aparicion.forEach((element,i)=>{
        var tmp = {};
        tmp.NOMBRE_LENGUAJE = (element[0]);
        tmp.RATIN_GITHUB = Number(element[1]);
        tmp.NRO_APARICIONES = Number(element[2]);
        lenguajeslista.push(tmp);
    })

//console.table(lenguajeslista);
lenguajeslista.sort((a,b)=>{
    const orden_rating = b.RATIN_GITHUB - a.RATIN_GITHUB;
    return orden_rating;
});
console.table(lenguajeslista);
const listaGrafico = [];
leng_aparicion.forEach((element,i)=>{
    var tmp = {};
    tmp.NOMBRE_LENGUAJE = element[0];
    tmp.NRO_APARICIONES = Number(element[1]);
    listaGrafico.push(tmp);
})

listaGrafico.sort((a,b)=>{
    const orden_rating = b.NRO_APARICIONES - a.NRO_APARICIONES;
    return orden_rating;
});

listaGrafico.splice(10,10);
console.log(listaGrafico);

app.get("/lenguajes",(req,res)=>{
    /*lenguajeslista.forEach((element,i)=>{
        console.log(element);
        res.json(element);
    }) */
    res.json(listaGrafico);      
});

app.listen(port,()=>console.log(`Ejemplo de la aplicacion escuchando en http://localhost:${port}`));

