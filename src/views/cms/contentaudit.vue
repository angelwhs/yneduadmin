<template>
    <div id="pageContentAudit" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--查询条件-->
            <div>
                <v-card class="mx-auto">
                    <v-row class="mx-auto ">
                        <v-col cols="12" md="5" class="d-flex justify-center align-center">
                            <v-text-field class="subtitle-2 ml-4" v-model="searchModel.searchName" label="搜索条件"
                                placeholder="请输入搜索条件">
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
                                                <v-btn small outlined color="success" class="mr-4"
                                                    @click="openAudit(item)">
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
                                                <v-btn small outlined color="primary" class="mr-4"
                                                    @click="openAudit(item)">
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
                            <!--如果是文章-->
                            <p class="subtitle-1 font-weight-black mb-1">审核内容</p>
                            <v-divider></v-divider>
                            <template v-if="updateItem.ContentType === 1 && updateItem.Article">
                                <div class="mt-4 mb-4 subtitle-1">
                                    <span class="">审核内容类型：<span class="font-weight-black">文章</span></span>
                                    <span class="ml-6">文章标题：<span
                                            class="font-weight-black">{{updateItem.Article.Title}}</span></span>
                                    <span class="ml-6">作者：<span
                                            class="font-weight-black">{{updateItem.Article.CreateByName}}</span></span>
                                    <span class="ml-6">创作时间：<span
                                            class="font-weight-black">{{updateItem.Article.Created}}</span></span>
                                </div>

                                <p class="mb-1 subtitle-1">文章内容：</p>
                                <div style="width: 100%; height: 300px; overflow:auto; border-radius:5px; border:1px solid #BBBBBB;padding: 8px;"
                                    v-html="updateItem.Article.ArticleContent">
                                </div>
                            </template>
                            <!--如果是评论-->
                            <template v-else-if="updateItem.ContentType === 2">

                            </template>

                            <!--填写审核-->
                            <p class="subtitle-1 font-weight-black mt-6 mb-1">审核选项</p>
                            <v-divider></v-divider>
                            <v-radio-group row v-model="auditModel.State" class="ml-6 mr-6">
                                <v-radio v-for="item in contentAuditStateList" :key="item.Id" :label="item.Name"
                                    :value="item.Id" :color="item.Color"></v-radio>
                            </v-radio-group>
                            <v-textarea class="ml-6 mr-6" rows="4" label="审核原因（选填）" placeholder="请输入审核原因（选填）" outlined
                                v-model="auditModel.Reason">

                            </v-textarea>

                            <!--已有的审核记录-->
                            <p class="subtitle-1 font-weight-black mt-6 mb-1">审核记录</p>
                            <v-divider></v-divider>
                            <template v-if="updateItem.FlowList && updateItem.FlowList.length > 0">
                                <v-expansion-panels class="mt-4">
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            <v-row>
                                                <span
                                                    class="font-weight-black mr-4">{{updateItem.FlowList[updateItem.FlowList.length - 1].Created }}</span>
                                                <span
                                                    class=" mr-4">{{'[' + updateItem.FlowList[updateItem.FlowList.length - 1].CreateByName + ']'}}</span>
                                                <span>{{updateItem.FlowList[updateItem.FlowList.length - 1].Reason}}</span>
                                            </v-row>
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content>
                                            <v-timeline dense>
                                                <v-timeline-item small v-for="item in updateItem.FlowList">
                                                    <v-card class="elevation-2">
                                                        <v-card-title class="headline subtitle-2">{{item.Created}}
                                                        </v-card-title>
                                                        <v-card-text>
                                                            <span>
                                                                <span
                                                                    class=" mr-4">{{'[' + item.CreateByName + ']'}}</span>
                                                                <span>{{item.Reason}}</span>
                                                            </span>
                                                        </v-card-text>
                                                    </v-card>
                                                </v-timeline-item>
                                            </v-timeline>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>

                            </template>
                            <template v-else>
                                <div>

                                </div>
                            </template>
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

                    Article: null,
                    ArticleComment: null,
                    FlowList: [],
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

                auditModel: {
                    Id: 0,
                    ContentId: 0,
                    IsAudit: false,
                    State: 0,
                    Reason: '',
                },

                contentAuditStateList: [
                    { Id: 1, Name: '通过', Color: 'green' },
                    { Id: 3, Name: '驳回', Color: 'red' },
                ],

            }
        },

        created() {
            this.search(0);
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

                this.auditModel.Id = item.Id;
                this.auditModel.ContentId = item.ContentId;
                this.auditModel.IsAudit = item.IsAudit;
                this.auditModel.State = item.IsAudit ? item.State : 1;
                this.auditModel.Reason = '';
            },

            openAudit(item) {
                this.updateItem.Article = null;
                this.updateItem.ArticleComment = null;
                this.updateItem.FlowList = [];

                if (!item)
                    return;

                this.prepareUpdateItem(item);

                if (item.ContentType === 1) {
                    this.getAxios('/api/cms/backend/article/GetArticleById', {
                        id: item.Id,
                    }).then((data) => {
                        if (data.errorcode === 0) {
                            let article = data.result;
                            this.updateItem.Article = article;
                            this.loadAuditFlowList(item.Id);
                        } else {
                            this.$toast.error('获取文章数据失败,请重试.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        }
                    }).catch((error) => {
                        this.$toast.error('获取文章数据失败,请重试.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    });
                } else if (item.ContentType === 2) {

                }


            },

            loadAuditFlowList(contentAuditId) {
                this.getAxios('/api/cms/backend/audit/FlowList', {
                    contentAuditId: contentAuditId,
                    pageIndex: 0,
                    pageSize: 100,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        if (data.result.Data && data.result.Data.length > 0) {
                            this.updateItem.FlowList = data.result.Data;
                        }
                        console.log(data.result);
                        this.updateDialog.isShow = true;
                    } else {
                        this.$toast.error('获取文章数据失败,请重试.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch(error => {
                    this.$toast.error('获取文章数据失败,请重试.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            saveAudit() {

                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.postAxios('/api/cms/backend/audit/ContentAudit', JSON.stringify(this.auditModel)).then(data => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.updateDialog.isShow = false;
                        this.$toast.success('保存成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('保存失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch(error => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('保存失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            closeAudit() {
                this.updateDialog.isShow = false;
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