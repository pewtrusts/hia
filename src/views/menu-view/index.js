import Element from '@UI/element';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
//import { GTMPush } from '@Utils';

import Menu from '@Project/components/menu';

/* MenuView will be the first page menu allowing users to select how they want to view the data */
// WILL BE SHARED. Called once by hia.js ( `this` == App ) for the main menu view and then
// also by SectionView. MenuClass styles should be minimal; allow calling context to provide the bulk
const menuTitle = 'Explore Health Impact Assessments';

export default class MenuView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'MenuView';
        this.menu = this.createComponent(MainMenu, 'div#menu-main');
        this.addChildren([
            this.menu
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
       
        view.classList.add(s.isLoading);
        view.classList.add(s.menuView);
        view.classList.add('menu-view');
        var heading = document.createElement('h2');
        heading.textContent = menuTitle;

        
        view.appendChild(heading);

        return view;            
    }
    init(){
        
        this.el.classList.remove(s.isLoading);
        PS.setSubs([['isSelected', this.hideSection.bind(this)]]);
        /*this.children.forEach(child => {
            
            child.init();
        });*/
        /* to do*/      
        /* get each section and attache eventlistener to handle click */
    }
    hideSection(){
        this.el.style.display = 'none';
    }
}

class MainMenu extends Menu {
    prerender(){
        var view = super.prerender();
        this.name = 'MainMenu';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }

        return view;
    }
    clickHandler(context){
        super.clickHandler(context);
        S.setState('isSelected', true);
    }
}