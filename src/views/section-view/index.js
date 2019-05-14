import Element from '@UI/element';
import PS from 'pubsub-setter';
import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';

// views
import MapView from './../map-view/index.js';
import WaffleView from './../waffle-view/index.js';

import Menu from '@Project/components/menu';

/* SectionView will be the shared scaffolding for all views except MenuView. It will include the top menu, the container for either MapView or BarView,
and the container for WaffleView */

// TODO can MenuView and the top menu of SectionView utilize the same code?
export default class SectionView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'SectionView';
        this.children.push(
            this.createComponent(TopMenu, 'div#top-menu'),
            this.createComponent(MapView, 'div#map-view'),
            this.createComponent(WaffleView, 'div#waffle-view')
        );
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add('section-view');
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
        this.children.forEach(child => {
            console.log(child);
            child.init();
        });
        /* to do*/
        /* get each top menu item and attache eventlistener to handle click
            S.seState().

            also PS.setSubs() to indicate active top menu section
            and to change the views
        */
    }
}

class TopMenu extends Menu {
    prerender(){
        var view = super.prerender();
        this.name = 'TopMenu';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }

        return view;
    }
    init(){
        super.init();
        PS.setSubs([['view', this.indicateActiveSection.bind(this)]]);
    }
    indicateActiveSection(msg,data){
        this.el.querySelectorAll('a').forEach(link => {
            link.classList.remove(s.active);
        });
        this.el.querySelector(`a[data-section="${data}"`).classList.add(s.active);
    }
}