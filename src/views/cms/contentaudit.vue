<template>
    <div id="pageContentAudit" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--查询条件-->
            <div>
                <v-card class="mx-auto">
                    <v-row class="mx-auto ">
                        <v-col cols="12" md="5" class="d-flex justify-center align-center">
                            <v-text-field class="subtitle-2 ml-4" v-model="searchModel.searchName" label="搜索条件" placeholder="请输入搜索条件">
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="5" class="d-flex justify-center align-center">
                            <v-select :items="contentTypeList" dense label="内容类型" item-text="Name" item-value="Id"
                                placeholder="请选择内容类型" v-model="searchModel.contentType">
                            </v-select>
                        </v-col>
                        <v-col cols="12" md="2" class="d-flex justify-center align-center">
                            <v-btn class="align-center" @click="search(0)">搜索</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </div>


            <!--查询结果-->
            <div class="my-auto">
                <div class="mx-auto mt-4">
                    <!--标题-->
                    <v-toolbar flat color="white">
                        <v-toolbar-title class="title">查询结果</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-spacer></v-spacer>
                    </v-toolbar>

                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">
                        <v-simple-table fixed-header class="pl-4 pr-4">
                            <thead>
                                <tr>
                                    <th class="text-left">Id</th>
                                    <th class="text-left">内容类型</th>
                                    <th class="text-left">内容简介</th>
                                    <th class="text-left">创作人</th>
                                    <th class="text-left">创作时间</th>
                                    <th class="text-left">审核</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ getContentTypeName(item.ContentType) }}</td>
                                        <td>{{ item.ContentSummary }}</td>
                                        <td>{{ item.ContentUserName }}</td>
                                        <td>{{ item.Created }}</td>
                                        <td>
                                            <template v-if="item.State === 1">
                                                <v-btn small outlined color="success" class="mr-4" @click="openAudit(item)">
                                                    已通过
                                                </v-btn>
                                            </template>
                                            <template v-else-if="item.State === 2">
                                                <v-btn small outlined color="blue-grey" class="mr-4"
                                                    @click="openAudit(item)">
                                                    未审核
                                                </v-btn>
                                            </template>
                                            <template v-else-if="item.State === 3">
                                                <v-btn small outlined color="red" class="mr-4" @click="openAudit(item)">
                                                    驳回
                                                </v-btn>
                                            </template>
                                            <template v-else-if="item.State === 4">
                                                <v-btn small outlined color="primary" class="mr-4" @click="openAudit(item)">
                                                    审核中
                                                </v-btn>
                                            </template>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </v-simple-table>
                    </div>

                    <!--分页控件-->
                    <div class="pa-4">
                        <v-pagination v-model="pageSetting.page" :circle="pageSetting.circle"
                            :disabled="pageSetting.disabled" :length="pageSetting.length"
                            :next-icon="pageSetting.nextIcon" :prev-icon="pageSetting.prevIcon" :page="pageSetting.page"
                            :total-visible="pageSetting.totalVisible" v-on:input="search(pageSetting.page - 1)"
                            v-on:previous="search(pageSetting.page - 1)" v-on:Value="search(pageSetting.page - 1)">
                        </v-pagination>
                    </div>
                </div>
            </div>

            <!--审核内容-->
            <v-dialog v-model="updateDialog.isShow" persistent fullscreen hide-overlay
                transition="dialog-bottom-transition">
                <v-card ref="form">
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="updateDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            <span class="headline mr-4">{{'审核内容'}}</span>
                            <span>{{updateItem.ContentType == 1 ? '文章' : updateItem.ContentType == 2 ? '评论' : ''}}</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveAudit">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <!--内容信息-->


                            <!--填写审核内容-->
                            <v-row>
                                
                            </v-row>

                            <!--已有的审核流程-->


                        </v-container>
                    </v-card-text>

                </v-card>

            </v-dialog>



            <!--loading-->
            <v-dialog v-model="loadingDialog.isShow" hide-overlay persistent width="300">
                <v-card color="primary pa-3" dark>
                    <v-card-text>
                        <div class="subtitle-1 mb-3">
                            {{loadingDialog.message}}
                        </div>
                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-container>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                searchModel: {
                    searchName: '',
                    contentType: 1,
                },

                searchResult: {
                    totalCount: 2,
                    pageSize: 10,
                    list: [],
                },

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

                updateItem: {
                    Id: 0,
                    Name: '',
                    Enable: true,
                    Description: '',
                    Created: '',
                    Updated: '',
                    ContentId: 0,
                    IsAudit: false,
                    State: 0,
                    ContentType: 0,
                    ContentSummary: '',
                    UserId: 0,
                    CreateByName: '',
                    UpdateByName: '',
                    HeadImgurl: '',
                    ContentUserName: '',
                    ContentHeadImgurl: '',
                    ContentCreated: '',
                },

                updateDialog: {
                    isShow: false,
                },

                saveLoading: false,
                errorMessages: '',
                loadingDialog: {
                    isShow: false,
                    message: '数据加载中,请稍后...',
                },
                deleteDialog: false,
                setEnableDialog: false,

                //内容类型 
                contentTypeList: [
                    { Id: 1, Name: '文章' },
                    { Id: 2, Name: '评论' },
                ],
            }
        },

        created() {

        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/audit/list', {
                    searchName: this.searchModel.searchName,
                    contentType: this.searchModel.contentType,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;

                        this.searchResult.list = data.result.Data;

                        console.log(data.result.Data);
                    } else {

                    }
                    this.loadingDialog.isShow = false;
                }).catch((error) => {

                    this.loadingDialog.isShow = false;
                });
            },

            prepareUpdateItem: function (item) {
                this.updateItem.Id = item.Id;
                this.updateItem.Name = item.Name;
                this.updateItem.Description = item.Description;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Created = item.Created;
                this.updateItem.Updated = item.Updated;
                this.updateItem.ContentId = item.ContentId;
                this.updateItem.IsAudit = item.IsAudit;
                this.updateItem.State = item.State;
                this.updateItem.ContentType = item.ContentType;
                this.updateItem.ContentSummary = item.ContentSummary;
                this.updateItem.UserId = item.UserId;
                this.updateItem.CreateByName = item.CreateByName;
                this.updateItem.UpdateByName = item.UpdateByName;
                this.updateItem.HeadImgurl = item.HeadImgurl;
                this.updateItem.ContentUserName = item.ContentUserName;
                this.updateItem.ContentHeadImgurl = item.ContentHeadImgurl;
                this.updateItem.ContentCreated = item.ContentCreated;
            },

            openAudit(item) {

            },

            saveAudit() {

            },

            closeAudit() {

            },

            getContentTypeName(contentType) {
                let res = '';
                switch (contentType) {
                    case 1:
                        res = '文章';
                        break;
                    case 2:
                        res = '评论';
                        break;
                    default:
                        break;
                }
                return res;
            },
        },
    }
</script>

<style>
</style>