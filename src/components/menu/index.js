import Element from '@UI/element';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import { GTMPush } from '@Utils';


export default class Menu extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        
        var list = document.createElement('nav');
        list.setAttribute('aria-label', 'In-page');
        list.setAttribute('aria-controls', 'map-view bar-view waffle-view');
        list.classList.add(s.menuList);
        
        this.model.sections.forEach(section => {
            var item = document.createElement('a');
            item.href = `#${section.id}`;
            item.innerHTML = `${section.heading} <span>${section.text}</span>`;
            item.setAttribute('data-section', section.id);
            //item.setAttribute('tabindex', 0);
            list.appendChild(item);
        });
        
        view.appendChild(list);
        return view;
    }
    init(){
       
        var _this = this;
        this.el.querySelectorAll('a').forEach(item => {
            console.log(item);
            item.addEventListener('click', function(e){
                e.preventDefault()
                _this.clickHandler.call(this, _this.name);
            });
            item.addEventListener('keyup', function(e){
                if (e.keyCode === 13 ){ // enter key
                    e.preventDefault();
                    _this.clickHandler.call(this, _this.name);
                }
                
            });
        });
        //subscribe to secondary dimension , drilldown, details
    }
    clickHandler(name){
        console.log(this.dataset);
        console.log('click', name);
        GTMPush(`HIA|Navigate|${name}|${this.dataset.section}`);
        S.setState('view', this.dataset.section);
    }
}