import Element from '@UI/element';
import mapSVG from 'html-loader!./map.svg';
import s from './styles.scss';

import * as d3 from 'd3-collection';
import chroma from 'chroma-js';
import tippy from 'tippy.js';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

const gradient = ['#5AC7BE', '#296EC3'];
const legendTitle = 'Number of health impact assessments';

export default class MapView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MapView';
        
        this.nestedByState = d3.nest().key(d => d.state).entries(this.model.data);
        this.valuesArray = this.nestedByState.map(d => d.values.length);
        console.log(this.nestedByState);
        this.getMaxCount();
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        

        //title
        var title = document.createElement('h2');
        title.textContent = this.model.sections.find(d => d.id === 'states').text;
        title.classList.add(s.mapTitle);


        //map
        var mapContainer = this.prerenderMap();
        var legend = this.prerenderLegend();

        view.appendChild(title);
        view.appendChild(mapContainer);
        view.appendChild(legend);

       //view.innerText = this.name;
        return view;
    }
    prerenderMap(){
        var mapContainer = document.createElement('div');
        mapContainer.classList.add('js-map-container');
        mapContainer.innerHTML = mapSVG;
        
        this.colorScale = chroma.scale(gradient).domain([1, Math.log(this.maxLegend)]);


        this.nestedByState.forEach(d => {
            var stateGroup = mapContainer.querySelector('.state-' + this.model.stateAbbreviations[d.key]);
            var stateBox = mapContainer.querySelector('.state-box-' + this.model.stateAbbreviations[d.key]);
            console.log(this.model.stateAbbreviations, d, stateGroup);
            if ( d.key !== "null") {
                if ( stateGroup ){
                    stateGroup.classList.add('is-not-null');
                    let label = stateGroup.querySelector('.state__label');
                    let path  = stateGroup.querySelector('.state__path');
                    path.style.fill = this.colorScale(Math.log(d.values.length));
                    if (label){
                        label.style.fontWeight = 'bold';
                        label.style.fill = '#fff';
                    }
                }
                if ( stateBox ){
                    stateBox.classList.add('is-not-null');
                    let rect = stateBox.querySelector('rect');
                    rect.style.fill = this.colorScale(Math.log(d.values.length));
                    rect.style.stroke = this.colorScale(Math.log(d.values.length));
                    stateBox.querySelector('.state-box__label').style.fill = '#fff';
                }
                
            }
        });

        return mapContainer;
    }
    prerenderLegend(){
        var legendContainer = document.createElement('div');
        legendContainer.textContent = legendTitle;
        legendContainer.classList.add(s.legendContainer);

        var legendWrapper = document.createElement('div');
        legendWrapper.classList.add(s.legendWrapper);


        var gradient = document.createElement('div');
        gradient.classList.add(s.gradient);
        
        legendWrapper.appendChild(gradient);

        [1, Math.floor(this.maxLegend / 10), this.maxLegend].forEach((tick, i) => {
            var label = document.createElement('div');
            label.classList.add(s.tick);
            label.textContent = tick;
            label.style.left = i === 0 ? 0 : i === 1 ? ( Math.log(tick) / Math.log(this.maxLegend) ) * 100 + '%' : '100%';
            legendWrapper.appendChild(label);
        });

        legendContainer.appendChild(legendWrapper);
        return legendContainer;
    }
    getMaxCount(){
        /* future proofing the legend. as of now, legend goes from 1 to 100 on log scale. highest count is 83. in future it's
            possible the max is more than 100; in that case the legend's max will be the max count
        */
        console.log(this.nestedByState.map(d => d.values.length));
        this.maxCount = Math.max(...this.valuesArray);
        this.maxLegend = this.maxCount < 100 ? 100 : this.maxCount(); 
    }
    init(){
        this.setTippys();
    }
    setTippys(){
        function setTippy(node,d){
            tippy(node, {
                content: `<strong>${d.values.length} HIA${d.values.length > 1 ? 's' : ''}</strong><br />Click for details`,
                followCursor: true
            });
        }
        var mapContainer = document.querySelector('.js-map-container');
        this.nestedByState.forEach(d => {
            var stateGroup = mapContainer.querySelector('.state-' + this.model.stateAbbreviations[d.key]);
            var stateBox = mapContainer.querySelector('.state-box-' + this.model.stateAbbreviations[d.key]);
            if ( d.key !== "null") {
                if ( stateGroup ){
                    setTippy(stateGroup, d);
                }
                if ( stateBox ){
                    setTippy(stateBox, d);
                }
            }
        });   
    }
    clickHandler(){
        /* to do */

    }
}