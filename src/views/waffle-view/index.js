import Element from '@UI/element';
import s from './styles.scss';
import DropDown from '@Project/components/dropdown';
import Waffle from '@Project/components/waffle';
import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class WaffleView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'WaffleView';
        //async. dropdown will be appended to  renderToSleector node
        //only after `this` (waffle view) is read. this is handled in
        // the createComponent method and Element 
        this.addChildren([
            this.createComponent(DropDown, 'div#dropdown', {renderToSelector: '.js-dropdown-container'}),
            this.createComponent(Waffle, 'div#waffle', {
                renderToSelector: '.js-waffle-container',
                data: {
                    primary: 'stateOrTerritory'
                }
            })
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.waffleView);
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

        // heading
        var instruct = this.model.sections.find(d => d.id === 'states').instruct;
        var heading = document.createElement('h2');
        heading.textContent = instruct;
        heading.classList.add(s.instructHeading);
        view.appendChild(heading);

        //dropdown container
        var dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('js-dropdown-container');
        view.appendChild(dropdownContainer);

        //waffle container
        var waffleContainer = document.createElement('div');
        waffleContainer.classList.add('js-waffle-container');
        view.appendChild(waffleContainer);

        return view;
    }
    init(){
        console.log('init waffle-view');
        PS.setSubs([
            ['selectPrimaryGroup', this.showLegend.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    showLegend(msg,data){
        if ( data ) {
            document.querySelector('.' + s.instructHeading).classList.add(s.hide);
        }
    }
    clickHandler(){
        /* to do */

    }
}