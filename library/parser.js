const axios = require('axios');
const cloudscraper = require('cloudscraper');

//FORM THE REQUEST WHICH ARE GOING TO BE DONE BASED ON str
//POP CORM AND YTS ARE FETCHED
function selectReq(type = 'popular', page = 1, search = '42') {
    let popReq = 'https://tv-v2.api-fetch.website';
    let ytsReq = 'https://yts.lt/api/v2';

    if (type === 'popular')
    {
        popReq += `/movies/${page}?sort=trending&order=-1`;
        ytsReq += `/list_movies.json?limit=50&page=${page}&quality=720p,1080pi`
            + `&sort_by=download_count`;
    }
    else if (type === 'lastadded')
    {
        popReq += `/movies/${page}?sort=last%20added&order=-1`;
        ytsReq += `/list_movies.json?limit=50&page=${page}&quality=720p,1080p`;
    }
    else if (type === 'random')
    {
        popReq += '/random/movie';
        ytsReq += `/movie_suggestions.json`
            + `?movie_id=${Math.floor(Math.random() * Math.floor(10000))}`;
    }
    else if (type === 'search')
    {
        popReq += `/movies/1?sort=last%20added&order=-1&keywords=${search}`;
        ytsReq += `/list_movies.json?query_term=${search}&quality=720p,1080p`;
    }
    return ([popReq, ytsReq]);
}

//PERFORM REQUEST AND RETURN API'S RESULTS ORDER BY POP THEN YTS
async function fetchAPI(type, page, search) {
    let error = [];
    let yts, pop;
    let [popReq, ytsReq] = selectReq(type, page, search);
    try {
        yts = await cloudscraper({
            method: 'GET',
            uri: ytsReq
        });
        yts = JSON.parse(yts);
    } catch (err) {
        if (process.env.MODE === 'DEV')
            console.error(err);
        error.push('yts');
    }
    try {
        pop = await axios.get(popReq);
    } catch (err) {
        if (process.env.MODE === 'DEV')
            console.error(err);
        error.push('pop');
    }
    if (error.length === 2)
        return ([]);
    else if (error.includes('pop'))
        return ([null, yts.data.movies]);
    else if (error.includes('yts'))
    {
        if (type === 'random')
            return ([[pop.data], null]);
        else
            return ([pop.data, null]);
    }
    else
    {
        if (type === 'random')
            return ([[pop.data], yts.data.movies]);
        else
            return ([pop.data, yts.data.movies]);
    }
}

exports.fetchAPI = fetchAPI;