import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '@/views/login/index.vue';

import HomeIndex from '@/views/home/index.vue';


import store from "@/store";

Vue.use(Router)

const router = new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeIndex,
            meta: {
                index: 0,
                title: '首页',
                keepAlive: true,
                mustLogin: true,
            },
            redirect: "/",
            children: [
                {
                    path: "/403",
                    name: "Forbidden",
                    meta: { title: "Access Denied", hiddenInMenu: true },
                    component: () => import(/* webpackChunkName: "error-403" */ "@/views/error/Deny.vue")
                },

                {
                    path: "/",
                    name: "Dashboard",
                    meta: { title: "首页", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "dashboard" */ "@/views/Dashboard.vue")
                },
                {
                    path: "/permission/role",
                    name: "RoleManage",
                    meta: { title: "角色管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/permission/role.vue")
                },
                {
                    path: "/permission/module",
                    name: "ModuleManage",
                    meta: { title: "菜单管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/permission/module.vue")
                },
                {
                    path: "/permission/apipermission",
                    name: "APIManage",
                    meta: { title: "接口管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/permission/apipermission.vue")
                },
                {
                    path: "/permission/useraccount",
                    name: "UserAccountManage",
                    meta: { title: "账号管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/user/useraccount.vue")
                },
                {
                    path: "/cms/contentsection",
                    name: "ContentSectionManage",
                    meta: { title: "栏目管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/cms/contentsection.vue")
                },
                {
                    path: "/cms/articletag",
                    name: "ArticleTagManage",
                    meta: { title: "文章标签", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/cms/articletag.vue")
                },
                {
                    path: "/cms/article",
                    name: "ArticleManage",
                    meta: { title: "文章管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/cms/article.vue")
                },
                {
                    path: "/cms/articlecomment",
                    name: "ArticleManage",
                    meta: { title: "评论管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/cms/articlecomment.vue")
                },
                {
                    path: "/cms/contentaudit",
                    name: "ArticleManage",
                    meta: { title: "审核管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/cms/contentaudit.vue")
                },

                //web settings
                {
                    path: "/websettings/navigationbar",
                    name: "NavigationBarManage",
                    meta: { title: "导航栏管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/websettings/navigationbar.vue")
                },
                {
                    path: "/websettings/navigationbar/items/:id",
                    name: "NavigationBarItemsManage",
                    meta: { title: "导航栏项", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/websettings/navigationbaritems.vue")
                },
                {
                    path: "/websettings/pagelayout",
                    name: "PageLayoutManage",
                    meta: { title: "页面管理", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/websettings/pagelayout.vue")
                },
                {
                    path: "/websettings/pagelayout/items/:id",
                    name: "PageLayoutItemsManage",
                    meta: { title: "页面项", group: "apps", icon: "dashboard" },
                    component: () => import(/* webpackChunkName: "role" */ "@/views/websettings/pagelayoutitems.vue")
                },
                
            ],
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
            meta: {
                index: 0,
                title: '登录',
                keepAlive: false,
                mustLogin: false,
            },
        },
        

    ]
});

router.beforeEach((to, from, next) => {
    let isNext = false;

    //判断url中是否有i参数(学校id), 如果没有, 跳转到选择学校页面
    if (to.name === 'login') {
        isNext = true;
    }

    if (to.meta !== undefined && to.meta !== null && to.meta.mustLogin && to.name !== 'login') {
        //判断用户是否已经登录
        let isLogin = false;

        if (store.state.user.token !== undefined && store.state.user.token !== null && store.state.user.token !== '') {
            isLogin = true;
        }

        if (!isLogin) {
            next({
                name: 'login',
                params: {
                    returnurl: to.fullPath,
                },
            });
        }
    }


    if (isNext) {
        next();
    }
    next();
})

export default router;