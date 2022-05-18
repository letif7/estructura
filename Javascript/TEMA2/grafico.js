
function traerDatos(){
    fetch("http://localhost:3000/topics")
        .then((response)=>response.json())
        .then((topicsObject)=>{
            const labeles = [];
            for(const itemtopic of topicsObject){
                labeles.push(itemtopic.TOPIC);
            }
            const datos = [];
            for(const itemnro of topicsObject){
                datos.push(itemnro.NRO_APARICIONES);
            }
            console.log(labeles);
            console.log(datos);
            let ctx = document.getElementById('myChart').getContext('2d');
            const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labeles,
                datasets: [{
                    label: '# de apariciones',
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

            console.log(topicsObject);
        })
}

traerDatos();