<template>
    <v-navigation-drawer class="app--drawer" :mini-variant.sync="mini" app v-model="showDrawer" :width="drawWidth">
        <v-app-bar color="primary darken-1" dark>
            <img src="../../static/m.png" height="36" alt="" />
            <v-toolbar-title class="ml-0 pl-3">
                <span class="hidden-sm-and-down">管理后台</span>
            </v-toolbar-title>
        </v-app-bar>
        <v-list expand nav dense>
            <!-- <v-list-item-group expand v-model="currentPath"> -->
            <template v-for="item1 in menulist">
                <template v-if="item1.Childs && item1.Childs.length > 0">
                    <v-list-group no-action :prepend-icon="item1.Pic_Big" :value="item1.Active">
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title class="subtitle-2">{{item1.Display_Text}}</v-list-item-title>
                            </v-list-item-content>
                        </template>
                        <template v-for="item2 in item1.Childs">
                            <template
                                v-if="item2.Childs && item2.Childs.length > 0 && item2.Childs[0].ModuleType === 1">
                                <v-list-group no-action sub-group :value="item2.Active">
                                    <template v-slot:activator>
                                        <v-list-item-content>
                                            <v-list-item-title class="subtitle-2">{{item2.Display_Text}}
                                            </v-list-item-title>
                                        </v-list-item-content>
                                    </template>
                                    <template v-for="item3 in item2.Childs">
                                        <template
                                            v-if="item3.Chlids && item3.Childs.length > 0 && item3.Childs[0].ModuleType === 1">
                                            <v-list-group no-action sub-group :value="item3.Active">
                                                <template v-slot:activator>
                                                    <v-list-item-content>
                                                        <v-list-item-title class="subtitle-2 pl-9">{{item3.Display_Text}}
                                                        </v-list-item-title>
                                                    </v-list-item-content>
                                                </template>
                                            </v-list-group>
                                        </template>
                                        <template v-else>

                                            <v-list-item v-if="item3.ModuleType === 1" :to="{path: item3.FormName}"
                                                :key="item3.Id">
                                                <v-list-item-title class="subtitle-2  pl-6">{{item3.Display_Text}}
                                                </v-list-item-title>
                                                <v-list-item-icon v-if="item3.Pic_Big">
                                                    <v-icon>{{item3.Pic_Big}}</v-icon>
                                                </v-list-item-icon>
                                            </v-list-item>

                                        </template>
                                    </template>
                                </v-list-group>
                            </template>
                            <template v-else>

                                <v-list-item v-if="item2.ModuleType === 1" :to="{path: item2.FormName}" :key="item2.Id">
                                    <v-list-item-title class="subtitle-2 pl-3">{{item2.Display_Text}}</v-list-item-title>
                                    <v-list-item-icon v-if="item2.Pic_Big">
                                        <v-icon>{{item2.Pic_Big}}</v-icon>
                                    </v-list-item-icon>
                                </v-list-item>

                            </template>
                        </template>
                    </v-list-group>
                </template>
                <template v-else>

                    <v-list-item v-if="item1.ModuleType === 1" :to="{path: item1.FormName}">
                        <v-list-item-icon>
                            <v-icon>{{item1.Pic_Big}}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="subtitle-2">{{item1.Display_Text}}</v-list-item-title>
                    </v-list-item>

                </template>
            </template>
            <!-- </v-list-item-group> -->

        </v-list>



        <!-- <vue-perfect-scrollbar class="drawer-menu--scroll" :settings="scrollSettings">
            
        </vue-perfect-scrollbar> -->
    </v-navigation-drawer>
</template>
<script>
    import menu from '@/api/menu';
    import VuePerfectScrollbar from 'vue-perfect-scrollbar';

    export default {
        name: "AppDrawer",
        components: {
            VuePerfectScrollbar
        },
        props: {
            expanded: {
                type: Boolean,
                default: true
            },
            drawWidth: {
                type: [Number, String],
                default: "260"
            },
            showDrawer: Boolean,
        },
        data() {
            return {
                mini: false,
                menus: menu,
                scrollSettings: {
                    maxScrollbarLength: 160
                },

                menulist1: [],
                selectedMenuItem: 0,
            }
        },

        computed: {
            computeGroupActive() {
                return true;
            },
            computeLogo() {
                return "../../static/m.png"
            },

            sideToolbarColor() {
                return this.$vuetify.options.extra.sideNav
            },

            menulist() {
                return this.$store.state.user.menus;
            },

            menuAction: {
                get: function () {
                    this.getIsMenuItemActive();
                },
                set: function (value) {

                }
            }
        },

        created() {
            this.getIsMenuItemActive();
            //console.log(this.menulist);
        },

        methods: {
            genChildTarget(item, subItem) {
                if (subItem.href) return
                if (subItem.component) {
                    return {
                        name: subItem.component
                    }
                }
                return { name: `${item.group}/${subItem.name}` }
            },

            getMenuItemByPath(menulist, path) {
                let menu = null;
                menulist.forEach((value) => {
                    if (value.Active) {
                        value.Active = false;
                    }

                    if (menu)
                        return;
                    //console.log(value);
                    if (value.FormName === path) {
                        menu = value;
                        value.Active = true;
                        return;
                    } else {
                        if (value.Childs && value.Childs.length > 0) {
                            let item = this.getMenuItemByPath(value.Childs, path);
                            if (item) {
                                menu = value;
                                value.Active = true;
                                return;
                            }
                        }
                    }
                });
                return menu;
            },

            getIsMenuItemActive() {
                let path = this.$route.path;
                let menu = this.getMenuItemByPath(this.menulist, path);
                return menu;
            },

        }
    }
</script>

<style scoped>
    .app--drawer {
        overflow: hidden;
    }

    .drawer-menu--scroll {
        height: calc(100vh - 48px);
        overflow: auto;
    }
</style>