import Element from '@UI/element';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
//import { GTMPush } from '@Utils';



export default class DetailsView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'DetailsView';
        this.addChildren([
            this.createComponent(CloseButton, 'button#close-button')
        ]);

        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.detailsView);


        

        //content container
        var container = document.createElement('div');
        container.classList.add(s.container, 'js-details-container');


        view.appendChild(container);
        
        return view;
    }
    get isOpen(){
        return this._isOpen;
    }
    set isOpen(bool){
        this._isOpen = bool
        if ( bool ){
            this.el.classList.add(s.isOpen);
        } else {
            this.el.classList.remove(s.isOpen);
        }
    }
    init(){
        console.log('init details');
        PS.setSubs([
            ['selectHIA', this.showDetailsHandler.bind(this)]
        ]);
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    showDetailsHandler(msg,data){
        if ( data ){
            this.isOpen = true;
        } else {
            this.isOpen = false;
        }
    }
    clickHandler(){
        /* to do */

    }
}

class CloseButton extends Element {
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'CloseButton';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.closeButton);
        
        return view;
    }
    init(){
        console.log('init closeButton');
        this.el.addEventListener('click', this.clickHandler, true);
    }
    clickHandler(e){
        e.stopPropagation();
        S.setState('selectHIA', null);
    }

}