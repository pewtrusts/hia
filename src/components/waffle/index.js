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

            //showAllDetails
        var showAllDetails = document.createElement('button');
        showAllDetails.classList.add('js-show-all-details', s.showAllDetails);
        showAllDetails.textContent = this.updateShowAllDetails(this.data.primary);
        view.appendChild(showAllDetails);

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
        this.showAllDetails.textContent = this.updateShowAllDetails(data);
        this.initGroupsAndItems();
        this.initIntersectionObserver();
        this.highlightMatchingSecondary('reset');
    }
    init() {
        this.waffleContainer = this.el.querySelector('.js-waffle-container-inner');
        this.showAllDetails = document.querySelector('.js-show-all-details');
        
        
        PS.setSubs([
            ['hoverPrimaryGroup', this.highlightGroup.bind(this)],
            ['unHoverPrimaryGroup', this.highlightGroup.bind(this)],
            ['selectPrimaryGroup', this.showGroupDetails.bind(this)],
            ['showAllDetails', this.toggleShowAll.bind(this)],
            ['selectSecondaryDimension', this.updateSecondary.bind(this)],
            ['view', this.updatePrimary.bind(this)],
            ['highlightSecondary', this.highlightMatchingSecondary.bind(this)]
        ]);
        function showAllDetailsHandler(e){
            e.stopPropagation()
            if ( this.dataset.isOn === 'true' ){
                S.setState('showAllDetails', false);

                this.innerText = this.innerText.replace('Hide','Show');
                this.dataset.isOn = false;
            } else {
                S.setState('showAllDetails', true);
                
                this.innerText = this.innerText.replace('Show','Hide'); 
                this.dataset.isOn = true;
            }
        }
        document.querySelector('.' + s.showAllDetails).addEventListener('click', showAllDetailsHandler);
        this.initGroupsAndItems();
        this.initIntersectionObserver();
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
        function itemClickHandler(){
            if ( this.parentElement.parentElement.classList.contains(s.showDetails) || this.parentElement.parentElement.parentElement.classList.contains(s.showAll) ){
                S.setState('selectHIA', +this.dataset.id);
            }
        }
        function itemMouseenter(){
            if ( this.parentElement.parentElement.classList.contains(s.showDetails) || this.parentElement.parentElement.parentElement.classList.contains(s.showAll) ){
                this._tippy.show();
            }
        }
        function itemMouseleave(){
            this._tippy.hide();
        }
        function announceMouseEnter() {
            // TO DO: base this logic on state rather than on DOM
            if (!this.classList.contains(s.showDetails) && !this.parentElement.classList.contains(s.showAll)) {
                
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
        document.querySelectorAll('.' + s.item).forEach(item => {
            this.setItemTippy(item);
            item.addEventListener('mouseenter', itemMouseenter);
            item.addEventListener('mouseleave', itemMouseleave);
            item.addEventListener('click', itemClickHandler);
        });
    }
    toggleShowAll(msg,data){
        if ( data ){
            document.querySelector('.' + s.waffleContainer).classList.add(s.showAll);
        } else {
            document.querySelector('.' + s.waffleContainer).classList.remove(s.showAll);
        }

    }
    updateShowAllDetails(primaryDimension){
        var name = this.model.fields.find(f => f.key === primaryDimension).heading;
        return `${ S.getState('showAllDetails') ? 'Hide' : 'Show' } details for all ${name.toLowerCase()}`;
    }
    showGroupDetails(msg, data){

        //handle the waffle group
        var currentDetails = document.querySelector('.' + s.showDetails);
        if ( currentDetails ){
            currentDetails.classList.remove(s.showDetails, 'js-show-details');
        }
        var selector = `.${s.groupDiv}[data-group="${data}"`;
        var node = document.querySelector(selector);
        if (node) {
            node.classList.add(s.showDetails, 'js-show-details')
        }

        //handle the showAllDetails
        if ( data ) {
            document.querySelector('.' + s.showAllDetails).classList.add(s.isVisible);
        } else {
            document.querySelector('.' + s.showAllDetails).classList.remove(s.isVisible);
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
        
        S.setState('selectPrimaryGroup', this.dataset.group);

    }
}