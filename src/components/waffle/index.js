import Element from '@UI/element';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
import tippy from 'tippy.js';

//import { GTMPush } from '@Utils';


const keys = new Set();



export default class Waffle extends Element {

    prerender() {
        //container
        var view = super.prerender();
        this.name = 'Waffle';
        
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        var nestedData = this.model.nestBy[this.data.primary];
        var secondary = this.model.fields.find(s => s.key === this.data.primary).secondaryDimensions[0];

        //container
        var waffleContainer = document.createElement('div');
        waffleContainer.classList.add(s.waffleContainer);


        //groups
        function returnMatchingValuesLength(ab) {
            return this.model.nestBy[secondary].find(d => d.key === ab[secondary][0]).values.length;
        }
        nestedData.forEach(group => {
            var groupDiv = document.createElement('div');
            groupDiv.dataset.group = group.key;
            groupDiv.dataset.count = group.values.length;
            groupDiv.classList.add(s.groupDiv);
            groupDiv.insertAdjacentHTML('afterbegin', `<h2 class="${s.groupDivHeading}">${group.key !== '' ? group.key : '[blank]'} &ndash; <span class="${s.itemCount}">${group.values.length}</span></h2>`);


            var itemsContainer = document.createElement('div');
            itemsContainer.classList.add(s.itemsContainer);
            itemsContainer.style.width = Math.ceil(Math.sqrt(group.values.length)) * 28 + 'px';

            // line above sets width of each so that each is as close to a square as possible
            group.values.sort((a, b) => returnMatchingValuesLength.call(this, b) - returnMatchingValuesLength.call(this, a));
            group.values.forEach((value) => {
                //items
                var itemDiv = document.createElement('div');
                var cleanSecondary = this.app.cleanKey(value[secondary]);
                var nested = this.model.nestBy[secondary];
                var matchingString = typeof value[secondary] === 'string' ? value[secondary] : value[secondary][0];
                var indexOfSecondaryValue = nested.findIndex(s => s.key === matchingString);
                itemDiv.classList.add(s.item);
                itemDiv.classList.add(cleanSecondary, 'secondary-' + indexOfSecondaryValue);
                itemDiv.dataset.title = value.title;
                itemDiv.dataset.id = value.id;
                //itemDiv.dataset.tippyContent = value.Title;
                //tippy(itemDiv);
                itemsContainer.appendChild(itemDiv);
            });
            groupDiv.appendChild(itemsContainer);

            waffleContainer.appendChild(groupDiv);

        });

        view.appendChild(waffleContainer);
        console.log(keys);
        return view;
    }
    init() {
        console.log('init waffle');
        PS.setSubs([
            ['hoverPrimaryGroup', this.highlightGroup.bind(this)],
            ['unHoverPrimaryGroup', this.highlightGroup.bind(this)],
            ['selectPrimaryGroup', this.showGroupDetails.bind(this)],
        ]);
        function itemClickHandler(){
            if ( this.parentElement.parentElement.classList.contains(s.showDetails) || this.parentElement.parentElement.parentElement.classList.contains(s.showAllDetails) ){
                S.setState('selectHIA', +this.dataset.id);
            }
        }
        function itemMouseenter(){
            if ( this.parentElement.parentElement.classList.contains(s.showDetails) || this.parentElement.parentElement.parentElement.classList.contains(s.showAllDetails) ){
                this._tippy.show();
            }
        }
        function itemMouseleave(){
            this._tippy.hide();
        }
        function announceMouseEnter() {
            // TO DO: base this logic on state rather than on DOM
            if (!this.classList.contains(s.showDetails) && !this.parentElement.classList.contains(s.showAllDetails)) {
                
                this._tippy.show();
            }
            S.setState('hoverPrimaryGroup', this.dataset.group, { forceChange: true });
        }

        function announceMouseLeave() {
            if (!this.classList.contains(s.showDetails) && !this.parentElement.classList.contains(s.showAllDetails)) {
                //this._tippy.destroy();
                this._tippy.hide();
            }
            S.setState('unHoverPrimaryGroup', this.dataset.group, { forceChange: true });
        }
        document.querySelectorAll('.' + s.groupDiv).forEach(group => {
            this.setTippys(group);
            group.addEventListener('mouseenter', announceMouseEnter);
            group.addEventListener('mouseleave', announceMouseLeave);
            group.addEventListener('click', this.clickHandler);
        });
        document.querySelectorAll('.' + s.itemDiv).forEach(item => {
            this.setItemTippy(item);
            item.addEventListener('mouseenter', itemMouseenter);
            item.addEventListener('mouseleave', itemMouseleave);
            item.addEventListener('click', itemClickHandler);
        });
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    showGroupDetails(msg, data){
        var currentDetails = document.querySelector('.' + s.showDetails);
        if ( currentDetails ){
            currentDetails.classList.remove(s.showDetails);
        }
        var selector = `.${s.groupDiv}[data-group="${data}"`;
        var node = document.querySelector(selector);
        if (node) {
            node.classList.add(s.showDetails)
        }
    }
    setTippys(group) {
        tippy(group, {
            content: `<strong>${group.dataset.count} HIA${+group.dataset.count > 1 ? 's' : ''}</strong><br />Click for details`,
            trigger: 'manual',
            offset: '0, -100'
        });
    }
    setItemTippy(item){
        tippy(item, {
            content: `<strong>${item.dataset.title}</strong><br />Click for details`,
            trigger: 'manual'
        });
    }
    highlightGroup(msg, data) {
        var selector = `.${s.groupDiv}[data-group="${data}"`;
        var node = document.querySelector(selector);
        if (node) {
            if (msg === 'hoverPrimaryGroup') {
                node.classList.add(s.isHighlighted);
            }
            if (msg === 'unHoverPrimaryGroup') {
                node.classList.remove(s.isHighlighted);
            }
        }
    }
    clickHandler(e) {
        e.stopPropagation();
        console.log('click group');
        S.setState('selectPrimaryGroup', this.dataset.group);

    }
}