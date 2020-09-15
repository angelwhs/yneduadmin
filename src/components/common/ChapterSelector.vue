<template>
    <div>   
        <!--选择课程-->


        <!--章节展示-->
        <div class="mx-auto mt-4">
            <!--结果表格-->
            <div class="mt-4" id="searchResultTable">

                <v-data-table class="elevation-1 pl-4 pr-4" hide-default-footer :headers="searchModel.headers"
                    item-key="Id" :items="searchModel.list" :loading="searchModel.loading"
                    no-data-text="未查询到数据" loading-text="数据加载中..." v-model="selectedItems"
                    :group-by.sync="searchModel.groupby" :sort-by.sync="searchModel.sortby">

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
                    </template>
                </v-data-table>

            </div>

            <!--分页控件-->
            <div class="pa-4">
                <v-pagination v-model="searchModel.pageSetting.page" :circle="searchModel.pageSetting.circle"
                    :disabled="searchModel.pageSetting.disabled" :length="searchModel.pageSetting.length"
                    :next-icon="searchModel.pageSetting.nextIcon" :prev-icon="searchModel.pageSetting.prevIcon" :page="searchModel.pageSetting.page"
                    :total-visible="searchModel.pageSetting.totalVisible" v-on:input="search(searchModel.pageSetting.page - 1)"
                    v-on:previous="searchModel.search(searchModel.pageSetting.page - 1)" v-on:Value="search(searchModel.pageSetting.page - 1)">
                </v-pagination>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            isShow: Boolean,
            selected: Array,
        },

        data() {
            return {
                show: this.isShow,

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

                selectedItemskey: [],
            }
        },

        methods: {
            search: function (pageIndex) {
                let id = 0;

                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/chapter/GetAllEnable', {
                    lessonId: id,
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchModel.totalCount = data.result.TotalCount;

                        this.searchModel.list = data.result.Data;

                        //console.log(data.result.Data);
                    } else {

                    }
                    this.loadingDialog.isShow = false;
                }).catch((error) => {

                    this.loadingDialog.isShow = false;
                });
            },


        },

        watch: {
            isShow(val) {
                this.show = val;
                if(this.show) {
                    this.loadLessonCategory();
                    this.search(0);
                }
            },

            show(val) {
                this.$emit("on-show-change", val);
            },
        },

    }
</script>