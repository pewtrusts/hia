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
        this.sections = this.model.fields.filter(f => !f.isSecondaryOnly);
        this.sections.forEach(section => {

            var wrapper = document.createElement('div');
            wrapper.classList.add(s.navItemWrapper);

            var item = document.createElement('a');
            item.classList.add(s.navLink);
            item.href = `#${section.key}`;
            item.innerHTML = `<span>${section.heading} <span>${section.text}</span></span>`;
            item.setAttribute('data-section', section.key);
            wrapper.appendChild(item);
            list.appendChild(wrapper);
        });
        if ( this.sections.length % 2 === 1 ){
            let extraItem = document.createElement('div');
            extraItem.classList.add(s.navLink, s.placeholderMenuItem);
            extraItem.setAttribute('disabled', 'disabled');
            list.appendChild(extraItem);
        }
        
        view.appendChild(list);
        return view;
    }
    init(){
        
        var _this = this;
        this.el.querySelectorAll('a').forEach(item => {
            
            item.addEventListener('click', function(e){
                e.preventDefault();
                _this.clickHandler.call(this, _this);
            });
            item.addEventListener('keyup', function(e){
                if (e.keyCode === 13 ){ // enter key
                    e.preventDefault();
                    _this.clickHandler.call(this, _this);
                }
                
            });
        });

        
    }
    
    clickHandler(context){
        
        
        
        GTMPush(`HIA|Navigate|${context.name}|${this.dataset.section}`);
        S.setState('view', this.dataset.section);
    }
}