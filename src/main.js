import Vue from 'vue'
import store from './store';
import router from './router'
import App from './App.vue'
import vuetify from './plugins/vuetify';

import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.config.productionTip = false

//加载axios
import axiosApi from '@/utils/axios.js';
Vue.use(axiosApi);

//加载loading插件
import loading from 'vue-nice-loading'
Vue.use(loading);

import { Table, TableColumn, Tree, Cascader } from 'element-ui';
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Tree);
Vue.use(Cascader);



new Vue({
    store,
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app')

