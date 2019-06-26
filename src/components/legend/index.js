import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Legend extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Legend';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }

        //legendContainer
        var cont = document.createElement('div');
        cont.classList.add(s.legend, 'js-legend');
        this.returnUpdatedItems(this.model.fields.find(f => f.key === this.data.primary).secondaryDimensions[0]).forEach(item => {
            cont.appendChild(item);
        });
        view.appendChild(cont);

        return view;
    }
    init(){
        this.legendContainer = this.el.querySelector('.js-legend');
        this.legendNote = this.el.querySelector('.js-legend-note');
        PS.setSubs([
            ['selectPrimaryGroup', this.toggleLegend.bind(this)],
            ['selectSecondaryDimension', this.update.bind(this)],
            ['view', this.update.bind(this)],
           // ['selectPrimaryGroup', this.resetLegendSelection.bind(this)],
           // ['selectSecondaryDimension', this.resetLegendSelection.bind(this)]
        ]);
        this.initLegend();
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    initLegend(){
        var _this = this;
        this.legendGroups = this.el.querySelectorAll('.js-legend-group');
        this.legendGroups.forEach((group, i) => {
            group.isSelected = false;
            group.addEventListener('click', function(e){
                e.stopPropagation();
                if ( this.isSelected ){
                    S.setState('highlightSecondary', null);
                    this.isSelected = false;
                    this.classList.remove(s.isSelected);
                    _this.el.classList.remove(s.legendItemIsSelected);
                } else {
                    if ( _this.app.selectedLegendItem && _this.app.selectedLegendItem !== this) {
                        _this.app.selectedLegendItem.isSelected = false;
                        _this.app.selectedLegendItem.classList.remove(s.isSelected);
                        S.setState('highlightSecondary', null);
                    }
                    setTimeout(() => { // setTimeout allows the setState above to be caaried through. better to make promise-based;
                        _this.app.selectedLegendItem = this;
                        S.setState('highlightSecondary', i);
                        _this.el.classList.add(s.legendItemIsSelected)
                        this.isSelected = true;
                        this.classList.add(s.isSelected);
                    });
                }
            });
        });
    }
    returnUpdatedItems(secondaryDimension){
        var items = [];
        
        //label
        var label = document.createElement('div');
        label.classList.add(s.legendLabel);
        label.textContent = this.model.fields.find(s => s.key === secondaryDimension).heading + ': ';
        items.push(label);
        
        //dynamic items
        this.model.nestBy[secondaryDimension].forEach((value, i) => {
            var legendGroup = document.createElement('div');
            legendGroup.classList.add('js-legend-group', s.legendGroup);
            legendGroup.dataset.value = this.app.cleanKey(value.key);

            var legendItem = document.createElement('div');
            legendItem.classList.add('js-legend-item', s.legendItem, this.app.cleanKey(value.key), 'secondary-' + i);
            var label = document.createElement('span');
            label.textContent = value.key || 'Not specified';

            legendGroup.appendChild(legendItem);
            legendGroup.appendChild(label);

            items.push(legendGroup);

        });

        //boolean item
        var boolItem = document.createElement('div');
        boolItem.classList.add(s.boolItem, s.legendItem);
        boolItem.textContent = '= In progress';
        items.push(boolItem);

        return items;

    }
    update(msg,data){
        // destroy
        this.legendContainer.innerHTML = '';
        this.legendContainer.classList.remove(s.legendItemIsSelected);
        if ( msg === 'view' ){
            data = this.model.fields.find(f => f.key === data).secondaryDimensions[0];
        }
        //update
        this.returnUpdatedItems(data).forEach(item => {
            this.legendContainer.appendChild(item);
        });
        this.initLegend();
    }
    toggleLegend(msg,data){
        if ( data ){
            this.legendContainer.classList.add(s.showLegend);
            this.legendNote.classList.add(s.showNote);
        } else {
            this.legendContainer.classList.remove(s.showLegend);
            this.legendNote.classList.remove(s.showNote);
        }
    }
}