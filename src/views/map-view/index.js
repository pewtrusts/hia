import Element from '@UI/element';
import mapSVG from 'html-loader!./map.min.svg';
import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';



export default class MapView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MapView';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        
        //title
        var title = document.createElement('h2');
        title.textContent = this.model.sections.find(d => d.id === 'states').text;
        title.classList.add(s.mapTitle);


        //map
        var mapContainer = document.createElement('div');
        mapContainer.innerHTML = mapSVG;
        

        view.appendChild(title);
        view.appendChild(mapContainer);

       //view.innerText = this.name;
        return view;
    }
    init(){
        /* to do*/
    }
    clickHandler(){
        /* to do */

    }
}