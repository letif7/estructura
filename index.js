
function traerDatos(){
    fetch("http://localhost:3000/lenguajes")
        .then((response)=>response.json())
        .then((lenguajes)=>{
            const labeles = [];
            for(const itemlenguajes of lenguajes){
                labeles.push(itemlenguajes.NOMBRE_LENGUAJE);
            }
            const datos = [];
            for(const itemlenguajes of lenguajes){
                datos.push(itemlenguajes.NRO_APARICIONES);
            }
            let ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labeles,
                datasets: [{
                    label: '# of Votes',
                    data: datos,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

            console.log(lenguajes);
        })
}

traerDatos();