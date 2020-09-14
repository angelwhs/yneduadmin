<template>
    <div id="pageContentSection" class="page-wrapper">
        <v-container grid-list-xl fluid>
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
                        <v-toolbar-title>查询结果</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-btn color="primary" dark class="mb-2" @click="openCreate(null)">新建</v-btn>
                        <v-spacer></v-spacer>
                    </v-toolbar>

                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">
                        <el-table fixed-header class="pl-4 pr-4" row-key="Id" :data="searchResult.list" size="small"
                            header-row-class-name="table-header-row"
                            :tree-props="{children: 'Childs', hasChildren: 'Childs.length > 0'}">
                            <el-table-column prop="Id" label="Id" align="center" min-width="60"></el-table-column>
                            <el-table-column prop="Title" label="显示标题"></el-table-column>
                            <el-table-column prop="Sort" label="排序" min-width="20"></el-table-column>
                            <el-table-column prop="ShowCount" label="显示个数"></el-table-column>
                            <el-table-column prop="ShowType" label="显示类型">
                                <template slot-scope="scope">
                                    <span>{{getShowTypeName(scope.row.ShowType)}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="Visible" label="是否显示" min-width="30">
                                <template slot-scope="scope">
                                    <v-icon size="20" v-if="!scope.row.Visible" @click="confirmSetEnable(scope.row)"
                                        color="red lighten-2">
                                        mdi-cancel
                                    </v-icon>
                                    <v-icon size="20" v-else @click="confirmSetEnable(scope.row)"
                                        color="green lighten-2">
                                        mdi-checkbox-marked-circle
                                    </v-icon>
                                </template>
                            </el-table-column>
                            <el-table-column align="left" label="操作">
                                <template slot-scope="scope">
                                    <v-icon size="20" class="mr-4" @click="openCreate(scope.row)">
                                        add_box
                                    </v-icon>
                                    <v-icon size="20" class="mr-4" @click="openEdit(scope.row)">
                                        edit
                                    </v-icon>
                                    <v-icon size="20" color="deep-orange" @click="confirmDelete(scope.row)">
                                        mdi-delete-forever</v-icon>
                                </template>
                            </el-table-column>
                        </el-table>
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
                            <span>{{updateItem.ParentId > 0 ? '子' : ''}}</span>
                            <span>栏目</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text class="dialog--scroll">
                        <v-container>
                            <v-row>
                                <v-col v-if="updateItem.ParentId > 0 && updateItem.Parent" cols="12" md="12">
                                    <v-expansion-panels>
                                        <v-expansion-panel>
                                            <v-expansion-panel-header>父节点：{{updateItem.Parent.Title}}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <p class="mb-1 grey--text text--darken-1">Id：{{updateItem.Parent.Id}}
                                                </p>
                                                <p class="mb-1 grey--text text--darken-1">标题：{{updateItem.Parent.Title}}
                                                </p>
                                                <p class="mb-1 grey--text text--darken-1">
                                                    页面地址：{{updateItem.Parent.PageUrl}}</p>
                                                <p class="mb-1 grey--text text--darken-1">
                                                    展示类型：{{getShowTypeName(updateItem.Parent.ShowType)}}</p>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="5">
                                    <v-text-field v-model="updateItem.Title" label="标题" dense
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="5">
                                    <v-text-field v-model="updateItem.SubTitle" label="副标题" dense
                                        :error-messages="errorMessages" ref="Entity_SubTitle">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="updateItem.Sort" label="排序" dense
                                        :error-messages="errorMessages" ref="Entity_Sort" type="number">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field v-model="updateItem.PageUrl" label="页面地址" dense
                                        :error-messages="errorMessages" ref="Entity_PageUrl">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.Visible" label="是否显示" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="updateItem.ShowCount" label="显示个数" dense
                                        :error-messages="errorMessages" ref="Entity_Sort" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="updateItem.ShowRowCount" label="显示行数" dense
                                        :error-messages="errorMessages" ref="Entity_Sort" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="5">
                                    <v-select :items="showTypeList" label="展示类型" placeholder="请选择展示类型" dense
                                        item-text="Name" item-value="Id" v-model="updateItem.ShowType">
                                    </v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.IsShowTitle" label="是否显示栏目标题" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.IsShowSubTitle" label="是否显示副标题" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.IsShowArticleTitle" label="是否显示文章标题" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.IsShowArticleSummary" label="是否显示简介" dense></v-switch>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.IsShowArticleAuthor" label="是否显示作者" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.IsShowContentSectionChild" label="是否显示子栏目" dense></v-switch>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.Enable" label="是否启用" dense></v-switch>
                                </v-col>
                            </v-row>
                            <v-subheader class="mt-3">栏目展示图片</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-switch v-model="updateItem.IsShowImageThumb" label="是否显示封面" dense></v-switch>
                                        <template
                                            v-if="updateItem.ImageThumb_PictureUrl && updateItem.ImageThumb_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain
                                                :src="updateItem.ImageThumb_PictureUrl" aspect-ratio="1"
                                                ref="Entity_ImageThumb_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center" style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.ImageThumb_PictureId"
                                            ref="Entity_ImageThumb_PictureId" />
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
                                <v-col cols="12" md="6">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-switch v-model="updateItem.IsShowImageTop" label="是否显示顶部图片" dense></v-switch>
                                        <template
                                            v-if="updateItem.ImageTop_PictureUrl && updateItem.ImageTop_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain
                                                :src="updateItem.ImageTop_PictureUrl" aspect-ratio="1"
                                                ref="Entity_ImageTop_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center" style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.ImageTop_PictureId"
                                            ref="Entity_ImageTop_PictureId" />
                                        <div class="d-flex justify-center mt-2">
                                            <v-btn
                                                @click="pictureSelectorShow('ImageTop_PictureId', 'ImageTop_PictureUrl')"
                                                class="mr-12" small color="light-blue darken-1" dark>
                                                选择图片
                                            </v-btn>
                                            <v-btn
                                                @click="updateItem.ImageTop_PictureId=0;updateItem.ImageTop_PictureUrl=''"
                                                small color="light-blue darken-1" dark>
                                                删除图片
                                            </v-btn>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-switch v-model="updateItem.IsShowImageBottom" label="是否显示底部图片" dense></v-switch>
                                        <template
                                            v-if="updateItem.ImageBottom_PictureUrl && updateItem.ImageBottom_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain
                                                :src="updateItem.ImageBottom_PictureUrl" aspect-ratio="1"
                                                ref="Entity_ImageBottom_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center" style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.ImageBottom_PictureId"
                                            ref="Entity_ImageBottom_PictureId" />
                                        <div class="d-flex justify-center mt-2">
                                            <v-btn
                                                @click="pictureSelectorShow('ImageBottom_PictureId', 'ImageBottom_PictureUrl')"
                                                class="mr-12" small color="light-blue darken-1" dark>
                                                选择图片
                                            </v-btn>
                                            <v-btn
                                                @click="updateItem.ImageBottom_PictureId=0;updateItem.ImageBottom_PictureUrl=''"
                                                small color="light-blue darken-1" dark>
                                                删除图片
                                            </v-btn>
                                        </div>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-switch v-model="updateItem.IsShowMoreButton" label="是否显示更多按钮" dense></v-switch>
                                        <template
                                            v-if="updateItem.MoreButton_PictureUrl && updateItem.MoreButton_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain
                                                :src="updateItem.MoreButton_PictureUrl" aspect-ratio="1"
                                                ref="Entity_MoreButton_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center" style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.MoreButton_PictureId"
                                            ref="Entity_MoreButton_PictureId" />
                                        <div class="d-flex justify-center mt-2">
                                            <v-btn
                                                @click="pictureSelectorShow('MoreButton_PictureId', 'MoreButton_PictureUrl')"
                                                class="mr-12" small color="light-blue darken-1" dark>
                                                选择图片
                                            </v-btn>
                                            <v-btn
                                                @click="updateItem.MoreButton_PictureId=0;updateItem.MoreButton_PictureUrl=''"
                                                small color="light-blue darken-1" dark>
                                                删除图片
                                            </v-btn>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    
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

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">标题：{{updateItem.Title}}</p>
                        <p class="mb-1">展示类型：{{updateItem.ShowType}}</p>
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
                        <p class="mb-1">标题：{{updateItem.Title}}</p>
                        <p class="mb-1">展示类型：{{updateItem.ShowType}}</p>
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
    import PictureSelector from '../../components/common/PictureSelector.vue';

    export default {
        components: {
            PictureSelector,
        },

        data() {
            return {
                searchModel: {
                    searchName: '',
                },

                searchResult: {
                    totalCount: 1,
                    pageSize: 99999,
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
                    Title: '',
                    ParentId: 0,
                    Sort: 0,
                    SubTitle: '',
                    ShowCount: 0,
                    ShowRowCount: 0,
                    Visible: true,
                    PageUrl: '',
                    Enable: true,
                    IsShowTitle: false,
                    IsShowSubTitle: false,
                    IsShowArticleTitle: false,
                    IsShowArticleSummary: false,
                    IsShowArticleAuthor: false,
                    IsShowContentSectionChild: false,
                    IsShowImageThumb: false,
                    IsShowImageTop: false,
                    IsShowImageBottom: false,
                    IsShowMoreButton: false,
                    MoreButtonTitle: '',
                    MoreButtonLinkUrl: '',
                    ShowType: 0,
                    ImageThumb_PictureUrl: '',
                    ImageBottom_PictureUrl: '',
                    ImageTop_PictureUrl: '',
                    MoreButton_PictureUrl: '',
                    ImageThumb_PictureId: 0,
                    ImageBottom_PictureId: 0,
                    ImageTop_PictureId: 0,
                    MoreButton_PictureId: 0,
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

                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                showTypeList: [
                    { Id: 1, Name: 'Banner轮播' },
                    { Id: 2, Name: '精彩内容轮播' },
                    { Id: 3, Name: '菜单图标' },
                    { Id: 4, Name: '电视图标' },
                    { Id: 8, Name: '自定义组件' },
                    { Id: 9, Name: '页面' },
                    { Id: 11, Name: '1行1个' },
                    { Id: 12, Name: '1行2个' },
                    { Id: 13, Name: '1行3个' },
                    { Id: 14, Name: '1行4个' },
                    { Id: 15, Name: '1行1个(样式1)' },
                    { Id: 16, Name: '1行1个(样式2)' },
                    { Id: 17, Name: '1行2个(专辑)' },
                    { Id: 21, Name: '带详情-1行1个(大)' },
                    { Id: 22, Name: '带详情-1行1个(小)' },
                    { Id: 23, Name: '带详情-1行2个' },
                    { Id: 31, Name: '音乐-1行1首' },
                    { Id: 32, Name: '音乐-1行3首' },
                    { Id: 33, Name: '音乐-1行1首(带介绍)' },
                    { Id: 34, Name: '音乐-1行1首(无介绍)' },
                    { Id: 51, Name: '广告位-1行1个' },
                    { Id: 61, Name: 'CMS-大幅封面图' },
                    { Id: 62, Name: 'CMS-文章标题、作者、时间' },
                    { Id: 63, Name: 'CMS-文章带详情' },
                    { Id: 64, Name: 'CMS-多图片' },
                    { Id: 71, Name: '校友会-班级列表' },
                    { Id: 72, Name: '校友会-班级详细信息' },
                ],

            }
        },

        created() {
            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/contentsection/list', {
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
                this.updateItem.Name = item.Name;
                this.updateItem.Title = item.Title;
                this.updateItem.ParentId = item.ParentId;
                this.updateItem.Sort = item.Sort;
                this.updateItem.SubTitle = item.SubTitle;
                this.updateItem.ShowCount = item.ShowCount;
                this.updateItem.ShowRowCount = item.ShowRowCount;
                this.updateItem.Visible = item.Visible;
                this.updateItem.PageUrl = item.PageUrl;
                this.updateItem.IsShowTitle = item.IsShowTitle;
                this.updateItem.IsShowSubTitle = item.IsShowSubTitle;
                this.updateItem.IsShowArticleTitle = item.IsShowArticleTitle;
                this.updateItem.IsShowArticleSummary = item.IsShowArticleSummary;
                this.updateItem.IsShowArticleAuthor = item.IsShowArticleAuthor;
                this.updateItem.IsShowContentSectionChild = item.IsShowContentSectionChild;
                this.updateItem.IsShowImageThumb = item.IsShowImageThumb;
                this.updateItem.IsShowImageTop = item.IsShowImageTop;
                this.updateItem.IsShowImageBottom = item.IsShowImageBottom;
                this.updateItem.IsShowMoreButton = item.IsShowMoreButton;
                this.updateItem.MoreButtonTitle = item.MoreButtonTitle;
                this.updateItem.MoreButtonLinkUrl = item.MoreButtonLinkUrl;
                this.updateItem.Enable = item.Enable;
                this.updateItem.ShowType = item.ShowType;
                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.ImageBottom_PictureUrl = item.ImageBottom_PictureUrl;
                this.updateItem.ImageTop_PictureUrl = item.ImageTop_PictureUrl;
                this.updateItem.MoreButton_PictureUrl = item.MoreButton_PictureUrl;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.ImageBottom_PictureId = item.ImageBottom_PictureId;
                this.updateItem.ImageTop_PictureId = item.ImageTop_PictureId;
                this.updateItem.MoreButton_PictureId = item.MoreButton_PictureId;
            },

            openCreate: function (item) {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Title = '';
                this.updateItem.ParentId = 0;
                this.updateItem.Sort = 0;
                this.updateItem.SubTitle = '';
                this.updateItem.ShowCount = 0;
                this.updateItem.ShowRowCount = 0;
                this.updateItem.Visible = true;
                this.updateItem.PageUrl = '';
                this.updateItem.IsShowTitle = true;
                this.updateItem.IsShowSubTitle = false;
                this.updateItem.IsShowArticleTitle = false;
                this.updateItem.IsShowArticleSummary = false;
                this.updateItem.IsShowArticleAuthor = false;
                this.updateItem.IsShowContentSectionChild = false;
                this.updateItem.IsShowImageThumb = false;
                this.updateItem.IsShowImageTop = false;
                this.updateItem.IsShowImageBottom = false;
                this.updateItem.IsShowMoreButton = false;
                this.updateItem.MoreButtonTitle = '';
                this.updateItem.MoreButtonLinkUrl = '';
                this.updateItem.Enable = true;
                this.updateItem.Roles = [];
                this.updateItem.ShowType = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.ImageBottom_PictureUrl = '';
                this.updateItem.ImageTop_PictureUrl = '';
                this.updateItem.MoreButton_PictureUrl = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.ImageBottom_PictureId = 0;
                this.updateItem.ImageTop_PictureId = 0;
                this.updateItem.MoreButton_PictureId = 0;

                if (item) {
                    this.updateItem.Parent = item;
                    this.updateItem.ParentId = item.Id;
                } else {
                    this.updateItem.Parent = null;
                    this.updateItem.ParentId = 0;
                }

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/cms/backend/contentsection/create', JSON.stringify(this.updateItem)).then((data) => {
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
                    this.postAxios('/api/cms/backend/contentsection/edit', JSON.stringify(this.updateItem)).then((data) => {
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

                this.getAxios('/api/cms/backend/contentsection/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/cms/backend/contentsection/SetVisible', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.Visible ? '隐藏成功.' : '显示成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.Visible ? '隐藏失败,请重新提交.</br>' + data.errormsg : '显示失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.Visible ? '隐藏失败,请重新提交.</br>' + error.message : '显示失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },


            getShowTypeName: function (showType) {
                let typeName = '未知';

                switch (showType) {
                    case 1:
                        typeName = 'Banner轮播';
                        break;
                    case 2:
                        typeName = '精彩内容轮播';
                        break;
                    case 3:
                        typeName = '菜单图标';
                        break;
                    case 4:
                        typeName = '电视图标';
                        break;
                    case 8:
                        typeName = '自定义组件';
                        break;
                    case 9:
                        typeName = '页面';
                        break;
                    case 11:
                        typeName = '橱窗-1行1个';
                        break;
                    case 12:
                        typeName = '橱窗-1行2个';
                        break;
                    case 13:
                        typeName = '橱窗-1行3个';
                        break;
                    case 14:
                        typeName = '橱窗-1行4个';
                        break;
                    case 15:
                        typeName = '橱窗-1行1个(样式1)';
                        break;
                    case 16:
                        typeName = '橱窗-1行1个(样式2)';
                        break;
                    case 17:
                        typeName = '橱窗-1行2个(专辑)';
                        break;
                    case 21:
                        typeName = '带详情-1行1个(大)';
                        break;
                    case 22:
                        typeName = '带详情-1行1个(小)';
                        break;
                    case 23:
                        typeName = '带详情-1行2个';
                        break;
                    case 51:
                        typeName = '广告位-1行1个';
                        break;
                    case 61:
                        typeName = 'CMS-大幅封面图';
                        break;
                    case 62:
                        typeName = 'CMS-文章标题、作者、时间';
                        break;
                    case 63:
                        typeName = 'CMS-文章带详情';
                        break;
                    case 64:
                        typeName = 'CMS-多图片';
                        break;
                    case 71:
                        typeName = '校友会-班级列表';
                        break;
                    case 72:
                        typeName = '校友会-班级详细信息';
                        break;
                    default:
                        break;
                }

                
                return typeName;
            },

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
        },
    }
</script>

<style scoped>
    .dialog--scroll {
        height: calc(100vh - 66px);
        overflow: auto;
    }
</style>