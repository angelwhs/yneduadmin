<template>
    <v-dialog v-model="show" persistent max-width="1000">
        <v-card>
            <!--标题-->
            <v-card-title class="headline"><span class="">选择章节</span></v-card-title>

            <v-container>
                <!--选择课程-->
                <v-alert class="pt-0 pb-0" color="cyan" border="left" elevation="2" colored-border>
                    <v-row>
                        <v-col class="" cols="12" md="10">
                            <template v-if="lessonSelectorSetting.selectedItems && lessonSelectorSetting.selectedItems.length > 0">
                                <v-expansion-panels flat="true">
                                    <v-expansion-panel>
                                        <v-expansion-panel-header ><span>课程：{{lessonSelectorSetting.selectedItems[0].Title}}</span></v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                                                Id：{{ lessonSelectorSetting.selectedItems[0].Id }}
                                            </p>
                                            <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                                                课程名称：{{ lessonSelectorSetting.selectedItems[0].Title }}
                                            </p>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </template>
                        <template v-else>
                            <v-row>
                                <v-col class=" d-flex justify-center align-center">
                                    <span class="ma-4">请选择课程</span>
                                </v-col>
                            </v-row>
                        </template>
                        </v-col>
                        <v-col cols="12" md="2" class="pt-0 pb-0 d-flex justify-center align-center">
                            <v-btn @click="lessonSelectorShow" small color="light-blue darken-1">
                                <span style="color: white;">选择课程</span>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-alert>

                <!--章节搜索-->
                <v-row>
                    <v-col cols="12" md="10" class="">
                        <v-text-field label="搜索条件" dense v-model="searchModel.searchName" placeholder="请输入搜索条件"
                            clearable hide-details>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="2" class="">
                        <v-btn color="primary" block class="align-center" @click="search(0)">搜索</v-btn>
                    </v-col>
                </v-row>

                <!--章节展示-->
                <div class="mx-auto mt-4">
                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">

                        <v-data-table class="elevation-1 pl-4 pr-4" show-select hide-default-footer :headers="searchModel.headers"
                            item-key="Id" :items="searchModel.list" :loading="searchModel.loading" no-data-text="未查询到数据"
                            loading-text="数据加载中..." v-model="selectedItems" :group-by.sync="searchModel.groupby"
                            :sort-by.sync="searchModel.sortby">

                            <template v-slot:group.header="{ group }">
                                <td colspan="6" class="text-start">
                                    <span>{{'课程目录: ' + group}}</span>
                                </td>
                            </template>

                            <template v-slot:item.KnowledgePoints="{ item }">
                                <template v-if="item.KnowledgePoints && item.KnowledgePoints.length > 0">
                                    <div class="d-flex flex-wrap">
                                        <v-chip v-for="k in item.KnowledgePoints" class="ma-2" small>
                                            {{k.FullName}}
                                        </v-chip>
                                    </div>
                                </template>
                                <template v-else>
                                    <div></div>
                                </template>
                            </template?>
                        </v-data-table>

                    </div>

                    <!--分页控件-->
                    <div class="pa-4">
                        <v-pagination v-model="searchModel.pageSetting.page" :circle="searchModel.pageSetting.circle"
                            :disabled="searchModel.pageSetting.disabled" :length="searchModel.pageSetting.length"
                            :next-icon="searchModel.pageSetting.nextIcon" :prev-icon="searchModel.pageSetting.prevIcon"
                            :page="searchModel.pageSetting.page" :total-visible="searchModel.pageSetting.totalVisible"
                            v-on:input="search(searchModel.pageSetting.page - 1)"
                            v-on:previous="searchModel.search(searchModel.pageSetting.page - 1)"
                            v-on:Value="search(searchModel.pageSetting.page - 1)">
                        </v-pagination>
                    </div>
                </div>
            </v-container>


            <!--按钮-->
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="show = false">取消</v-btn>
                <v-btn color="primary" @click="confirm()">确定</v-btn>
            </v-card-actions>
        </v-card>

        <!--课程选择器-->
        <lesson-selector :isShow="lessonSelectorSetting.show" :selected="lessonSelectorSetting.selectedItems"
            :singleSelect="lessonSelectorSetting.singleSelect" v-on:on-show-change="lessonSelectorShowChange"
            v-on:on-confirm="lessonSelectorConfirm">
        </lesson-selector>
    </v-dialog>
</template>

<script>
    import LessonSelector from '../../components/common/LessonSelector.vue';

    export default {
        components: {
            LessonSelector,
        },

        props: {
            isShow: Boolean,
            selected: Array,
        },

        data() {
            return {
                show: this.isShow,

                //课程选择器参数
                lessonSelectorSetting: {
                    show: false,
                    singleSelect: true,
                    selectedItems: [],
                },

                searchModel: {
                    searchName: '',
                    loading: false,
                    headers: [
                        { text: 'Id', value: 'Id' },
                        { text: '序号', value: 'DisplayOrder' },
                        { text: '名称', value: 'Title' },
                        { text: '关联知识点', value: 'KnowledgePoints' },
                    ],
                    pageSetting: {
                        circle: false,
                        disabled: false,
                        length: 1, //总共有几页
                        nextIcon: 'mdi-menu-right',
                        nextIcons: ['mdi-chevron-right', 'mdi-arrow-right', 'mdi-menu-right'],
                        prevIcon: 'mdi-menu-left',
                        prevIcons: ['mdi-chevron-left', 'mdi-arrow-left', 'mdi-menu-left'],
                        page: 1, //当前页面
                        totalVisible: 10, //最多显示几页按钮
                    },
                    groupby: 'LessonCatalogTitle',
                    sortby: 'DisplayOrder',
                    totalCount: 0,
                    pageSize: 100,
                    list: [],
                },

                selectedItems: [],
            }
        },

        methods: {
            search: function (pageIndex) {
                let id = 0;
                this.selectedItems = [];

                if(this.lessonSelectorSetting.selectedItems && this.lessonSelectorSetting.selectedItems.length > 0) {
                    id = this.lessonSelectorSetting.selectedItems[0].Id;
                } else {
                    this.$toast.error('请选择课程.', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                this.searchModel.loading = true;

                this.getAxios('/api/course/backend/chapter/GetAllEnable', {
                    lessonId: id,
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchModel.pageSize,
                }).then((data) => {
                    //console.log(data);
                    if (data.errorcode === 0) {
                        this.searchModel.pageSetting.page = data.result.PageIndex + 1;
                        this.searchModel.pageSetting.length = data.result.TotalPages;

                        this.searchModel.totalCount = data.result.TotalCount;

                        this.searchModel.list = data.result.Data;

                        if (this.selected && this.selected.length > 0
                            && this.searchModel.list && this.searchModel.list.length > 0) {
                            this.selected.forEach((val, index) => {
                                this.searchModel.list.forEach((val1, index1) => {
                                    if (val.Id === val1.Id) {
                                        this.selectedItems.push(val1);
                                    }
                                });
                            });
                        }
                    } else {

                    }
                    this.searchModel.loading = false;
                }).catch((error) => {
                    this.searchModel.loading = false;
                });
            },

            // #region 课程选择器
            lessonSelectorShowChange: function (val) {
                this.lessonSelectorSetting.show = val;
            },

            lessonSelectorConfirm: function (selectedItems) {
                console.log(selectedItems);
                if (selectedItems && selectedItems.length > 0) {
                    this.lessonSelectorSetting.selectedItems = selectedItems;

                    this.search(0);
                }
            },

            lessonSelectorShow: function () {
                this.lessonSelectorSetting.show = true;
            },

            lessonDelete: function (item) {
                if (this.lessonSelectorSetting.selectedItems && this.lessonSelectorSetting.selectedItems.length > 0) {
                    this.lessonSelectorSetting.selectedItems.forEach((val, index) => {
                        if (val && val.Id === item.Id) {
                            this.lessonSelectorSetting.selectedItems.splice(index, 1);
                        }
                    })
                }
            },
            // #endregion

            //确认选择结果
            confirm: function () {
                if(!this.selectedItems || this.selectedItems.length <= 0) {
                    this.$toast.error('请选择课程。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
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
                if (this.show) {
                    //this.search(0);
                    this.lessonSelectorSetting.selectedItems = [];
                    this.searchModel.list = [];

                    if(this.selected && this.selected.length > 0) {
                        
                    }
                }
            },

            show(val) {
                this.$emit("on-show-change", val);
            },
        },

    }
</script>