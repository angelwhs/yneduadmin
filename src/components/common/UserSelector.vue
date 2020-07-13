<template>
    <v-dialog v-model="show" persistent max-width="1000">
        <v-card>
            <!--标题-->
            <v-card-title class="headline"><span class="">选择用户</span></v-card-title>

            <!---->
            <v-container>
                <!--搜索条件-->
                <v-row>
                    <v-col cols="12" md="10" class="">
                        <v-text-field label="搜索条件" dense v-model="searchModel.searchName" 
                            placeholder="请输入搜索条件" clearable hide-details>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="2" class="">
                        <v-btn color="primary" block class="align-center" @click="search(0)">搜索</v-btn>
                    </v-col>
                </v-row>

                <!--账号列表-->
                <v-row>
                    <v-col>
                        <label class="v-label v-label--active theme--light" style="left: 0px; right: auto; font-size: 12px;">搜索结果</label>
                        <v-data-table class="elevation-1" show-select hide-default-footer :headers="searchModel.headers"
                        item-key="Id" :items="searchModel.list" :loading="searchModel.loading" :single-select="!multiple"
                        no-data-text="未查询到数据" loading-text="数据加载中..." v-model="selectedItems">

                        </v-data-table>
                    </v-col>
                </v-row>

                <v-row class=" d-flex align-end justify-center">
                    <!--分页控件-->
                    <div class="pa-4">
                        <v-pagination v-model="searchModel.pageSetting.page"
                            :circle="searchModel.pageSetting.circle"
                            :disabled="searchModel.pageSetting.disabled"
                            :length="searchModel.pageSetting.length"
                            :next-icon="searchModel.pageSetting.nextIcon"
                            :prev-icon="searchModel.pageSetting.prevIcon"
                            :page="searchModel.pageSetting.page"
                            :total-visible="searchModel.pageSetting.totalVisible"
                            v-on:input="search(searchModel.pageSetting.page - 1)"
                            v-on:previous="search(searchModel.pageSetting.page - 1)"
                            v-on:Value="search(searchModel.pageSetting.page - 1)">
                        </v-pagination>
                    </div>
                </v-row>
            </v-container>

            <!--按钮-->
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="show = false">取消</v-btn>
                <v-btn color="primary" @click="confirm()">确定</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: {
            isShow: Boolean,
            selected: Array,
            multiple: Boolean,
        },

        data() {
            return {
                show: this.isShow,

                searchModel: {
                    loading: false,
                    searchName: '',
                    totalCount: 2,
                    pageSize: 10,
                    list: [],
                    pageSetting: {
                        circle: false,
                        disabled: false,
                        length: 1, //总共有几页
                        nextIcon: 'mdi-menu-right',
                        nextIcons: ['mdi-chevron-right', 'mdi-arrow-right', 'mdi-menu-right'],
                        prevIcon: 'mdi-menu-left',
                        prevIcons: ['mdi-chevron-left', 'mdi-arrow-left', 'mdi-menu-left'],
                        page: 1, //当前页面
                        totalVisible: 3, //最多显示几页按钮
                    },
                    headers: [
                        { text: 'Id', value: 'Id' },
                        { text: '账号', value: 'Account' },
                        { text: '昵称', value: 'UserNickName' },
                        { text: '电话', value: 'Tel' },
                    ],
                },

                searchCategory: {
                    list: [],
                    selectProps: {
                        multiple: false,
                        label: 'Title',
                        children: 'Childs',
                        value: 'Id',
                        emitPath: false,
                    },
                    selected: null,
                    searchName: '',
                },

                selectedItemskey: [],
                selectedItems: [],
            }
        },

        mounted() {
            this.search(0);
        },

        methods: {
            search: function(pageIndex) {
                //console.log(this.searchCategory.selected);
                this.selectedItems = [];

                let categoryId = 0;
                if(this.searchCategory.selected && this.searchCategory.selected > 0) {
                    categoryId = this.searchCategory.selected;
                }

                this.searchModel.loading = true;

                this.getAxios('/api/course/backend/customer/GetAllEnableUsers', {
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchModel.pageSize
                }).then(data => {
                    if (data.errorcode === 0) {
                        this.searchModel.pageSetting.page = data.result.PageIndex + 1;
                        this.searchModel.pageSetting.length = data.result.TotalPages;
                        this.searchModel.totalCount = data.result.TotalCount;

                        this.searchModel.list = data.result.Data;

                        if(this.selected && this.selected.length > 0
                            && this.searchModel.list && this.searchModel.list.length > 0) {
                            this.selected.forEach((val, index) => {
                                this.searchModel.list.forEach((val1, index1) => {
                                    if(val.Id === val1.Id) {
                                        this.selectedItems.push(val1);
                                    }
                                });
                            });
                        }
                    } else {

                    }

                    this.searchModel.loading = false;
                }).catch(error => {
                    this.searchModel.loading = false;
                });
            },

            //确认选择结果
            confirm: function () {
                if(!this.selectedItems || this.selectedItems.length <= 0) {
                    this.$toast.error('请选择用户。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                //console.log(this.selectedItems);
                
                this.$emit("on-confirm", this.selectedItems);
                this.show = false;
            },
        },

        watch: {
            isShow(val) {
                this.show = val;
            },

            show(val) {
                this.$emit("on-show-change", val);
            },
        },
        
    }
</script>