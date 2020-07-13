<template>
    <div id="pageVipCard" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--tool bar-->
            <div class="pb-5">
                <v-toolbar dense dark color="primary" :tile="false">
                    <v-btn icon class="hidden-xs-only" @click="gotoBack">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>

                    <v-toolbar-title>课程章节</v-toolbar-title>

                    <v-spacer></v-spacer>
                </v-toolbar>
            </div>

            <!--课程信息-->
            <div class="pb-5">
                <v-card class="mx-auto ">
                    <v-card-title>
                        课程信息
                    </v-card-title>
                    <v-card-text>
                        <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                            Id：{{ lessonItem.Id }}
                        </p>
                        <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                            课程名称：{{ lessonItem.Title }}
                        </p>
                    </v-card-text>
                </v-card>
            </div>

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

                        <v-data-table class="elevation-1 pl-4 pr-4" hide-default-footer :headers="searchModel.headers"
                            item-key="Id" :items="searchResult.list" :loading="searchModel.loading"
                            no-data-text="未查询到数据" loading-text="数据加载中..."
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

                            <template v-slot:item.Enable="{ item }">
                                <v-icon size="20" v-if="!item.Enable" @click="confirmSetEnable(item)"
                                    color="red lighten-2">
                                    mdi-cancel
                                </v-icon>
                                <v-icon size="20" v-else @click="confirmSetEnable(item)" color="green lighten-2">
                                    mdi-checkbox-marked-circle
                                </v-icon>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-icon size="20" class="mr-4" @click="openEdit(item)">
                                    edit
                                </v-icon>
                                <v-icon size="20" color="deep-orange" @click="confirmDelete(item)">
                                    mdi-delete-forever</v-icon>
                            </template>
                        </v-data-table>

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
                            <span>课程章节</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <!--课程目录-->
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-select :items="lessonCatalogList.list" dense label="课程目录" item-text="Title"
                                        item-value="Id" placeholder="请选择课程目录" v-model="updateItem.LessonCatalogId">
                                    </v-select>
                                </v-col>
                            </v-row>

                            <!--章节标题-->
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field v-model="updateItem.Title" dense label="名称" placeholder="请输入名称"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--关联知识点-->
                            <v-subheader class="mt-3">关联知识点</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <template
                                        v-if="updateItem.KnowledgePoints && updateItem.KnowledgePoints.length > 0">
                                        <div class="d-flex flex-wrap">
                                            <v-chip v-for="k in updateItem.KnowledgePoints" class="ma-2" close
                                                @click:close="knowledgePointsDelete(k)">
                                                {{k.FullName}}
                                            </v-chip>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <v-row>
                                            <v-col class="d-flex justify-center align-center">
                                                <span class="ma-4">未关联知识点</span>
                                            </v-col>
                                        </v-row>
                                    </template>
                                    <v-row>
                                        <v-col class="d-flex justify-center align-center">
                                            <v-btn @click="knowledgePointsSelectorShow" small
                                                color="light-blue darken-1" dark>
                                                添加知识点
                                            </v-btn>
                                        </v-col>

                                    </v-row>
                                </v-col>
                            </v-row>

                            <!--章节类型(视频,音频,图文)-->
                            <!--视频类型(录播,直播)-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select :items="chapterTypeList" dense label="章节类型" item-text="Name"
                                        item-value="Id" placeholder="请选择章节类型" v-model="updateItem.ChapterType">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select :items="videoTypeList" dense label="视频类型" item-text="Name" item-value="Id"
                                        placeholder="请选择视频类型" v-model="updateItem.VideoType"></v-select>
                                </v-col>
                            </v-row>

                            <!--VideoTime(秒)-->
                            <!--状态-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.VideoTime" label="视频时长(秒)" dense
                                        placeholder="请输入视频时长" :error-messages="errorMessages" ref="Entity_VideoTime"
                                        type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select :items="lessonStatusList" dense label="章节状态" item-text="Name"
                                        item-value="Id" placeholder="请选择章节状态" v-model="updateItem.Status">
                                    </v-select>
                                </v-col>
                            </v-row>



                            <!--是否是试听章节-->
                            <!--试听时长(秒)-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-switch v-model="updateItem.IsAudition" label="是否是试听章节"></v-switch>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.AuditionTime" label="试听时长(秒)"
                                        ref="EntityAuditionTime" :error-messages="errorMessages" type="number">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--是否定时上架-->

                            <!--存储方式(腾讯,阿里,七牛)-->
                            <!--VideoUrl-->
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-select :items="storeTypeList" dense label="视频存储" item-text="Name" item-value="Id"
                                        placeholder="请选择视频存储" v-model="updateItem.StoreType"></v-select>
                                </v-col>
                                <v-col cols="12" md="9">
                                    <v-text-field v-model="updateItem.VideoUrl" dense label="视频地址" placeholder="请输入视频地址"
                                        :rules="[() => !!updateItem.VideoUrl || '不能为空.']"
                                        :error-messages="errorMessages" ref="Entity_Title">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--序号-->
                            <!--是否启用-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="序号" ref="DisplayOrder"
                                        :error-messages="errorMessages" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                            </v-row>

                            <!--封面-->
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

                            <!--内容-->
                            <v-subheader class="mt-3">章节介绍</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <tinymce ref="editor" v-model="updateItem.Content" />
                                </v-col>
                            </v-row>

                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="closeUpdate" :disabled="saveLoading">取消
                        </v-btn>
                        <v-btn color="primary" @click="saveUpdate" :loading="saveLoading" :disabled="saveLoading">
                            保存</v-btn>
                    </v-card-actions>
                </v-card>

                <!--选择图片-->
                <picture-selector :isShow="imgSelectorSetting.show" v-on:on-show-change="pictureSelectorShowChange"
                    :multiple="false" :pictureField="imgSelectorSetting.pictureField" platformName="course"
                    :pictureUrlField="imgSelectorSetting.pictureUrlField" v-on:on-confirm="pictureSelectorConfirm">
                </picture-selector>

                <!--知识点选择器-->
                <knowledgePoints-selector :isShow="knowledgePointsSelectorSetting.show"
                    :selected="updateItem.KnowledgePoints" v-on:on-show-change="knowledgePointsSelectorShowChange"
                    v-on:on-confirm="knowledgePointsSelectorConfirm">
                </knowledgePoints-selector>
            </v-dialog>

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
                        <p class="mb-1">标题：{{updateItem.Title}}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="deleteDialog = false">取消</v-btn>
                        <v-btn color="primary" @click="saveDelete()">确定</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!--禁用启用-->
            <v-dialog v-model="setEnableDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline">提示</v-card-title>
                    <v-card-text>
                        <p v-if="updateItem.Enable" class="mb-1 subtitle-1 font-weight-bold">是否禁用该项目?</p>
                        <p v-else class="mb-1 subtitle-1 font-weight-bold">是否启用该项目?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
                        <p class="mb-1">标题：{{updateItem.Title}}</p>
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
        </v-container>
    </div>
</template>

<script>
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import KnowledgePointsSelector from '../../components/common/KnowledgePointsSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
            KnowledgePointsSelector,
        },

        data() {
            return {
                searchModel: {
                    searchName: '',
                    loading: false,
                    headers: [
                        { text: 'Id', value: 'Id' },
                        { text: '序号', value: 'DisplayOrder' },
                        { text: '名称', value: 'Title' },
                        { text: '关联知识点', value: 'KnowledgePoints' },
                        { text: '状态', value: 'Enable' },
                        { text: '操作', value: 'actions' },
                    ],
                    groupby: 'LessonCatalogTitle',
                    sortby: 'DisplayOrder',
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
                    Title: '',
                    Content: '',
                    ImageThumb_PictureId: 0,
                    ImageThumb_PictureUrl: '',
                    ChapterType: 0, //章节类型(视频,音频,图文)
                    VideoType: 0, //视频类型(录播,直播)
                    VideoTime: 0, //时长(秒)
                    Status: 0, //状态
                    DisplayOrder: 0,
                    IsAudition: false, //是否是试听章节
                    AuditionTime: 0, //试听时长(秒)
                    HasAvailable: false, //是否定时上架
                    AvailableStartDateTime: '',
                    AvailableEndDateTime: '',
                    VideoUrl: '',
                    StoreType: 0, //存储方式(腾讯,阿里,七牛)
                    LessonId: 0,
                    LessonCatalogId: 0,


                    KnowledgePoints: [],
                    LessonCatalog: null,
                    LessonCatalogTitle: '',
                },

                lessonItem: {
                    Id: 0,
                    Name: '',
                    Enable: true,
                    Description: '',
                    Content: '',  //内容
                    ImageThumb_PictureId: 0, //封面
                    ImageThumb_PictureUrl: '',
                    Title: '', //标题
                    Status: 0, //状态
                    Level: '', //Level(入门,进阶,高级)
                    SerializeStatus: 0, //连载状态(更新中,已完结)
                    DefaultDisplay: 0, //默认显示(课程目录,课程详情)
                    DisplayOrder: 0, //DisplayOrder
                    CourseType: 0, //CourseType
                    VirtualPV: 0, //虚拟访问量
                    VirtualPurchaseQuantity: 0, //虚拟购买量
                    WechatShareTitle: '', //
                    WechatShareImg: 0,
                    WechatShareImgUrl: '',
                    WechatShareDescription: '',
                    AllowReviews: false, //允许评论
                    HasStock: false, //是否有库存
                    HasUserAgreement: false, //是否有用户协议
                    UserAgreementText: '', //用户协议文本
                    StockQuantity: 0, //库存数
                    DisplayStockQuantity: false, //是否显示库存
                    OrderMinimumQuantity: 0, //最少订购数量
                    OrderMaximumQuantity: 0, //最高订购数量
                    DisableBuyButton: false, //是否显示购买按钮
                    Price: 0, //价格
                    OldPrice: 0, //旧价格
                    ProductCost: 0, //成本价
                    Badges: '', //徽章
                    HasDiscountsApplied: false, //是否有折扣
                    AvailableStartDateTime: '',
                    AvailableEndDateTime: '',
                    Published: false, //是否发布
                    ShortDescription: '', //简短说明
                    ShowOnHomePage: false, //是否显示在首页

                    //扩展数据
                    //任课讲师(已选择的)
                    Lecturers: [],

                    //课程分类(已选择的)
                    LessonCategories: [],
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

                //图片选择控件参数
                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                //知识点选择器设置
                knowledgePointsSelectorSetting: {
                    show: false,
                    selectedItems: [],
                },

                //课程目录
                lessonCatalogList: {
                    searchName: '',
                    list: [],
                },

                //知识点
                knowledgePointsList: {
                    searchName: '',
                    list: [],
                },

                //扩展数据
                //章节类型(视频,音频,图文)
                chapterTypeList: [
                    { Id: 1, Name: '视频' },
                    { Id: 2, Name: '音频' },
                    { Id: 3, Name: '图文' },
                ],

                //视频类型(录播,直播)
                videoTypeList: [
                    { Id: 1, Name: '录播' },
                    { Id: 2, Name: '直播' },
                ],

                //存储方式(腾讯,阿里,七牛)
                storeTypeList: [
                    { Id: 1, Name: '腾讯' },
                    { Id: 2, Name: '阿里' },
                    { Id: 3, Name: '七牛' },
                ],

                //课程状态
                lessonStatusList: [
                    { Id: 1, Name: '上架' },
                    { Id: 2, Name: '编辑中' },
                    { Id: 3, Name: '下架' },
                ],
            }
        },

        mounted() {
            let id = this.$route.params.id;
            this.getLessonInfo(id);
            this.loadLessonCatalogList(id);

            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                let id = this.$route.params.id;

                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/chapter/list', {
                    lessonId: id,
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;

                        this.searchResult.list = data.result.Data;

                        //console.log(data.result.Data);
                    } else {

                    }
                    this.loadingDialog.isShow = false;
                }).catch((error) => {

                    this.loadingDialog.isShow = false;
                });
            },

            prepareUpdateItem: function (item) {
                this.updateItem.Id = item.Id;
                this.updateItem.Description = item.Description;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Title = item.Title;
                this.updateItem.Content = item.Content;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.ChapterType = item.ChapterType; //章节类型(视频,音频,图文)
                this.updateItem.VideoType = item.VideoType; //视频类型(录播,直播)
                this.updateItem.VideoTime = item.VideoTime; //时长(秒)
                this.updateItem.Status = item.Status; //状态
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.IsAudition = item.IsAudition; //是否是试听章节
                this.updateItem.AuditionTime = item.AuditionTime; //试听时长(秒)
                this.updateItem.HasAvailable = item.HasAvailable; //是否定时上架
                this.updateItem.AvailableStartDateTime = item.AvailableStartDateTime;
                this.updateItem.AvailableEndDateTime = item.AvailableEndDateTime;
                this.updateItem.VideoUrl = item.VideoUrl;
                this.updateItem.StoreType = item.StoreType; //存储方式(腾讯,阿里,七牛)
                this.updateItem.LessonId = item.LessonId;
                this.updateItem.LessonCatalogId = item.LessonCatalogId;
                this.updateItem.LessonCatalog = item.LessonCatalog;
                this.updateItem.KnowledgePoints = item.KnowledgePoints;
            },

            openCreate: function () {
                let id = this.$route.params.id;

                this.updateItem.Id = 0;
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.Title = '';
                this.updateItem.Content = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.ChapterType = 0; //章节类型(视频,音频,图文)
                this.updateItem.VideoType = 0; //视频类型(录播,直播)
                this.updateItem.VideoTime = 0; //时长(秒)
                this.updateItem.Status = 0; //状态
                this.updateItem.DisplayOrder = 0;
                this.updateItem.IsAudition = false; //是否是试听章节
                this.updateItem.AuditionTime = 0; //试听时长(秒)
                this.updateItem.HasAvailable = false; //是否定时上架
                this.updateItem.AvailableStartDateTime = '';
                this.updateItem.AvailableEndDateTime = '';
                this.updateItem.VideoUrl = '';
                this.updateItem.StoreType = 0; //存储方式(腾讯,阿里,七牛)
                this.updateItem.LessonId = this.$route.params.id;
                this.updateItem.LessonCatalogId = 0;
                this.updateItem.KnowledgePoints = [];

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate: function () {
                let id = this.$route.params.id;

                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/course/backend/chapter/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveKnowledgePoints(data.result.Id);
                        } else {
                            this.saveFailed(data.errormessage);
                        }
                    }).catch((error) => {
                        this.saveFailed(error.message);
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/course/backend/chapter/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveKnowledgePoints(data.result.Id);
                        } else {
                            this.saveFailed(data.errormessage);
                        }
                    }).catch((error) => {
                        this.saveFailed(error.message);
                    });
                } else {
                    this.loadingDialog.isShow = false;
                }
            },

            saveSuccessed: function () {
                this.loadingDialog.isShow = false;
                this.updateDialog.isShow = false;
                this.$toast.success('保存成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                this.search(0);
            },

            saveFailed: function (errMsg) {
                this.loadingDialog.isShow = false;
                this.$toast.error('保存失败,请重新提交.</br>' + errMsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
            },

            saveKnowledgePoints: function (chapterId) {
                if (!chapterId || chapterId <= 0) {
                    this.saveSuccessed();
                    return;
                }

                if (!this.updateItem.KnowledgePoints || this.updateItem.KnowledgePoints.length <= 0) {
                    this.saveSuccessed();
                    return;
                }

                let knowledgePointsIds = new Array();
                this.updateItem.KnowledgePoints.forEach((val, index) => {
                    knowledgePointsIds.push(val.Id);
                })

                this.postAxios('/api/course/backend/chapter/AddKnowledgePoints', JSON.stringify({
                    chapterId: chapterId,
                    knowledgePoints: knowledgePointsIds,
                })).then(data => {
                    if (data.errorcode === 0) {
                        this.saveSuccessed();
                    } else {
                        this.saveFailed(data.errormessage);
                    }
                }).catch(error => {
                    this.saveFailed(data.errormessage);
                });
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

                this.getAxios('/api/course/backend/chapter/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/course/backend/chapter/setenable', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.Enable ? '禁用成功.' : '启用成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + data.errormsg : '启用失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + error.message : '启用失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            //加载课程目录
            loadLessonCatalogList: function (lessonId) {
                this.getAxios('/api/course/backend/lessoncatalog/GetAllEnable', {
                    lessonId: lessonId,
                    searchName: this.lessonCatalogList.searchName,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.lessonCatalogList.list = data.result.Data;
                    } else {

                    }
                }).catch((error) => {

                });
            },

            //获取课程信息
            getLessonInfo: function (lessonId) {
                this.getAxios('/api/course/backend/lesson/GetLessonById', { id: lessonId }).then((data) => {
                    if (data.errorcode === 0) {
                        this.lessonItem = data.result;
                    } else {

                    }
                }).catch((error) => {

                });
            },

            //封面图片选择 Begin
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
            //封面图片选择 End

            //知识点选择器 Begin
            knowledgePointsSelectorShowChange: function (val) {
                this.knowledgePointsSelectorSetting.show = val;
            },

            knowledgePointsSelectorConfirm: function (selectedItems) {
                //console.log(selectedItems);
                if (selectedItems && selectedItems.length > 0) {
                    this.updateItem.KnowledgePoints = selectedItems;
                }
            },

            knowledgePointsSelectorShow: function () {
                this.knowledgePointsSelectorSetting.show = true;
            },
            //知识点选择器 End

            knowledgePointsDelete: function (item) {
                if (item) {
                    if (this.updateItem.KnowledgePoints && this.updateItem.KnowledgePoints.length > 0) {
                        var i = this.updateItem.KnowledgePoints.indexOf(item);
                        this.updateItem.KnowledgePoints.splice(i, 1);
                    }
                }
            },

            gotoBack() {
                this.$router.go(-1);//返回上一层
            },
        },
    }
</script>

<style>
</style>