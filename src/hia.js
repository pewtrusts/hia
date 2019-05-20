/* global process */
//utils
import Papa from 'papaparse';
//import { stateModule as S } from 'stateful-dead';

//import { publishWindowResize } from '@Utils';

//data 
import sections from './data/sections.json';
import stateAbbreviations from './data/state-abbreviations.json';

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

// some of the data has multiple values in a field. some of these need to be separated out so they can be
// visualized separately. identify those fields here
const fieldsThatNeedToBeArrays = ['decisionMakingLevels','driversOfHealth','organizationTypes','sectors'];

const model = {
    sections,
    stateAbbreviations
};

function cleanHeaderRow(match){
    var headers = match.split(',');
    return headers.map(function(each){
        return each.replace('/Geographic Scope', '').replace('/', ' or ').replace('HIA ', '').replace('-', ' ').doCamelCase();
    }).join(',');
}

function getRuntimeData() {
    return new Promise((resolveWrapper, rejectWrapper) => {
        Papa.parse('http://www.pewtrusts.org/api/hipmapapi/getdownload?resourceTypes=HIA%20reports&sortBy=relevance&sortOrder=asc&loadAllPages=true&pageId={d9dc47f1-2c76-444a-b4e3-b60d29bb3237}', {
            beforeFirstChunk: function(chunk){
                var newChunk = chunk.replace(/.*/, function(match){
                    return cleanHeaderRow(match);
                });
                return newChunk;
            },
            complete: function(results){
                resolveWrapper(results.data);
            },
            download: true,
            error: function(error, file){
                rejectWrapper({error,file});
            },
            header: true,
            transform: function(value, headerName){
                if (fieldsThatNeedToBeArrays.indexOf(headerName) !== -1){
                    return value.split(',');
                }
                return value;
            }
        });
    });
    /*  this fn gets the data from the API set up for the HIA data tool. it's wrapped in another Promise to give easier control over over resolve and reject
        resolves with the JSON response */
    /*return new Promise((resolveWrapper, rejectWrapper) => {
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
    });*/

}

export default class HIA extends PCTApp {
    prerender() {
        getRuntimeData.call(this).then((v) => { 
            model.data = v;
            /* set data-hash attribute on container on prerender. later on init the hash will be compared against the data fetched at runtime to see
               if it is the same or not. if note the same, views will have to be rerendered. */
            this.model = model;
            this.el.setAttribute('data-data-hash', JSON.stringify(v).hashCode()); // hashCode is helper function from utils, imported and IIFE'd in index.js
            this.summarizeData();
            this.pushViews();
            Promise.all(this.views.map(view => view.isReady)).then(() => {
                if ( process.env.NODE_ENV === 'development' ){
                    this.init();
                } else { //App.prerender is call only if env = development or window isPrerendering so here window is prerendering
                    document.dispatchEvent(new Event('all-views-ready'));
                }
            });
        });
    }
    init() {
        console.log('init App!');
        this.views.length = 0;
        console.log(this.views);
        super.init();

        getRuntimeData.call(this).then((v) => {
            model.data = v;
            this.model = model;
            if ( this.el.dataset.dataHash != JSON.stringify(v).hashCode() ){
                this.el.setAttribute('data-data-mismatch', true);
                this.model.isMismatched = true;
            }
            this.summarizeData();

            this.pushViews();
            this.views.forEach(view => {
               console.log('about to init:', view);
               view.init(this);
            });
        });
        console.log(model);
    }
    pushViews(){
        this.views.push(
            this.createComponent(MenuView, 'div#menu-view'),
            this.createComponent(SectionView, 'div#section-view')
        );
    }
    summarizeData(){
        /* to do */
        /* this fn will calculate any summaries necessary for the app such an min and max, average, etc*/
        console.log(this.model.data);
    }
}