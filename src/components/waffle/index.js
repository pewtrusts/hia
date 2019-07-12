import Element from '@UI/element';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
import tippy from 'tippy.js';

//import { GTMPush } from '@Utils';






export default class Waffle extends Element {

    prerender() {
        //container
        var view = super.prerender();
        this.name = 'Waffle';
        this.nestedData = this.model.nestBy[this.data.primary];
        this.secondary = this.model.fields.find(s => s.key === this.data.primary).secondaryDimensions[0];
        
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        view.classList.add(s.waffle);

        var anchor = document.createElement('div');
        anchor.classList.add(s.anchor, 'js-anchor');
        view.appendChild(anchor);

        //container
        var waffleContainer = document.createElement('div');
        waffleContainer.classList.add(s.waffleContainer, 'js-waffle-container-inner');

        this.render().forEach(group => {
            waffleContainer.appendChild(group)
        });
        

        view.appendChild(waffleContainer);
        
        return view;
    }
    render(){
        //groups
        var groups = [];
        function returnMatchingValuesLength(ab) {
            var match = this.model.fields.find(f => f.key === this.secondary);
            if ( match.order ) { // if an order for the secondary fields is hard coded
                return ab[this.secondary][0] !== '' ? -match.order.indexOf(ab[this.secondary][0]) : -9999;
            }
            return ab[this.secondary][0] !== '' ? this.model.nestBy[this.secondary].find(d => d.key === ab[this.secondary][0]).values.length : -9999;
        }
        this.nestedData.forEach(group => {
            var groupDiv = document.createElement('div');
            var width = Math.min(Math.ceil(Math.sqrt(group.values.length)) * 28, 15 * 28);

            groupDiv.dataset.group = group.key;
            groupDiv.dataset.count = group.values.length;
            groupDiv.classList.add(s.groupDiv, 'js-group-' + this.app.cleanKey(group.key));
            groupDiv.insertAdjacentHTML('afterbegin', `<h3 style="width: ${width}px;" class="${s.groupDivHeading}">${group.key !== '' ? group.key : '[blank]'}<br /><span class="${s.itemCount}">${group.values.length}</span></h2>`);

            //anchor
            var anchor = document.createElement('div');
            anchor.classList.add(s.groupAnchor);
            anchor.id = 'anchor-' + this.app.cleanKey(group.key);
            groupDiv.appendChild(anchor);

            var itemsContainer = document.createElement('div');
            itemsContainer.classList.add(s.itemsContainer);
            itemsContainer.style.width = width + 'px';

            // line above sets width of each so that each is as close to a square as possible
            group.values.sort((a, b) => returnMatchingValuesLength.call(this, b) - returnMatchingValuesLength.call(this, a));
            group.values.forEach((value) => {
                //items
                var itemDiv = document.createElement('div');
                var cleanSecondary = this.app.cleanKey(value[this.secondary]);
                var nested = this.model.nestBy[this.secondary];
                var matchingString = typeof value[this.secondary] === 'string' ? value[this.secondary] : value[this.secondary][0];
                var indexOfSecondaryValue = nested.findIndex(s => s.key === matchingString);
                itemDiv.classList.add(s.item, 'waffle-item');
                itemDiv.classList.add(cleanSecondary, s[this.app.cleanKey(value.status)],'secondary-' + indexOfSecondaryValue);
                if ( typeof value[this.secondary] !== 'string' ) {
                    value[this.secondary].forEach(value => {
                        itemDiv.classList.add('match-secondary-' + nested.findIndex(s => s.key === value));
                    });
                }
                itemDiv.dataset.title = value.title;
                itemDiv.dataset.id = value.id;
                itemDiv.dataset.secondaries = JSON.stringify(value[this.secondary]);
                //itemDiv.dataset.tippyContent = value.Title;
                //tippy(itemDiv);
                itemsContainer.appendChild(itemDiv);
            });
            groupDiv.appendChild(itemsContainer);

            groups.push(groupDiv);

        });
        return groups;
    }
    updateSecondary(msg,data){ // TO DO: animate secondary dimension changes

        var nodeShowingDetails = document.querySelector('.' + s.showDetails);
        var groupShowingDetails = nodeShowingDetails ? nodeShowingDetails.dataset.group : null;

        
        //destroy
        var container = document.querySelector('.js-waffle-container-inner');
        container.innerHTML = '';

        //set new secondary
        this.secondary = data;

        //rerender
        this.render().forEach(group => {
            container.appendChild(group)
        });

        if ( groupShowingDetails ){
            document.querySelector('.js-group-' + this.app.cleanKey(groupShowingDetails)).classList.add(s.showDetails);
        }

        //reinitialize
        this.initGroupsAndItems();
        this.highlightMatchingSecondary('reset');

    }
    updatePrimary(msg,data){
        this.nestedData = this.model.nestBy[data];
        this.secondary = this.model.fields.find(s => s.key === data).secondaryDimensions[0];

        var waffleContainer = document.querySelector('.js-waffle-container-inner');
        waffleContainer.innerHTML = '';

        this.render().forEach(group => {
            waffleContainer.appendChild(group)
        });
        this.initGroupsAndItems();
        this.initIntersectionObserver();
        this.highlightMatchingSecondary('reset');
    }
    init() {
        this.waffleContainer = this.el.querySelector('.js-waffle-container-inner');
        
        
        PS.setSubs([
            ['hoverPrimaryGroup', this.highlightGroup.bind(this)],
            ['unHoverPrimaryGroup', this.highlightGroup.bind(this)],
            ['selectSecondaryDimension', this.updateSecondary.bind(this)],
            ['view', this.updatePrimary.bind(this)],
            ['highlightSecondary', this.highlightMatchingSecondary.bind(this)],
            ['selectPrimaryGroup', this.scrollToGroup.bind(this)],
            ['selectPrimaryGroup', this.highlightGroup.bind(this)]
        ]);
        
        this.initGroupsAndItems();
        this.initIntersectionObserver();
    }
    scrollToGroup(msg,data){
        console.log(data);
        document.querySelector('#anchor-' + this.app.cleanKey(data)).scrollIntoView({behavior: 'smooth'});
    }
    initIntersectionObserver(){
        function callback(entries){
            if ( entries[0].isIntersecting ){
                S.setState('legendIsMobile', true);
            } else {
                S.setState('legendIsMobile', false);
            }
        }
        this.anchor = this.el.querySelector('.js-anchor');
        var observer = new IntersectionObserver(callback);//, {threshold: buildThresholdList()});
        observer.observe(this.anchor);
    }
    highlightMatchingSecondary(msg, data){
        if ( msg !== 'reset' ) {
            if ( data !== null ) {
                this.waffleContainer.classList.add('match-secondary-' + data);
            } else {
                let currentIndex = S.getPreviousState('highlightSecondary');
                this.waffleContainer.classList.remove('match-secondary-' + currentIndex);
            }
        } else {
            let currentIndex = S.getState('highlightSecondary');
            this.waffleContainer.classList.remove('match-secondary-' + currentIndex);
        }
    }
    initGroupsAndItems(){
        this.groups = document.querySelectorAll('.' + s.groupDiv);
        function itemClickHandler(){
                S.setState('selectHIA', +this.dataset.id);
        }
        function itemMouseenter(){
                this._tippy.show();
        }
        function itemMouseleave(){
            this._tippy.hide();
        }
        document.querySelectorAll('.' + s.item).forEach(item => {
            this.setItemTippy(item);
            item.addEventListener('mouseenter', itemMouseenter);
            item.addEventListener('mouseleave', itemMouseleave);
            item.addEventListener('click', itemClickHandler);
        });
    }
    setTippys(group) {

        tippy(group, {
            content: `<strong>${group.dataset.count} HIA${+group.dataset.count > 1 ? 's' : ''}</strong><br />Click for details`,
            trigger: 'manual',
            offset: '0, -100'
        });
    }
    setItemTippy(item){
        var nested = this.model.nestBy[this.secondary];        
        var indicators = JSON.parse(item.dataset.secondaries).reduce((acc, cur) => {
            if ( cur !== '' ) {
                return acc + `<div class="${s.indicator} secondary-${nested.findIndex(s => s.key === cur)}"></div>`
            } else {
                return acc + `<div class="${s.indicator} none"></div>`
            }
        },'');
        tippy(item, {
            content: `<strong>${item.dataset.title}</strong><br /><span class="flex space-between"><span>Click for details</span><span class="${s.indicatorsGroup}">${indicators}</span>`,
            trigger: 'manual'
        });
    }
    highlightGroup(msg, data) {
        var selector = `.${s.groupDiv}[data-group="${data}"`;
        var node = document.querySelector(selector);
        var oldNode = document.querySelector('.' + s.isHighlighted);
        if (node) {
            if (msg !== 'hoverPrimaryGroup') {
                if ( oldNode ){
                    oldNode.classList.remove(s.isHighlighted);
                }
                node.classList.add(s.isHighlighted);
                if ( msg.split('.')[0] === 'selectPrimaryGroup' ){
                    this.groups.forEach(group => {
                        group.classList.add(s.isNotHighlighted);
                        setTimeout(() => {
                            group.classList.remove(s.isNotHighlighted);
                        },2000);
                    });
                    setTimeout(() => {
                        node.classList.remove(s.isHighlighted);
                        S.setState(msg, null);
                    },2000);
                }
            } else {
                node.classList.remove(s.isHighlighted);
            }
        }
    }
    clickHandler(e) {
        e.stopPropagation();
        
        S.setState('selectPrimaryGroup', this.dataset.group);

    }
}