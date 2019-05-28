import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Legend extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Legend';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.legend, 'js-legend');
        this.returnUpdatedItems(this.model.fields.find(f => f.key === this.data.primary).secondaryDimensions[0]).forEach(item => {
            view.appendChild(item);
        });
        return view;
    }
    init(){
        PS.setSubs([
            ['selectPrimaryGroup', this.toggleLegend.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
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
            legendGroup.classList.add(s.legendGroup);

            var legendItem = document.createElement('div');
            legendItem.classList.add(s.legendItem, this.app.cleanKey(value.key), 'secondary-' + i);
            var label = document.createElement('span');
            label.textContent = value.key || 'Not specified';

            legendGroup.appendChild(legendItem);
            legendGroup.appendChild(label);

            items.push(legendGroup);

        });

        //boolean item
        var boolItem = document.createElement('div');
        boolItem.classList.add(s.boolItem);
        boolItem.textContent = '= Completed';
        items.push(boolItem);

        return items;

    }
    clickHandler(){
        /* to do */

    }
    toggleLegend(msg,data){
        if ( data ){
            this.el.classList.add(s.showLegend);
        } else {
            this.el.classList.remove(s.showLegend);
        }
    }
}