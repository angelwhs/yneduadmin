import axios from 'axios'
import store from "../store";
import Cookies from 'js-cookie';
import qs from 'qs'
import { Cookies_MomoUserToken } from '../global/globalString';

import { baseURL } from './axiosconfig.js';

import Router from '../router/index';


// 添加请求拦截器，在发送请求之前做些什么(**具体查看axios文档**)--------------------------------------------
axios.interceptors.request.use(function (config) {

    //2019.06.13 By WHS
    //判断是否存在token，如果存在的话，则每个http header都加上Authorization
    //console.log(Cookies.get(Cookies_MomoUserToken));
    //console.log(store.state.user.token);112
    //console.log(store.state.user.mobile);
    if (store.state.user.token != null && store.state.user.token.length > 128) {
        config.headers.Authorization = "Bearer " + store.state.user.token;
    }

    

    // 显示loading
    return config
}, function (error) {
    // 请求错误时弹框提示，或做些其他事

    return Promise.reject(error)
})


// 添加响应拦截器(**具体查看axios文档**)----------------------------------------------------------------
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么，允许在数据返回客户端前，修改响应的数据
    // 如果只需要返回体中数据，则如下，如果需要全部，则 return response 即可
    //console.log(response.data);
    return response.data
}, function (error) {
    // 对响应错误做点什么
    //console.log(error);
    return Promise.reject(error)
})


// 封装数据返回失败提示函数---------------------------------------------------------------------------
function errorState(error) {
    // 隐藏loading
    // 如果http状态码正常，则直接返回数据
    if (error && error.response && (error.response.status === 200 || error.response.status === 304 || error.response.status === 400)) {
        // 如果不需要除了data之外的数据，可以直接 return response.data
        return error.response
    } else if (error && error.response && (error.response.status === 401)) {
        //console.log('401');
        Router.push({ path: '/login' });
    } else if (error && error.response && (error.response.status === 403)){
        //alert('数据获取错误' + response)
        Router.push({ path: '/403' });
    } else {
        return error.response
    }
}

// 封装数据返回成功提示函数---------------------------------------------------------------------------
function successState(res) {
    // 隐藏loading
    // 统一判断后端返回的错误码(错误码与后台协商而定)
    //console.log(res);
    if (res.errorcode === 0) {
        //alert('success')
        return res;
    }

    //必须登录
    if (res.errorcode === 401) {
        Router.push({ path: '/login' });
        //console.log(res);

    }

    //没有操作权限，跳转 /views/error/Deny 页面
    if (res.errorcode === 403) {
        //console.log('403');
        Router.push({ path: '/403' });
    }

    return res;
}


//获取baseURL，组合各个服务地址
function getBaseURL() {

}


// 封装axios--------------------------------------------------------------------------------------
function apiAxios(method, url, params) {
    let httpDefault = {
        method: method,
        baseURL: baseURL,
        url: url,
        //crossDomain: true,
        // `params` 是即将与请求一起发送的 URL 参数
        // `data` 是作为请求主体被发送的数据
        params: method === 'GET' || method === 'DELETE' ? params : null,
        //data: method === 'POST' || method === 'PUT' ? qs.stringify(params) : null,
        data: method === 'POST' || method === 'PUT' ? params : null,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'x-api-version': '1.0',
        },
    }

    // 注意**Promise**使用(Promise首字母大写)
    return new Promise((resolve, reject) => {
        //console.log(httpDefault);
        axios(httpDefault)
            // 此处的.then属于axios
            .then((res) => {
                successState(res);
                resolve(res);
            }).catch((response) => {
                errorState(response);
                reject(response);
            })
    })
}


//上传文件
function postFileApiAxios(url, fileData) {
    let httpDefault = {
        method: 'POST',
        baseURL: baseURL,
        url: url,
        //crossDomain: true,
        // `params` 是即将与请求一起发送的 URL 参数
        // `data` 是作为请求主体被发送的数据
        //params: method === 'GET' || method === 'DELETE' ? params : null,
        //data: method === 'POST' || method === 'PUT' ? qs.stringify(params) : null,
        data: fileData,
        timeout: 10000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-version': '1.0',
        },
    }

    // 注意**Promise**使用(Promise首字母大写)
    return new Promise((resolve, reject) => {
        //console.log(httpDefault);
        axios(httpDefault)
            // 此处的.then属于axios
            .then((res) => {
                successState(res);
                resolve(res);
            }).catch((response) => {
                errorState(response);
                reject(response);
            })
    })
}


export let get = (url, params) => { return apiAxios('GET', url, params) }
export let post = (url, params) => { return apiAxios('POST', url, params) }
export let put = (url, params) => { return apiAxios('PUT', url, params) }
export let delect = (url, params) => { return apiAxios('DELECT', url, params) }


// 输出函数getAxios、postAxios、putAxios、delectAxios，供其他文件调用-----------------------------
// Vue.js的插件应当有一个公开方法 install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
export default {
    install: function (Vue) {
        Vue.prototype.getAxios = (url, params) => apiAxios('GET', url, params)
        Vue.prototype.postAxios = (url, params) => apiAxios('POST', url, params)
        Vue.prototype.putAxios = (url, params) => apiAxios('PUT', url, params)
        Vue.prototype.delectAxios = (url, params) => apiAxios('DELECT', url, params)
        Vue.prototype.postFileAxios = (url, filedata) => postFileApiAxios(url, filedata)
    },
}

