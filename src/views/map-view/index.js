import Element from '@UI/element';
import mapSVG from 'html-loader!./map.svg';
import s from './styles.scss';

import * as d3 from 'd3-collection';
import chroma from 'chroma-js';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class MapView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MapView';
        
        this.nestedByState = d3.nest().key(d => d.state).entries(this.model.data);
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
        

        view.appendChild(title);
        view.appendChild(mapContainer);

       //view.innerText = this.name;
        return view;
    }
    prerenderMap(){
        var mapContainer = document.createElement('div');
        mapContainer.innerHTML = mapSVG;
        
        this.colorScale = chroma.scale(['#5AC7BE', '#296EC3']).domain([1, Math.log(this.maxCount)]);


        this.nestedByState.forEach(d => {
            var stateGroup = mapContainer.querySelector('.state-' + this.model.stateAbbreviations[d.key]);
            var stateBox = mapContainer.querySelector('.state-box-' + this.model.stateAbbreviations[d.key]);
            console.log(this.model.stateAbbreviations, d, stateGroup);
            if ( d.key !== "null") {
                if ( stateGroup ){
                    let label = stateGroup.querySelector('.state__label');
                    stateGroup.querySelector('.state__path').style.fill = this.colorScale(Math.log(d.values.length));
                    if (label){
                        label.style.fontWeight = 'bold';
                        label.style.fill = '#fff';
                    }
                }
                if ( stateBox ){
                    stateBox.style.fill = this.colorScale(Math.log(d.values.length));
                    stateBox.style.stroke = this.colorScale(Math.log(d.values.length));
                    stateBox.parentNode.querySelector('.state-box__label').style.fill = '#fff';
                }
                
            }
        });

        return mapContainer;
    }
    getMaxCount(){
        console.log(this.nestedByState.map(d => d.values.length));
        this.maxCount = Math.max(...this.nestedByState.map(d => d.values.length));
    }
    init(){
        /* to do*/
    }
    clickHandler(){
        /* to do */

    }
}