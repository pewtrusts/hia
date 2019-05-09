
//utils
//import Papa from 'papaparse';
import { stateModule as S } from 'stateful-dead';

import { publishWindowResize } from '@Utils';

//data ( CSVs loaded by file-loader for use by Papaparse at build and runtime. that's set in webpack.common.js )
//import data from './data/data.csv';

//views
//import ComparisonView from './views/state-comparison/';
//import FiftyStateView from './views/fifty-state/';

// app prototype
import PCTApp from '@App';

//static content
//import sections from './partials/sections.html';
//import footer from './partials/footer.html';

publishWindowResize(S);


const model = {
 
};

const views = [];

//var scrollPosition = 0;

function getRuntimeData(){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
    /*
    var publicPath = '';
    if ( process.env.NODE_ENV === 'production' && !window.IS_PRERENDERING ){ // production build needs to know the public path of assets
                                                                             // for dev and preview, assets are a child of root; for build they
                                                                             // are in some distant path on sitecore
        publicPath = PUBLICPATH; // TODO: set PUBLICPATH using define plugin in webpack.build.js
    }
    return new Promise((resolve, reject) => {
        var appContainer = this.el;
        Papa.parse(publicPath + data, {
            download: true,
            dynamicTyping: true,
            header: true,
            fastMode: true, // no string escapes
            skipEmptyLines: true,
            beforeFirstChunk(chunk){ // on prerender, do simple hash of CSV contents and append as attribute of the app container
                                     // at runtime, do same hash of csv contents and compare to original. if hashes match, app will
                                     // continue normally. if mismatched, app will rerender all components based on the new data.
                                     // this allows for `hot` updating of the main data file without rebuilding the dist/ folder.
                                     // `model.isMismatch` will be set to `true` and the prerendering functions will check that value
                                     // and respond accordingly

                var dataHash = chunk.hashCode(); // hashCode is helper function from utils, imported and IIFE'd in index.js
                if ( window.IS_PRERENDERING ){
                    appContainer.setAttribute('data-data-hash', dataHash);
                } else if ( process.env.NODE_ENV !== 'development' && dataHash.toString() !== appContainer.getAttribute('data-data-hash') ){
                    appContainer.setAttribute('data-data-mismatch',true);
                    console.log('data mismatch');
                    model.isMismatched = true; // set so that components can access this value 
                }
            },
            complete: response => { // arrow function here to keep `this` context as StateDebt
                
                views.length = 0;  // HERE YOU NEED TO NEST BY USING THE THE GROUP THAT THE VALUE MAPS TO
                var data = response.data;
                // complete model based on fetched data 
                model.data = data;
                model.types.forEach(type => {
                    if ( type.type !== 'text'){
                        let dataArray = data.map(d => d[type.field]).filter(d => d !== null); 
                        type.max = Math.max(...dataArray);
                        type.min = Math.min(...dataArray);
                        type.spread = type.max - type.min;
                        type.crossesZero = type.max * type.min <= 0;
                    }
                });
                model.typesNested = d3.nest().key(d => d.group).entries(model.types);
                console.log(model);
                // ....
               
                // push views now that model is complete 
                
                views.push(
                    this.createComponent(model, ComparisonView, 'div#comparison-view', {renderToSelector: '#section-comparison .js-inner-content', rerenderOnDataMismatch: true, parent: this}),  
                    this.createComponent(model, FiftyStateView, 'div#fifty-state-view', {renderToSelector: '#section-states .js-inner-content', rerenderOnDataMismatch: true, parent: this})  
                );
                
                resolve(true);
            },
            error: function(error){
                reject(error);
            }
        });
    });*/
}

export default class StateDebt extends PCTApp {
    prerender(){
        console.log('prerender');
        
        getRuntimeData.call(this).then(() => { // bind StateDebt as context `this` for getRuntimeData so that it can acceess this.el, etc
            console.log(model);
            
            views.forEach(view => {
                view.container.appendChild(view.el); // different here from CapeTown: views aren't appended to app container; some static content
                                                     // is present already. views appended to *their* containers
            });
            //this.container.classList.add('rendered');
        });
    }
    init(){
        console.log('init');
        super.init();
        getRuntimeData.call(this).then(() => {
            views.forEach(view => {
               view.init(this);                    
            });
        });                                
    }
}