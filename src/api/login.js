import { get, post, put, delect } from '@/utils/axios.js';

export function loginByAccount(account, password) {
    const params = {
        Account: account,
        Password: password,
    };

    return post('/api/identity/login/GetJwtToken3', params);
}

export function getUserInfo() {
    return get('/api/identity/login/GetUserInfo');
}