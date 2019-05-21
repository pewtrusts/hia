import Element from '@UI/element';
import s from './styles.scss';
//import { stateModule as S } from 'stateful-dead';
//import { GTMPush } from '@Utils';


const keys = new Set();


export default class Waffle extends Element {

    prerender() {
        //container
        var view = super.prerender();
        this.name = 'Waffle';
        this.dataMap = {
            stateOrTerritory: {
                data: this.model.nestBy.stateOrTerritory,
                secondary: 'organizationTypes'
            }
        }
        if (this.prerendered && !this.rerender) {
            return view; // if prerendered and no need to render (no data mismatch)
        }
        var nestedData = this.dataMap[this.data.primary].data;
        var secondary = this.dataMap[this.data.primary].secondary;

        //container
        var waffleContainer = document.createElement('div');
        
        //groups
        nestedData.forEach(group => {
            var groupDiv = document.createElement('div');
            groupDiv.classList.add(s.groupDiv);
            groupDiv.insertAdjacentHTML('afterbegin', `<h2 class="${s.groupDivHeading}">${group.key !== '' ? group.key : '[blank]'} &ndash; <span class="${s.itemCount}">${group.values.length}</span></h2>`);
            

            var itemsContainer = document.createElement('div');
            itemsContainer.classList.add(s.itemsContainer);
            itemsContainer.style.width = Math.ceil(Math.sqrt(group.values.length)) * 28 + 'px';
            
            // line above sets width of each so that each is as close to a square as possible

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
        /* to do*/

        //subscribe to secondary dimension , drilldown, details
    }
    clickHandler() {
        /* to do */

    }
} 