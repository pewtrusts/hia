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
        console.log(this.model.data);
        var d = this.model.data.find(function(x){
            return x.id === data;
        }); //using filter ... [0] bc the IE11 find polyfill is throwing fits
        var date = !isNaN(parseInt(d.publicationDate)) ? parseInt(d.publicationDate) : d.publicationDate;
        var template = `<h2 class="${s.detailsHeading}"><a target="_blank" id="hia-title-link">${d.title}</a></h2>
                        <p><b>Date:</b> ${date}</p>
                        <p>${d.description}</p>
                        <div class="${s.columnsWrapper}">
                            
                                <p><b>Source:</b> ${d.authorOrSource}</p>
                                <p><b>Location:</b> ${d.stateOrTerritory}</p>
                            
                            
                                <p><b>Status:</b> ${d.status}</p>
                                <p><b>Language:</b> <span id="hia-language"></span></p>
                            
                        </div>


        `;
        document.querySelector('.js-details-container').innerHTML = template;
        
            this.app.APIdata.then(function(v){
                console.log(v);
                let match = v.results.find(c => c.title === d.title); //using filter ... [0] bc the IE11 find polyfill is throwing fits
                document.getElementById('hia-title-link').setAttribute('href', match.url);
                document.getElementById('hia-language').textContent = match.language;
            });
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
        
        this.el.addEventListener('click', this.clickHandler, true);
    }
    clickHandler(e){
        e.stopPropagation();
        S.setState('selectHIA', null);
    }

}