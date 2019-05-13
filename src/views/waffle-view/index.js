import Element from '@UI/element';
//import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class WaffleView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'WaffleView';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        /* to do */
        
        /*
        ...
        ...
        ...

        */
       
        return view;
    }
    init(){
        /* to do*/
    }
    clickHandler(){
        /* to do */

    }
}