import Element from '@UI/element';
import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class DropDown extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'DropDown';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
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
        view.textContent = 'dropdown TK'
        view.classList.add(s.dropDown);
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