//Desarrollo de las visualizaciones
import * as d3 from 'd3';
import { numberWithCommas2 } from '../helpers';
//import { getInTooltip, getOutTooltip, positionTooltip } from './modules/tooltip';
import { setChartHeight } from '../modules/height';
import { setChartCanvas, setChartCanvasImage, setCustomCanvas, setChartCustomCanvasImage } from '../modules/canvas-image';
import { setRRSSLinks } from '../modules/rrss';
import { setFixedIframeUrl } from './chart_helpers';

//Colores fijos
const COLOR_PRIMARY_1 = '#F8B05C', 
COLOR_PRIMARY_2 = '#E37A42', 
COLOR_ANAG_1 = '#D1834F', 
COLOR_ANAG_2 = '#BF2727', 
COLOR_COMP_1 = '#528FAD', 
COLOR_COMP_2 = '#AADCE0', 
COLOR_GREY_1 = '#B5ABA4', 
COLOR_GREY_2 = '#64605A', 
COLOR_OTHER_1 = '#B58753', 
COLOR_OTHER_2 = '#731854';

export function initChart(iframe) {
    //Desarrollo del gráfico
    d3.csv('https://raw.githubusercontent.com/CarlosMunozDiazCSIC/informe_perfil_mayores_2022_social_4_6/main/data/efectos_cuidado_empleo_eurostat_v2.csv', function(error,data) {
        if (error) throw error;

        //Trazado de nuevos arrays
        let dataHombres = data.filter(function(item) {
            if (item.SEX == 'Males') { return item; }
        });
        let dataMujeres = data.filter(function(item) {
            if (item.SEX == 'Females') { return item; }
        });

        //Círculo para cuidadores de hombres
        let width = 300,
            height = 300,
            margin = 20;

        let radius = Math.min(width, height) / 2 - margin;

        // append the svg object to the div called 'my_dataviz'
        let chart1 = d3.select("#circle--first")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
            .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let color = d3.scaleOrdinal()
            .domain(data.map(function(item) { return item.EFFEMP; }).keys())
            .range([COLOR_PRIMARY_1, COLOR_COMP_2, COLOR_COMP_1, COLOR_OTHER_1, COLOR_GREY_1]); 

        let pieHombres = d3.pie()
            .sort(null)
            .value(function(d) {return d.value.valor_porc; });

        let data_hombres = pieHombres(d3.entries(dataHombres));

        let arc = d3.arc()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 0.8);
        
        let outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        //Círculo para cuidadores de mujeres
        let chart2 = d3.select("#circle--second")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
            .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let pieMujeres = d3.pie()
            .sort(null)
            .value(function(d) { return d.value.valor_porc; });
        
        let data_mujeres = pieMujeres(d3.entries(dataMujeres));

        function init() {
            chart1.selectAll('menSlices')
                .data(data_hombres)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function(d){ return(color(d.data.value.EFFEMP)); })
                .attr("stroke", "white")
                .style("stroke-width", "0.25px")
                .style("opacity", 1);

            // Add the polylines between chart and labels:
            chart1.selectAll('menPolylines')
                .data(data_hombres)
                .enter()
                .append('polyline')
                .attr("stroke", "black")
                .style("fill", "none")
                .attr("stroke-width", 1)
                .attr('points', function(d) {
                    if(d.value != 0) {
                        let posA = arc.centroid(d) // line insertion in the slice
                        let posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                        let posC = outerArc.centroid(d); // Label position = almost the same as posB
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                        posC[0] = radius * 0.8 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                        return [posA, posB, posC]
                    }                    
                });

            chart1.selectAll('menLabels')
                .data(data_hombres)
                .enter()
                .append('text')
                .text( function(d) {
                    if(d.value != 0) {
                        return parseFloat(d.data.value.valor_porc).toFixed(1); 
                    }                    
                })
                .attr('transform', function(d) {
                    if(d.value != 0) {
                        let pos = outerArc.centroid(d);
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        pos[0] = radius * 0.9 * (midangle < Math.PI ? 1 : -1);
                        return 'translate(' + pos + ')';
                    }                    
                })
                .style('text-anchor', function(d) {
                    if(d.value != 0) {
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        return (midangle < Math.PI ? 'start' : 'end');
                    }                    
                });
            
            ///Mujeres
            chart2.selectAll('womenSlices')
                .data(data_mujeres)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function(d){ return(color(d.data.value.EFFEMP)); })
                .attr("stroke", "white")
                .style("stroke-width", "0.25px")
                .style("opacity", 1);

            chart2.selectAll('womenPolylines')
                .data(data_mujeres)
                .enter()
                .append('polyline')
                .attr("stroke", "black")
                .style("fill", "none")
                .attr("stroke-width", 1)
                .attr('points', function(d) {
                    if(d.value != 0) {
                        console.log(d);
                        let posA = arc.centroid(d) // line insertion in the slice
                        let posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                        let posC = outerArc.centroid(d); // Label position = almost the same as posB
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                        posC[0] = radius * 0.8 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                        if(d.index == 6) {
                            return [posA, posB];
                        } else {
                            return [posA, posB, posC];
                        }
                        
                    }                    
                });

            chart2.selectAll('womenLabels')
                .data(data_mujeres)
                .enter()
                .append('text')
                .text( function(d) {
                    if(d.value != 0) {
                        return parseFloat(d.data.value.valor_porc).toFixed(1); 
                    }                    
                })
                .attr('transform', function(d) {
                    if(d.value != 0) {
                        let pos = outerArc.centroid(d);
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        pos[0] = radius * 0.9 * (midangle < Math.PI ? 1 : -1);
                        if(d.index == 6) {
                            pos[0] = 20;
                        } 

                        return 'translate(' + pos + ')';
                    }                    
                })
                .style('text-anchor', function(d) {
                    if(d.value != 0) {
                        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
                        return (midangle < Math.PI ? 'start' : 'end');
                    }                    
                });
        }

        /////
        /////
        // Resto - Chart
        /////
        /////
        init();

        //Animación del gráfico
        document.getElementById('replay').addEventListener('click', function() {
            animateChart();
        });

        /////
        /////
        // Resto
        /////
        /////

        //Iframe
        setFixedIframeUrl('informe_perfil_mayores_2022_social_4_6','efectos_cuidado_personas');

        //Redes sociales > Antes tenemos que indicar cuál sería el texto a enviar
        setRRSSLinks('efectos_cuidado_personas');

        //Captura de pantalla de la visualización
        setChartCanvas();
        setCustomCanvas();

        let pngDownload = document.getElementById('pngImage');

        pngDownload.addEventListener('click', function(){
            setChartCanvasImage('efectos_cuidado_personas');
            setChartCustomCanvasImage('efectos_cuidado_personas');
        });

        //Altura del frame
        setChartHeight(iframe);    
    });    
}