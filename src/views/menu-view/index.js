import Element from '@UI/element';
//import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

/* MenuView will be the first page menu allowing users to select how they want to view the data */
// WILL BE SHARED. Called once by hia.js ( `this` == App ) for the main menu view and then
// also by SectionView. MenuClass styles should be minimal; allow calling context to provide the bulk
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
        console.log(this);
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