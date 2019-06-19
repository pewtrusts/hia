var APIdata = fetch('https://www.pewtrusts.org/api/hipmapapi/getresults?pageId=d9dc47f1-2c76-444a-b4e3-b60d29bb3237&q=&sortBy=relevance&sortOrder=asc&page=1&loadAllPages=true&resourceTypes%5B%5D=HIA%20reports')
        .then(function(response){
            return response.json();
        });
console.log(APIdata);
onmessage = async e => {
    var data = await APIdata;
    var title = e.data;
    var match = data.results.find(d => d.title === title);
    var url = match.url;
    var lang = match.language;
    postMessage([url, lang]);
};