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
        view.classList.add(s.isLoading);
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
            item.href = 'javascript:void(0)';
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
        this.items = this.el.querySelectorAll('a');
        this.items.forEach(item => {
            Object.defineProperty(item, 'isDisabled', { // IE11 is tripping up on writing a property to `item`; says isDisabled is read-only. it may be something to do withthe
                                                        // Nodelist.prototype.forEach polyfill
                value: true,
                writable: true
            });
            //item.isDisabled = true;
            item.addEventListener('click', function(e){
                e.preventDefault();
                if ( item.isDisabled ){
                    return;
                }
                _this.clickHandler.call(this, _this);
            });
            item.addEventListener('keyup', function(e){
                if (e.keyCode === 13 ){ // enter key
                    e.preventDefault();
                    if ( item.isDisabled ){
                        return;
                    }
                    _this.clickHandler.call(this, _this);
                }
                
            });
        });
        this.items.forEach(item => {
            item.isDisabled = false;
        });
        this.el.classList.remove(s.isLoading);

        
    }
    
    clickHandler(context){
        
        GTMPush(`HIA|Navigate|${context.name}|${this.dataset.section}`);
        S.setState('view', this.dataset.section);
    }
}