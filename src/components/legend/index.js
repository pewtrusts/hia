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
        console.log(this);

        // following should be in an update function
        this.model.nestBy[this.data.secondary].forEach(value => {
            var legendGroup = document.createElement('div');
            legendGroup.classList.add(s.legendGroup);

            var legendItem = document.createElement('div');
            legendItem.classList.add(s.legendItem, s[this.app.cleanKey(value.key)]);

            var label = document.createElement('span');
            label.textContent = value.key;

            legendGroup.appendChild(legendItem);
            legendGroup.appendChild(label);

            view.appendChild(legendGroup);
            

        });
        /* to do */
        
        // title ie Select a state or territory
        // dropdown
        // legend
        // show all
        /*
        ...
        ...
        ...

        */
      
        view.classList.add(s.legend);
        return view;
    }
    init(){
        PS.setSubs([
            ['selectPrimaryGroup', this.showLegend.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    clickHandler(){
        /* to do */

    }
    showLegend(msg,data){
        if ( data ){
            this.el.classList.add(s.showLegend);
        }
    }
}