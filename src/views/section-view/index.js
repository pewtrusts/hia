import Element from '@UI/element';
//import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

export default class SectionView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'SectionView';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        /* to do */
        
        /*
        here do all the things to render the section view scaffolding using 
        ...
        ...
        ...

        */
       
        return view;
    }
    init(){
        /* to do*/
        /* get each top menu item and attache eventlistener to handle click
            S.seState().

            also PS.setSubs() to indicate active top menu section
            and to change the views
        */
    }
    clickHandler(){
        /* to do */
        /* 
            —publish event on basis of which section was selected
            

            S.setState();
            GTMPush()

        */

    }
}