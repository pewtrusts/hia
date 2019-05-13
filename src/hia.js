//utils
//import Papa from 'papaparse';
//import { stateModule as S } from 'stateful-dead';

//import { publishWindowResize } from '@Utils';

//data 
import sections from './data/sections.json';

//views
import MenuView from './views/menu-view/';
import SectionView from './views/section-view/';
//import FiftyStateView from './views/fifty-state/';

// app prototype
import PCTApp from '@App';

//static content
//import sections from './partials/sections.html';
//import footer from './partials/footer.html';

//publishWindowResize(S);


const model = {
    sections
};

const views = [];

//var scrollPosition = 0;

function getRuntimeData() {
    /*  this fn gets the data from the API set up for the HIA data tool. it's wrapped in another Promise to give easier control over over resolve and reject
        resolves with the JSON response */
    return new Promise((resolveWrapper, rejectWrapper) => {
        return fetch('https://www.pewtrusts.org/api/hipmapapi/getresults?pageId=d9dc47f1-2c76-444a-b4e3-b60d29bb3237&q=&sortBy=relevance&sortOrder=asc&page=1&perPage=10&loadAllPages=true&resourceTypes%5B%5D=HIA%20reports')
            .then(function(response) {
                var json = response.json();
                if ([200, 301, 304].indexOf(response.status) !== -1) {
                    resolveWrapper(json);
                    return json;
                } else {
                    rejectWrapper(response.status);
                }
            });
    });
}

export default class HIA extends PCTApp {
    prerender() {
        getRuntimeData.call(this).then((v) => { 
            model.data = v.results;
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            this.el.setAttribute('data-data-hash', JSON.stringify(v.results).hashCode()); // hashCode is helper function from utils, imported and IIFE'd in index.js
            this.summarizeData();
            this.pushViews();
       /*     views.forEach(view => {
                view.container.appendChild(view.el); 
            });*/
        });
    }
    init() {
        super.init();
        getRuntimeData.call(this).then((v) => {
            model.data = v.results;
            this.model = model;
            console.log(this.el.dataset.dataHash, JSON.stringify(v.results).hashCode());
            if ( this.el.dataset.dataHash != JSON.stringify(v.results).hashCode() ){
                this.el.setAttribute('data-data-mismatch', true);
                this.model.isMismatched = true;
            }
            this.summarizeData();
            this.pushViews();
            views.forEach(view => {
                view.init(this);
            });
            console.log(this.model);
        });
    }
    pushViews(){
        views.push(
            this.createComponent(MenuView, 'div#menu-view'),
            this.createComponent(SectionView, 'div#section-view')
            //this.createComponent(model, ComparisonView, 'div#comparison-view', {renderToSelector: '#section-comparison .js-inner-content', rerenderOnDataMismatch: true, parent: this}),  
            //this.createComponent(model, FiftyStateView, 'div#fifty-state-view', {renderToSelector: '#section-states .js-inner-content', rerenderOnDataMismatch: true, parent: this})  
        );
    }
    summarizeData(){
        /* to do */
        /* this fn will calculate any summaries necessary for the app such an min and max, average, etc*/
    }
}