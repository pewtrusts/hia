import Element from '@UI/element';
import s from './styles.scss';
import PS from 'pubsub-setter';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class Mask extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'Mask';
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
        view.classList.add(s.mask);
        return view;
    }
    init(){
        console.log('init mask');
        PS.setSubs([
            ['selectHIA', this.activate.bind(this)]
        ]);
        this.el.addEventListener('click', this.clickHandler);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    activate(msg, data){
        if ( data ){
            this.el.classList.add(s.isActivated);
        } else {
            this.el.classList.remove(s.isActivated);
        }
    }
    clickHandler(e){
        e.stopPropagation();
        return;
    }
}