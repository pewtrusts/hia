import Element from '@UI/element';
import mapSVG from 'html-loader!./map.svg';
import s from './styles.scss';


import chroma from 'chroma-js';
import tippy from 'tippy.js';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
import { GTMPush } from '@Utils';

//const gradient = ['#5AC7BE', '#296EC3'];
const gradient = ['#2c75ce', '#09132a'];
const legendTitle = 'Number of health impact assessments';

export default class MapView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MapView';
        
        this.valuesArray = this.model.nestBy.stateOrTerritory.map(d => d.values.length);
        
        this.getMaxCount();
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        

        //title
        var title = document.createElement('h2');
        title.textContent = this.model.fields.find(d => d.key === 'stateOrTerritory').text;
        title.classList.add('section-title');


        //map
        var mapContainer = this.prerenderMap();
        var legend = this.prerenderLegend();

        //note
        var mapNote = document.createElement('p');
        mapNote.textContent = 'Only US territories that have conducted HIAs are represented on the map.';

        view.appendChild(title);
        view.appendChild(mapContainer);
        view.appendChild(legend);
        view.appendChild(mapNote);

       //view.innerText = this.name;
        return view;
    }
    prerenderMap(){
        var mapContainer = document.createElement('div');
        mapContainer.classList.add(s.mapContainer, 'js-map-container');
        mapContainer.innerHTML = mapSVG;
        
        this.colorScale = chroma.scale(gradient).domain([1, Math.log(this.maxLegend)]);


        this.model.nestBy.stateOrTerritory.forEach(d => {
            var stateGroup = mapContainer.querySelector('.state-' + this.model.stateAbbreviations[d.key]);
            var stateBox = mapContainer.querySelector('.state-box-' + this.model.stateAbbreviations[d.key]);
            if ( d.key !== null) {
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


        var grad = document.createElement('div');
        grad.style.background = `linear-gradient(to right, ${gradient.join(',')}`;
        grad.classList.add(s.gradient);
        
        legendWrapper.appendChild(grad);

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
        this.maxCount = Math.max(...this.valuesArray);
        this.maxLegend = this.maxCount < 100 ? 100 : this.maxCount; 
    }
    toggleActive(msg,data){
        if ( data === 'stateOrTerritory' ){
            this.el.classList.add(s.active);
        } else {
            this.el.classList.remove(s.active);
        }
    }
    init(){
        

        PS.setSubs([
            ['hoverPrimaryGroup', this.highlightState.bind(this)],
            ['unHoverPrimaryGroup', this.highlightState.bind(this)],
            ['view', this.toggleActive.bind(this)]
        ]);


        
        this.setTippys();

        this.mapContainer = this.mapContainer || document.querySelector('.js-map-container');
        this.model.nestBy.stateOrTerritory.forEach(d => {
            var stateGroup = this.mapContainer.querySelector('.state-' + this.model.stateAbbreviations[d.key]);
            var stateBox = this.mapContainer.querySelector('.state-box-' + this.model.stateAbbreviations[d.key]);
            if ( d.key !== "null") {
                if ( stateGroup ){
                    stateGroup.addEventListener('click', e => {
                        this.stateClickHandler.call(this, d, e);
                    });
                    stateGroup.addEventListener('mouseenter', function(){
                        S.setState('hoverPrimaryGroup', d.key, {forceChange: true});
                    });
                    stateGroup.addEventListener('mouseleave', function(){
                        S.setState('unHoverPrimaryGroup', d.key, {forceChange: true});
                    });
                }
                if ( stateBox ){
                    stateBox.addEventListener('click', e => {
                        this.stateClickHandler.call(this, d, e);
                    });
                    stateBox.addEventListener('mouseenter', function(){
                        S.setState('hoverPrimaryGroup', d.key, {forceChange: true});
                    });
                    stateBox.addEventListener('mouseleave', function(){
                        S.setState('unHoverPrimaryGroup', d.key, {forceChange: true});
                    });
                }
            }
        }); 

    }
    highlightState(msg,data){
        var stateCode = this.model.stateAbbreviations[data];
        var path = document.querySelector('.state-' + stateCode);
        var box = document.querySelector('.state-box-' + stateCode);
        if ( msg === 'hoverPrimaryGroup' ){
            if ( path ){
                path.classList.add(s.hover);
            }
            if ( box ){
                box.classList.add(s.hover);
            }
        }
        if ( msg === 'unHoverPrimaryGroup' ){
            if ( path ){
                path.classList.remove(s.hover);
            }
            if ( box ){
                box.classList.remove(s.hover);
            }
        }
    }
    stateClickHandler(d,e){
        e.stopPropagation();
        S.setState('selectPrimaryGroup.map', d.key);
        GTMPush(`HIA|Select|State|${d.key}`);
    }
    
    setTippys(){
        function setTippy(node,d){
            tippy(node, {
                content: `<strong>${d.values.length} HIA${d.values.length > 1 ? 's' : ''}</strong><br />See below for details`,
                followCursor: true
            });
        }
        this.mapContainer = this.mapContainer || document.querySelector('.js-map-container');
        this.model.nestBy.stateOrTerritory.forEach(d => {
            var stateGroup = this.mapContainer.querySelector('.state-' + this.model.stateAbbreviations[d.key]);
            var stateBox = this.mapContainer.querySelector('.state-box-' + this.model.stateAbbreviations[d.key]);
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