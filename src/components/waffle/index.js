import Element from '@UI/element';
import s from './styles.scss';
import { stateModule as S } from 'stateful-dead';
import PS from 'pubsub-setter';
//import { GTMPush } from '@Utils';


const keys = new Set();



export default class Waffle extends Element {

    prerender() {
        //container
        var view = super.prerender();
        this.name = 'Waffle';
        this.primarySecondaryMap = {
            stateOrTerritory: 'organizationTypes',
            organizationTypes: 'driversOfHealth'
        }
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        var nestedData = this.model.nestBy[this.data.primary];
        var secondary = this.primarySecondaryMap[this.data.primary];

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
                console.log(value[secondary]);
                var cleanSecondary = this.app.cleanKey(value[secondary]);
                itemDiv.classList.add(s.item);
                itemDiv.classList.add(cleanSecondary, s[cleanSecondary], s[value.fundingSource]);
                console.log(value[secondary]);
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
            ['hoverPrimary', this.highlightGroup.bind(this)],
            ['unHoverPrimary', this.highlightGroup.bind(this)]
        ]);
        function announceMouseEnter(){
            console.log('mouseenter');
            S.setState('hoverPrimary', this.dataset.group, {forceChange: true});
        }
        function announceMouseLeave(){
            console.log('mouseleave');
            S.setState('unHoverPrimary', this.dataset.group, {forceChange: true});
        }
        document.querySelectorAll('.' + s.groupDiv).forEach(group => {
            group.addEventListener('mouseenter', announceMouseEnter);
            group.addEventListener('mouseleave', announceMouseLeave);
        });
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    highlightGroup(msg,data){
        var selector = `.${s.groupDiv}[data-group="${data}"`;
        var node = document.querySelector(selector);
        if ( node && msg === 'hoverPrimary'){
            node.classList.add(s.isHighlighted);
        }
        if ( node && msg === 'unHoverPrimary'){
            node.classList.remove(s.isHighlighted);
        }


    }
    clickHandler() {
        /* to do */

    }
}