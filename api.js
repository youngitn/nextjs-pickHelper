import axios from 'axios';
const cors = 'https://cors-anywhere.herokuapp.com/'; // use cors-anywhere to fetch api data
const url = 'https://cloud.culture.tw/frontsite/trans/'; // origin api url
// User相關的 api
const userRequest = axios.create({
    baseURL: `${url}`,


});
// 文章相關的 api
const articleRequest = axios.create({
    baseURL: 'https://api/article/'
});
// 搜尋相關的 api
const searchRequest = axios.create({
    baseURL: 'https://api/search/'
});


const TWVPt100Request = axios.create({
    baseURL: 'http://192.168.0.5/wstopprd/ws/r/awsp920'
});

/**
 * T100 web service 產生出貨單
 * */
export const apiTWVPt100 = data => TWVPt100Request.post('', {
    "key": "f5458f5c0f9022db743a7c0710145903",
    "type": "sync",
    "host": {
        "lang": "zh_TW",
        "acct": "tiptop",
    },
    "service": {
        "name": "web.shipper.create",
    },
    "datakey": {
        "EntId": 100,
        "CompanyId": "TWVP",
    },
    "payload": {
        "std_data": {
            "parameter": {
                "shipper_notice": data.shipperNotice,
                "shipper_detail": data.shipperDetail
            }
        }
    }
});

// User 相關的 api
export const apiUserLogin = () => userRequest.get('/SearchShowAction.do?method=doFindTypeJ&category=5');
export const apiUserLogout = data => userRequest.post('/signOut', data);
export const apiUserSignUp = data => userRequest.post('/signUp', data);

// 文章相關的 api
export const apiArticleItem = () => articleRequest.get('/ArticleItem');
export const apiArticleMsg = data => articleRequest.post('/ArticleMsg', data);
export const apiArticleLink = data => articleRequest.post('/ArticleLink', data);

// 搜尋相關的 api
export const apiSearch = data => searchRequest.get(`/Search?searchdata=${data}`);
export const apiSearchType = () => searchRequest.get(`/SearchType`);