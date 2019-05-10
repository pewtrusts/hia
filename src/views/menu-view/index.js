import Element from '@UI/element';
//import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

export default class MenuView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MenuView';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        /* to do */
        
        /*
        here do all the things to render the menu using model.sections
        ...
        ...
        ...

        */
       
        return view;
    }
    init(){
        /* to do*/
        /* get each section and attache eventlistener to handle click */
    }
    clickHandler(){
        /* to do */
        /* 
            —publish event on basis of which section was selected
            —hide menu. it never comes back
            -showScaffolding and populate based on selection 

            S.setState();
            GTMPush()

        */

    }
}