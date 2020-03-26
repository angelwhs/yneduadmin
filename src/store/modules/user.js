import { loginByAccount, getUserInfo } from '../../api/login.js';
import Cookies from 'js-cookie';

import { Cookies_MomoUserToken } from '../../global/globalString';

import { SET_USER_TOKEN, SET_USER_MOBILE, SET_USER_NICKNAME, SET_USER_HEADIMGURL, SET_USER_ACCOUNT, SET_USER_MENUS } from '../mutation-types';


const user = {
    state: {
        account: '',
        mobile_encode: '',
        mobile: '',
        uid: undefined,
        auth_type: '',
        token: Cookies.get(Cookies_MomoUserToken),
        nick_name: '',
        headimg_url: '',
        openid: '',
        statistical_data: null,
        menus: [],
    },

    //Getter 会暴露为 store.getters 对象，你可以以属性的形式访问这些值
    getters: {
        userInfo: state => {
            if(state.nick_name === undefined || state.nick_name === null || state.nick_name === '') {

            }
            return state;
        },
    },

    mutations: {
        SET_USER_TOKEN: (state, token) => {
            state.token = token;
        },
        SET_USER_NICKNAME: (state, nickname) => {
            state.nick_name = nickname;
        },
        SET_USER_MOBILE: (state, mobile) => {
            state.mobile = mobile;
        },
        SET_USER_OPENID: (state, openid) => {
            state.openid = openid;
        },
        SET_USER_HEADIMGURL: (state, headimg_url) => {
            state.headimg_url = headimg_url;
        },
        SET_USER_ACCOUNT: (state, account) => {
            state.account = account;
        },
        SET_USER_MENUS: (state, menus) => {
            state.menus = menus;
        },
    },

    actions: {
        LoginByAccount({ commit }, userInfo) {
            let account = userInfo.account;
            let password = userInfo.password;
            return new Promise((resolve, reject) => {
                loginByAccount(account, password).then(data => {
                    if (data.errorcode === 0) {
                        Cookies.set(Cookies_MomoUserToken, data.result.Token);
                        commit(SET_USER_TOKEN, data.result.Token);
                        commit(SET_USER_NICKNAME, data.result.NickName);
                        //console(data.result.Token);
                        resolve(data);
                    } else {
                        resolve(data);
                    }
                }).catch(function (error) {
                    reject(error);
                });
            });

        },

        GetUserInfo({ commit }) {
            return new Promise((resolve, reject) => {
                getUserInfo().then(data => {
                    if (data.errorcode === 0) {

                        //console.log(data.userInfo.NickName);
                        commit(SET_USER_NICKNAME, data.result.UserNickName);
                        commit(SET_USER_HEADIMGURL, data.result.HeadImgurl);
                        commit(SET_USER_ACCOUNT, data.result.Account);
                        commit(SET_USER_MENUS, data.result.Modules);
                        //console.log(data.result);
                        resolve(data);
                    } else {
                        resolve(data);
                    }
                }).catch(function (error) {
                    reject(error);
                });
            });
        },



    },
};

export default user;