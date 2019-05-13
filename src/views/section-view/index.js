import Element from '@UI/element';
//import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

// views
import MapView from './../map-view/index.js';
import WaffleView from './../waffle-view/index.js';

/* SectionView will be the shared scaffolding for all views except MenuView. It will include the top menu, the container for either MapView or BarView,
and the container for WaffleView */

// TODO can MenuView and the top menu of SectionView utilize the same code?
export default class SectionView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'SectionView';
        console.log(this);
        this.children.push(
            this.createComponent(MapView, 'div#map-view'),
            this.createComponent(WaffleView, 'div#waffle-view')
        );
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
            
            ACTUALLY SHOULD BE ABLE TO SHARE THIS WITH MENUVIEW
            S.setState();
            GTMPush()

        */

    }
}