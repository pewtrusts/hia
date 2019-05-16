import Element from '@UI/element';
import s from './styles.scss';
import DropDown from '@Project/components/dropdown';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class WaffleView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'WaffleView';
        this.dropdown = this.createComponent(DropDown, 'div#dropdown', {renderToSelector: '.js-dropdown-container'}); //async. dropdown will be appended to  renderToSleector node
                                                                                                                      //only after `this` (waffle view) is read. this is handled in
                                                                                                                      // the createComponent method and Element 
        this.children.push(this.drodown);
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

        //dropdown
        var dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('js-dropdown-container');
        view.appendChild(dropdownContainer);

        return view;
    }
    init(){
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    clickHandler(){
        /* to do */

    }
}