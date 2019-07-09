import Element from '@UI/element';
import PS from 'pubsub-setter';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import  { publishWindowResize } from '@Utils';
//import { GTMPush } from '@Utils';

// views
import MapView from './../map-view/index.js';
import BarView from './../bar-view/index.js';
import WaffleView from './../waffle-view/index.js';

import Menu from '@Project/components/menu';


publishWindowResize(S);
/* SectionView will be the shared scaffolding for all views except MenuView. It will include the top menu, the container for either MapView or BarView,
and the container for WaffleView */

// TODO can MenuView and the top menu of SectionView utilize the same code?
export default class SectionView extends Element {
    
    prerender(){
         //container
        var view = super.prerender();
        this.name = 'SectionView';
        this.barViews = this.model.fields.filter(f => !f.isSecondaryOnly && f.key !== 'stateOrTerritory' ).map(f => this.createComponent(BarView, `section#bar-view-${f.key}`, {data: {primary: f.key}}));
        this.addChildren([
            this.createComponent(TopMenu, 'div#top-menu'),
            this.createComponent(MapView, 'section#map-view'),
            ...this.barViews,
            this.createComponent(WaffleView, 'section#waffle-view')
        ]);
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add('section-view', s.sectionView);
        //view.style.display = 'none';
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
        
        var showSectionBind = this.showSection.bind(this)
        PS.setSubs([
            ['isSelected', showSectionBind],
            ['selectHIA', this.blurSection.bind(this)]
           
        ]);
        /*this.children.forEach(child => {
            
            child.init();
        });*
        /* to do*/
        /* get each top menu item and attache eventlistener to handle click
            S.seState().

            also PS.setSubs() to indicate active top menu section
            and to change the views
        */
    }
    blurSection(msg,data){
        if ( data ){
            this.el.classList.add(s.isBlurred);
        } else {
            this.el.classList.remove(s.isBlurred);
        }
    }
    showSection(){
        this.el.style.display = 'block';
        return;
    }
}

class TopMenu extends Menu {
    prerender(){
        var view = super.prerender();
        this.name = 'TopMenu';
        if ( this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        // mobile show legend button
        var btn = document.createElement('button');
        btn.textContent = 'Show menu';
        btn.classList.add(s.showMenu, 'js-show-menu');
        view.appendChild(btn);

        return view;
    }
    get mobileIsInView(){
        return this._mobileIsInView;
    }
    set mobileIsInView(bool){
        this._mobileIsInView = bool;
        if ( bool ) {
            this.el.classList.add(s.mobileIsInView);
            this.showMenu.classList.add(s.isActive);
            this.showMenu.textContent = 'Hide menu';
        } else {
            this.el.classList.remove(s.mobileIsInView);
            this.showMenu.classList.remove(s.isActive);
            this.showMenu.textContent = 'Show menu';
        }
    }
    get isMobile(){
        return this._isMobile;
    }
    set isMobile(bool){
        this._isMobile = bool;
        if ( bool ){
            this.el.classList.add(s.isMobile);
        } else {
            this.el.classList.remove(s.isMobile);
        }
    }
    clickHandler(context){
        super.clickHandler(context);
        context.mobileIsInView = false;
    }
    init(){
        this.showMenu = this.el.querySelector('.js-show-menu');
        this.mobileIsInView = false;
        this.checkIsMobile(null);
        super.init();
        
        PS.setSubs([
            ['view', this.indicateActiveSection.bind(this)],
            ['resize', this.checkIsMobile.bind(this)]
        ]);

        this.showMenu.addEventListener('click', this.menuClickHandler.bind(this));
    }
    checkIsMobile(msg, data = [window.innerWidth]){
        if ( data[0] > 659 ){
            this.isMobile = false;
        } else {
            this.isMobile = true;
        }
    }
    menuClickHandler(){
        this.mobileIsInView = !this.mobileIsInView;
    }
    indicateActiveSection(msg,data){
        this.el.querySelectorAll('a').forEach(link => {
            link.classList.remove(s.active);
        });
        this.el.querySelector(`a[data-section="${data}"`).classList.add(s.active);
    }
}