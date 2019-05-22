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
            ['selectHIA', this.showDetailsHandler.bind(this)],
            ['selectHIA', this.update.bind(this)]
        ]);
        this.el.addEventListener('click', this.clickHandler)
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
    clickHandler(e){
        e.stopPropagation();
        
    }
    update(msg, data){
        if ( !data ){
            return;
        }
        var d = this.model.data.find(function(d){
            return d.id === data;
        });
        var date = !isNaN(parseInt(d.publicationDate)) ? parseInt(d.publicationDate) : d.publicationDate;
        var template = `<h2 class="${s.detailsHeading}">${d.title}</h2>
                        <p><b>Date:</b> ${date}</p>
                        <p>${d.description}</p>
                        <div class="${s.columnsWrapper}">
                            
                                <p><b>Source:</b> ${d.authorOrSource}</p>
                                <p><b>Location:</b> ${d.stateOrTerritory}</p>
                            
                            
                                <p><b>Status:</b> ${d.status}</p>
                                <p><b>Language:</b> TK UNAVAILABLE IN CSV</p>
                            
                        </div>


        `;
        document.querySelector('.js-details-container').innerHTML = template;

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