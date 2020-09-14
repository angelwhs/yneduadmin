<template>
    <div id="pageArticle" class="page-wrapper">
        <v-container d-flex>
            <!--侧边栏目栏-->
            <div class="mr-2 ">
                <v-card class="contentsectionbox">
                    <div class="d-flex jusify-center align-center">
                        <v-text-field class="ma-2" v-model="searchContentSectionModel.searchName" :hide-details="true"
                            outlined dense height="16"></v-text-field>
                        <v-btn class="d-flex align-center" icon @click="searchContentSection">
                            <v-icon class="text--secondary" size="32">refresh</v-icon>
                        </v-btn>
                    </div>

                    <v-card-text class="pa-1 contentsectionlist">
                        <v-treeview :items="searchContentSectionResult.list" item-children="Childs" item-key="Id"
                            item-text="Title" dense hoverable return-object open-on-click activatable transition
                            v-on:update:active="selectContentSectionItem" style="width: 400px; height: 100%;">
                            <template v-slot:label="{ item, open }">
                                <span v-if="item.Childs && item.Childs.length > 0">{{item.Title}}</span>
                                <span v-else>{{item.Title + '(' + item.ArticleCount + ')'}}</span>
                            </template>
                        </v-treeview>
                    </v-card-text>
                </v-card>
            </div>

            <!--文章-->
            <div style="width: 100%;">
                <!--查询条件-->
                <div>
                    <v-card class="mx-auto">
                        <v-row class="mx-auto ">
                            <v-col cols="12" md="10" class="d-flex justify-center align-center">
                                <v-text-field class="subtitle-2 ml-4" v-model="searchModel.searchName" label="搜索条件">
                                </v-text-field>
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
                            <v-btn color="primary" dark class="mb-2" @click="openCreate">新建</v-btn>
                            <v-spacer></v-spacer>
                        </v-toolbar>

                        <!--结果表格-->
                        <div class="mt-4" id="searchResultTable">
                            <v-data-table hide-default-footer calculate-widths :headers="searchResult.headers"
                                item-key="Id" :items="searchResult.list" no-data-text="未查询到数据" loading-text="数据加载中...">

                                <!--发布/隐藏 插槽-->
                                <template v-slot:item.IsPublish="{ item }">
                                    <v-icon size="20" v-if="!item.IsPublish" @click="confirmSetEnable(item)"
                                        color="red lighten-2">
                                        mdi-cancel
                                    </v-icon>
                                    <v-icon size="20" v-else @click="confirmSetEnable(item)" color="green lighten-2">
                                        mdi-checkbox-marked-circle
                                    </v-icon>
                                </template>

                                <!--文章审核 插槽-->
                                <template v-slot:item.AuditStatus="{ item }">
                                    <!-- <span v-html="getAuditStatusName(item.AuditStatus)"></span> -->
                                    <span v-if="item.AuditStatus === 0">{{getAuditStatusName(item.AuditStatus)}}</span>
                                    <span
                                        v-else-if="item.AuditStatus === 1" style="color: green;">{{getAuditStatusName(item.AuditStatus)}}</span>
                                    <span v-else-if="item.AuditStatus === 3" style="color: red;">{{getAuditStatusName(item.AuditStatus)}}</span>
                                    <v-btn small outlined text color="primary" v-else-if="item.AuditStatus === 4"
                                        @click="openAudit(item)">{{getAuditStatusName(item.AuditStatus)}}</v-btn>
                                </template>

                                <!--操作插槽-->
                                <template v-slot:item.action="{ item }">
                                    <!--编辑-->
                                    <v-icon size="20" class="mr-4" @click="openEdit(item)">

                                        edit
                                    </v-icon>

                                    <!--删除-->
                                    <v-icon size="20" color="deep-orange" @click="confirmDelete(item)">
                                        mdi-delete-forever</v-icon>
                                </template>
                            </v-data-table>
                        </div>

                        <!--分页控件-->
                        <div class="pa-4">
                            <v-pagination v-model="pageSetting.page" :circle="pageSetting.circle"
                                :disabled="pageSetting.disabled" :length="pageSetting.length"
                                :next-icon="pageSetting.nextIcon" :prev-icon="pageSetting.prevIcon"
                                :page="pageSetting.page" :total-visible="pageSetting.totalVisible"
                                v-on:input="search(pageSetting.page - 1)" v-on:previous="search(pageSetting.page - 1)"
                                v-on:Value="search(pageSetting.page - 1)">
                            </v-pagination>
                        </div>
                    </div>
                </div>

                <!--创建/更新-->
                <v-dialog v-model="updateDialog.isShow" persistent fullscreen hide-overlay
                    transition="dialog-bottom-transition">
                    <v-card ref="form">
                        <v-toolbar dark color="primary">
                            <v-btn icon dark @click="updateDialog.isShow = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                            <v-toolbar-title>
                                <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                                <span>文章</span>
                            </v-toolbar-title>
                            <v-spacer></v-spacer>
                            <v-toolbar-items>
                                <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                            </v-toolbar-items>
                        </v-toolbar>

                        <v-card-text class="dialog--scroll">
                            <v-container>

                                <v-row>
                                    <v-text-field v-model="updateItem.Title" label="标题"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title" placeholder="请输入文章标题">
                                    </v-text-field>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <el-cascader :options="searchArticleContentSectionResult.list" clearable
                                            v-model="selectedContentSections" :props="contentSectionSelectProps"
                                            style="width: 100%;" placeholder="请选择栏目" ref="contentSectionSelector">
                                        </el-cascader>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-combobox label="标签" placeholder="请选择标签" v-model="updateItem.ArticleTags"
                                            outlined hide-details dense multiple chips clearable return-object
                                            :items="searchArticleTagResult.list" item-text="Name"
                                            :filters="articleTagFilter">
                                            <template v-slot:selection="{ attrs, item, parent, selected }">
                                                <v-chip v-if="item === Object(item)" v-bind="attrs"
                                                    :input-value="selected" label small>
                                                    <span class="pr-2"> {{ item.Name }} </span>
                                                    <v-icon small @click="parent.selectItem(item)">close</v-icon>
                                                </v-chip>
                                            </template>
                                        </v-combobox>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <v-switch v-model="updateItem.IsPublish" label="是否发布"></v-switch>
                                    </v-col>
                                    <v-col cols="12" md="3">

                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="updateItem.Author" label="作者" dense
                                            :error-messages="errorMessages" ref="Entity_Author">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="updateItem.Sort" label="排序" dense
                                            :error-messages="errorMessages" ref="Entity_Sort" type="number">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="2">
                                        <v-switch v-model="updateItem.IsLink" label="是否转向链接" dense></v-switch>
                                    </v-col>
                                    <v-col cols="12" md="10">
                                        <v-text-field v-model="updateItem.LinkUrl" label="链接地址" dense
                                            :error-messages="errorMessages" ref="Entity_LinkUrl"
                                            :disabled="!updateItem.IsLink">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="12">
                                        <v-text-field v-model="updateItem.MetaKeyWords" label="关键字" dense
                                            :error-messages="errorMessages" ref="Entity_MetaKeyWords">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="12">
                                        <v-text-field v-model="updateItem.Summary" label="简介" dense
                                            :error-messages="errorMessages" ref="Entity_Summary">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="12" md="3">
                                        <v-switch v-model="updateItem.AllowComments" label="是否允许评论" dense></v-switch>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-switch v-model="updateItem.AllowLike" label="是否允许点赞" dense></v-switch>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="updateItem.InitLikeCount" label="初始点赞数" dense
                                            :error-messages="errorMessages" ref="Entity_InitLikeCount" type="number">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="12" md="3">
                                        <v-text-field v-model="updateItem.InitShareCount" label="初始分享数" dense
                                            :error-messages="errorMessages" ref="Entity_InitShareCount" type="number">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-subheader class="mt-3">封面图片</v-subheader>
                                <v-divider></v-divider>
                                <v-row>
                                    <v-col cols="12" md="12">
                                        <v-card outlined class="pr-4 pl-4 pb-4 pt-4">
                                            <template
                                                v-if="updateItem.ImageThumb_PictureUrl && updateItem.ImageThumb_PictureUrl !== ''">
                                                <v-img width="100%" height="200" contain
                                                    :src="updateItem.ImageThumb_PictureUrl" aspect-ratio="1"
                                                    ref="Entity_ImageThumb_PictureUrl">
                                                </v-img>
                                            </template>
                                            <template v-else>
                                                <div class="d-flex justify-center align-center"
                                                    style="width: 100%; height: 200px;">
                                                    <span class="subtitle-1">请选择图片</span>
                                                </div>
                                            </template>
                                            <input type="hidden" v-model="updateItem.ImageThumb_PictureId"
                                                ref="ImageThumb_PictureId" />
                                            <div class="d-flex justify-center mt-2">
                                                <v-btn
                                                    @click="pictureSelectorShow('ImageThumb_PictureId', 'ImageThumb_PictureUrl')"
                                                    class="mr-12" small color="light-blue darken-1" dark>
                                                    选择图片
                                                </v-btn>
                                                <v-btn
                                                    @click="updateItem.ImageThumb_PictureId=0;updateItem.ImageThumb_PictureUrl=''"
                                                    small color="light-blue darken-1" dark>
                                                    删除图片
                                                </v-btn>
                                            </div>
                                        </v-card>
                                    </v-col>
                                </v-row>
                                <v-subheader class="mt-3">文章内容</v-subheader>
                                <v-divider></v-divider>
                                <v-row>
                                    <v-col cols="12" md="12">
                                        <tinymce ref="editor" v-model="updateItem.ArticleContent" />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                    </v-card>

                    <!--选择图片-->
                    <picture-selector :isShow="imgSelectorSetting.show" v-on:on-show-change="pictureSelectorShowChange"
                        :multiple="false" :pictureField="imgSelectorSetting.pictureField" platformName="cms"
                        :pictureUrlField="imgSelectorSetting.pictureUrlField" v-on:on-confirm="pictureSelectorConfirm">
                    </picture-selector>
                </v-dialog>

                <!--文章审核-->
                <v-dialog v-model="contentauditDialog.show" persistent max-width="800" scrollable>
                    <v-card>
                        <v-card-title class="headline">文章审核</v-card-title>
                        <v-card-text class="mb-0 pb-0">
                            <v-container class="mb-0 pb-0">
                                <p class="mb-1">标题：{{updateItem.Title}}</p>
                                <p class="mb-1 mt-1">简介：{{updateItem.Summary}}</p>
                                <p class="mb-1 mt-1">文章内容：</p>
                            </v-container>
                        </v-card-text>

                        <v-card-text style="height: 200px;">
                            <v-container>
                                <p class="mb-1 mt-1" v-html="updateItem.ArticleContent">
                                </p>
                            </v-container>
                        </v-card-text>

                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <!--选择审核状态 通过/驳回-->
                                        <v-radio-group v-model="contentauditDialog.auditItem.State" row hide-details
                                            label="选择审核状态">
                                            <v-radio v-for="item in contentauditDialog.contentAuditStatusList"
                                                :color="item.Color" :key="item.Id" :label="item.Name" :value="item.Id">
                                            </v-radio>
                                        </v-radio-group>
                                    </v-col>

                                </v-row>
                                <v-row class="mt-3">
                                    <v-col>
                                        <!--填写审核意见-->
                                        <v-textarea no-resize outlined rows="3" label="审核意见（选填）"
                                            placeholder="请输入审核意见（选填）" v-model="contentauditDialog.auditItem.Reason">

                                        </v-textarea>
                                    </v-col>

                                </v-row>
                            </v-container>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="contentauditDialog.show = false">取消</v-btn>
                            <v-btn color="primary" @click="saveAudit()">确定</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!--删除-->
                <v-dialog v-model="deleteDialog" persistent max-width="640">
                    <v-card>
                        <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                        <v-card-text>
                            <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                            <p class="mb-1">名称：{{updateItem.Title}}</p>
                            <p class="mb-1">描述：{{updateItem.Summary}}</p>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="deleteDialog = false">取消</v-btn>
                            <v-btn color="primary" @click="saveDelete()">确定</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!--隐藏/发布-->
                <v-dialog v-model="setEnableDialog" persistent max-width="640">
                    <v-card>
                        <v-card-title class="headline">提示</v-card-title>
                        <v-card-text>
                            <p v-if="updateItem.Enable" class="mb-1 subtitle-1 font-weight-bold">是否隐藏该项目?</p>
                            <p v-else class="mb-1 subtitle-1 font-weight-bold">是否发布该项目?</p>
                            <p class="mb-1">标题：{{updateItem.Title}}</p>
                            <p class="mb-1">简介：{{updateItem.Summary}}</p>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" text @click="setEnableDialog = false">取消</v-btn>
                            <v-btn color="primary" @click="saveSetEnable()">确定</v-btn>
                        </v-card-actions>
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
            </div>

        </v-container>
    </div>
</template>

<script>
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
        },
        data() {
            return {
                searchModel: {
                    searchName: '',
                    contentSectionId: 0,
                },

                searchResult: {
                    totalCount: 2,
                    pageSize: 10,
                    list: [],
                    headers: [
                        { text: 'Id', value: 'Id' },
                        { text: '排序', value: 'Sort' },
                        { text: '标题', value: 'Title' },
                        { text: '是否发布', value: 'IsPublish' },
                        { text: '审核状态', value: 'AuditStatus' },
                        { text: '操作', value: 'action' },  //操作插槽
                    ],
                },

                searchContentSectionModel: {
                    searchName: '',
                },

                searchContentSectionResult: {
                    totalCount: 2,
                    pageSize: 1000,
                    list: [],
                },

                searchArticleContentSectionModel: {
                    searchName: '',
                },

                searchArticleContentSectionResult: {
                    totalCount: 2,
                    pageSize: 1000,
                    list: [],
                },

                searchArticleTagModel: {
                    searchName: '',
                },

                searchArticleTagResult: {
                    totalCount: 2,
                    pageSize: 1000,
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
                    Sort: 0,
                    Title: '',
                    Summary: '',
                    ArticleContent: '',
                    Status: 0,
                    ImageThumb_PictureId: 0,
                    ImageThumb_PictureUrl: '',
                    IsPublish: true,
                    AllowComments: false,
                    AllowLike: false,
                    StartDate: '',
                    EndData: '',
                    IsLink: false,
                    LinkUrl: '',
                    Author: '',
                    InitLikeCount: 0,
                    InitShareCount: 0,
                    MetaKeyWords: '',
                    ArticleTags: [],
                    ContentSections: [],
                    AuditStatus: 0,
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
                contentSectionList: [],
                selectedContentSections: [],

                //contentSectionSelectItems: [],
                contentSectionSelectProps: {
                    multiple: true,
                    label: 'Title',
                    children: 'Childs',
                    value: 'Id',
                    emitPath: false,
                },

                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                contentauditDialog: {
                    show: false,
                    contentAuditStatusList: [
                        { Id: 1, Name: "通过", Color: "green" },
                        { Id: 3, Name: "驳回", Color: "red" }
                    ],
                    auditItem: {
                        ContentAuditId: 0,
                        ContentId: 0,
                        IsAudit: false,
                        State: 1,
                        ContentType: 1,
                        ContentSummary: '',
                        Reason: '',
                    },
                },
            }
        },

        created() {
            this.searchContentSection();
            this.search(0);
            this.searchArticleTag();
            this.searchArticleContentSection();
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/article/list', {
                    searchName: this.searchModel.searchName,
                    contentSectionId: this.searchModel.contentSectionId,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;
                        this.searchResult.list = data.result.Data;
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
                this.updateItem.Enable = item.Enable;
                this.updateItem.Sort = item.Sort;
                this.updateItem.Title = item.Title;
                this.updateItem.Summary = item.Summary;
                this.updateItem.ArticleContent = item.ArticleContent;
                this.updateItem.Status = item.Status;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.IsPublish = item.IsPublish;
                this.updateItem.AllowComments = item.AllowComments;
                this.updateItem.AllowLike = item.AllowLike;
                this.updateItem.StartDate = item.StartDate;
                this.updateItem.EndData = item.EndData;
                this.updateItem.IsLink = item.IsLink;
                this.updateItem.LinkUrl = item.LinkUrl;
                this.updateItem.Author = item.Author;
                this.updateItem.InitLikeCount = item.InitLikeCount;
                this.updateItem.InitShareCount = item.InitShareCount;
                this.updateItem.MetaKeyWords = item.MetaKeyWords;
                this.updateItem.ArticleTags = item.ArticleTags;
                this.updateItem.ContentSections = item.ContentSections;
                this.updateItem.AuditStatus = item.AuditStatus;

                //加载栏目combobox已选栏目数据
                this.selectedContentSections = [];
                if (this.updateItem.ContentSections && this.updateItem.ContentSections.length > 0) {
                    this.updateItem.ContentSections.forEach((value, index, array) => {
                        this.selectedContentSections.push(value.Id);
                    });
                }
                //console.log(item);
            },

            getAuditStatusName: function (auditStatus) {
                let res = '未知';
                if (auditStatus) {
                    switch (auditStatus) {
                        case 1:
                            res = '通过';
                            break;
                        case 2:
                            res = '未审核';
                            break;
                        case 3:
                            res = '被驳回';
                            break;
                        case 4:
                            res = '审核中';
                            break;
                    }
                }
                return res;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Enable = true;
                this.updateItem.Sort = 0;
                this.updateItem.Title = '';
                this.updateItem.Summary = '';
                this.updateItem.ArticleContent = '';
                this.updateItem.Status = 0;
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.IsPublish = true;
                this.updateItem.AllowComments = false;
                this.updateItem.AllowLike = false;
                this.updateItem.StartDate = '';
                this.updateItem.EndData = '';
                this.updateItem.IsLink = false;
                this.updateItem.LinkUrl = '';
                this.updateItem.Author = '';
                this.updateItem.InitLikeCount = 0;
                this.updateItem.InitShareCount = 0;
                this.updateItem.MetaKeyWords = '';
                this.updateItem.ArticleTags = [];
                this.updateItem.ContentSections = [];

                this.selectedContentSections = [];

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                //this.prepareUpdateItem(item);

                //this.updateDialog.isShow = true;
                this.getAxios('/api/cms/backend/article/GetArticleById', {
                    id: item.Id,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        let article = data.result;
                        this.prepareUpdateItem(article);
                        this.updateDialog.isShow = true;
                    } else {
                        this.$toast.error('获取文章数据失败,请重试.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.$toast.error('获取文章数据失败,请重试.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            saveUpdate: function () {
                //先清空文章的栏目信息
                this.updateItem.ContentSections = [];

                //console.log(this.selectedContentSections);
                //console.log(this.$refs['contentSectionSelector'].getCheckedNodes(false));
                //再将从数组中找出选中的栏目，放入updateItem中
                this.$refs['contentSectionSelector'].getCheckedNodes(false).forEach((value, index, array) => {
                    if (!value.hasChildren) {
                        this.updateItem.ContentSections.push(value.data);
                    }
                });
                //console.log(this.updateItem);
                //return;

                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/cms/backend/article/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('新增成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('新增失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                            //console.log(data);
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/cms/backend/article/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('修改成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('修改失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    });
                } else {
                    this.loadingDialog.isShow = false;
                }
            },

            closeUpdate: function () {
                this.updateDialog.isShow = false;
            },

            confirmDelete: function (item) {
                this.prepareUpdateItem(item);
                this.deleteDialog = true;
            },

            saveDelete: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/article/delete', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.deleteDialog = false;
                        this.$toast.success('删除成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('删除失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('删除失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            confirmSetEnable: function (item) {
                this.prepareUpdateItem(item);
                this.setEnableDialog = true;
            },

            saveSetEnable: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/article/Publish', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.IsPublish ? '隐藏成功.' : '发布成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.IsPublish ? '隐藏失败,请重新提交.</br>' + data.errormsg : '发布失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.IsPublish ? '隐藏失败,请重新提交.</br>' + error.message : '发布失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            //栏目
            searchContentSection: function () {
                this.getAxios('/api/cms/backend/contentsection/GetList', {
                    searchName: this.searchContentSectionModel.searchName,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchContentSectionResult.list = data.result;
                    } else {

                    }
                    //console.log(data.result);
                }).catch((error) => {
                    //console.log(error);
                });
            },

            selectContentSectionItem: function (items) {
                if (items) {
                    this.selectedContentSections = items;
                }

                if (items && items.length > 0) {
                    let item = items[0];
                    this.searchModel.contentSectionId = item.Id;
                    this.search(0);
                }
            },

            //加载文章详情页的栏目combobox
            searchArticleContentSection: function () {
                this.getAxios('/api/cms/backend/contentsection/GetListByEnable', {
                    searchName: this.searchContentSectionModel.searchName,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchArticleContentSectionResult.list = data.result.Data;
                        //this.contentSectionSelectItems = data.result;
                    } else {

                    }
                    //console.log(this.searchArticleContentSectionResult.list);
                }).catch((error) => {

                });
            },


            //文章标签
            searchArticleTag: function () {
                this.getAxios('/api/cms/backend/articletag/List', {
                    searchName: this.searchArticleTagModel.searchName,
                    isShowDisable: true,
                    pageIndex: 0,
                    pageSize: 1000,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchArticleTagResult.totalCount = data.result.TotalCount;
                        this.searchArticleTagResult.list = data.result.Data;
                    } else {

                    }
                }).catch((error) => {

                })
            },

            articleTagFilter(item, queryText, itemText) {
                const hasValue = val => val != null ? val : ''

                const text = hasValue(itemText)
                const query = hasValue(queryText)

                return text.toString()
                    .toLowerCase()
                    .indexOf(query.toString().toLowerCase()) > -1
            },

            //封面图片选择
            pictureSelectorShowChange: function (val) {
                this.imgSelectorSetting.show = val;
            },

            pictureSelectorShow: function (pictureField, pictureUrlField) {
                this.imgSelectorSetting.pictureField = pictureField;
                this.imgSelectorSetting.pictureUrlField = pictureUrlField;
                this.imgSelectorSetting.show = true;
            },

            pictureSelectorConfirm: function (selectedItems, pictureField, pictureUrlField) {
                if (!pictureField || pictureField === '' || !pictureUrlField || pictureUrlField === '') {
                    return;
                }
                let selectItem = selectedItems[0];
                // console.log(pictureUrlField);
                // console.log(selectItem);
                this.updateItem[pictureField] = selectItem.Id;
                this.updateItem[pictureUrlField] = selectItem.ImageUrl;
            },


            //内容审核  Begin
            openAudit(item) {
                this.getAxios('/api/cms/backend/article/GetArticleById', {
                    id: item.Id,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        let article = data.result;
                        this.prepareUpdateItem(article);
                        this.contentauditDialog.show = true;
                    } else {
                        this.$toast.error('获取文章数据失败,请重试.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.$toast.error('获取文章数据失败,请重试.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            saveAudit() {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;


            },

            //内容审核 End

            onReady: function (editor) {
                // Insert the toolbar before the editable area.
                editor.ui.getEditableElement().parentElement.insertBefore(
                    editor.ui.view.toolbar.element,
                    editor.ui.getEditableElement()
                );
            },

        },

        watch: {
            selectedContentSections(newVal, oldVal) {
                //console.log(val);
                //console.log(newVal);
                //console.log(oldVal);
            },
        },
    }
</script>

<style scoped>
    .contentsectionbox {
        height: calc(100vh - 200px);
        /* height:200px; */
        width: 250px;

    }

    .contentsectionlist {
        overflow-y: auto;
        overflow-x: auto;
        width: 250px;
        height: calc(100vh - 255px);
    }

    .dialog--scroll {
        height: calc(100vh - 66px);
        overflow: auto;
    }
</style>