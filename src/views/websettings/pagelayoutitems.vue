<template>
    <div id="pageNavigationBar" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--tool bar-->
            <div class="pb-5">
                <v-toolbar dense dark color="primary" :tile="false">
                    <v-btn icon class="hidden-xs-only" @click="gotoBack">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>

                    <v-toolbar-title>页面内容管理</v-toolbar-title>

                    <v-spacer></v-spacer>
                </v-toolbar>
            </div>

            <!--页面信息-->
            <div class="pb-5">
                <v-card class="mx-auto ">
                    <v-card-title>
                        页面信息
                    </v-card-title>
                    <v-card-text>
                        <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                            Id：{{ pageLayout.Id }}
                        </p>
                        <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                            名称：{{ pageLayout.Title }}
                        </p>
                        <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                            类型：{{ getLayoutTypeName(pageLayout.LayoutType) }}
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
                        <el-table fixed-header class="pl-4 pr-4" row-key="Id" :data="searchResult.list" size="small"
                            header-row-class-name="table-header-row"
                            :tree-props="{children: 'Childs', hasChildren: 'Childs.length > 0'}">
                            <el-table-column prop="Id" label="Id" align="center" min-width="60"></el-table-column>
                            <el-table-column prop="Title" label="标题"></el-table-column>
                            <el-table-column prop="DisplayOrder" label="排序" min-width="20"></el-table-column>
                            <el-table-column prop="Enable" label="状态" min-width="30">
                                <template slot-scope="scope">
                                    <v-icon size="20" v-if="!scope.row.Enable" @click="confirmSetEnable(scope.row)"
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


                </div>
            </div>

            <!--创建/更新-->
            <v-dialog v-model="updateDialog.isShow" persistent fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card ref="form">
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="updateDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                            <span>页面内容管理</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
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
                                                <p class="mb-1 grey--text text--darken-1">控件类型：{{updateItem.Parent.ControlType}}
                                                </p>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Title" label="标题"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.SubTitle" label="副标题"
                                        :error-messages="errorMessages" ref="Entity_SubTitle">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select :items="layoutTypeList" dense label="页面内容类型" item-text="Name" item-value="Id"
                                    v-model="updateItem.LayoutType"></v-select>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select :items="controlTypeList" dense label="控件类型" item-text="Name" item-value="Id"
                                    v-model="updateItem.ControlType"></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.IsCMS" label="是否CMS栏目" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <el-cascader :options="searchArticleContentSectionResult.list" clearable :disabled="!updateItem.IsCMS"
                                        v-model="selectedContentSections" :props="contentSectionSelectProps"
                                        style="width: 100%;" placeholder="请选择栏目" ref="contentSectionSelector">
                                    </el-cascader>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-card-title>
                                            封面
                                        </v-card-title>
                                        <template>
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
                                        </template>

                                    </v-card>
                                </v-col>
                                
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.IsLink" label="是否转向链接" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-text-field v-model="updateItem.LinkUrl" label="链接地址" dense
                                        :error-messages="errorMessages" ref="Entity_LinkUrl"
                                        :disabled="!updateItem.IsLink">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.IsShowMoreButton" label="是否显示更多按钮" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-text-field v-model="updateItem.MoreButtonTitle" label="更多按钮文字" dense
                                        :error-messages="errorMessages" ref="Entity_MoreButtonTitle"
                                        :disabled="!updateItem.IsShowMoreButton">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="updateItem.MoreButtonLinkUrl" label="更多按钮链接" dense
                                        :error-messages="errorMessages" ref="Entity_MoreButtonLinkUrl">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.ShowCount" label="显示个数" ref="ShowCount"
                                        :error-messages="errorMessages"
                                        :rules="[() => !!updateItem.ShowCount || '不能为空.']">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="序号" ref="DisplayOrder"
                                        :error-messages="errorMessages"
                                        :rules="[() => !!updateItem.DisplayOrder || '不能为空.']">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
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
                    ParentId: 0,
                    DisplayOrder: 0,
                    CMSContentSectionId: 0,
                    IsCMS: false,
                    LayoutType: 0,
                    ControlType: 0,
                    ShowCount: 0,
                    IsLink: false,
                    LinkUrl: '',
                    Title: '',
                    SubTitle: '',
                    IsShowTitle: false,
                    IsShowSubTitle: false,
                    ImageThumb_PictureId: 0,
                    IsShowMoreButton: false,
                    MoreButtonTitle: '',
                    MoreButtonLinkUrl: '',
                    MoreButton_PictureId: 0,
                    PageLayoutId: 0,
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

                pageLayout: {
                    Id: 0,
                    Name: '',
                    Enable: true,
                    Description: '',
                    Title: '',
                    SubTitle: '',
                    DisplayOrder: 0,
                    ParentId: 0,
                    IsCMS: false,
                    CMSContentSectionId: 0,
                    LayoutType: 0,
                    IsShowTitle: false,
                    IsShowSubTitle: false,
                },

                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                layoutTypeList: [
                    {Id: 1, Name: '页面'},
                    {Id: 2, Name: '版块'},
                    {Id: 3, Name: '控件'},
                ],

                controlTypeList: [
                    {Id: 1, Name: '滚动控件'},
                    {Id: 2, Name: '图片菜单'},
                    {Id: 3, Name: '详情卡片'},
                    {Id: 4, Name: '带标题图片卡片'},
                    {Id: 5, Name: '音乐卡片'},
                    {Id: 6, Name: '视频卡片'},
                ],

                searchArticleContentSectionModel: {
                    searchName: '',
                },

                searchArticleContentSectionResult: {
                    totalCount: 2,
                    pageSize: 1000,
                    list: [],
                },

                contentSectionSelectProps: {
                    multiple: false,
                    checkStrictly: true,
                    label: 'Title',
                    children: 'Childs',
                    value: 'Id',
                    emitPath: false,
                },

                selectedContentSections: 0,
            }
        },

        created() {
            this.searchArticleContentSection();

            let pageLayoutId = this.$route.params.id;
            this.getPageLayout(pageLayoutId);
        },

        methods: {
            search: function (pageIndex) {
                let pagelayoutId = this.$route.params.id;

                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/pagelayout/ItemList', {
                    pagelayoutId: pagelayoutId,
                    searchName: this.searchModel.searchName,
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
                this.updateItem.Description = item.Description;
                this.updateItem.ParentId = item.ParentId;
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.CMSContentSectionId = item.CMSContentSectionId;
                this.updateItem.IsCMS = item.IsCMS;
                this.updateItem.LayoutType = item.LayoutType;
                this.updateItem.ControlType = item.ControlType;
                this.updateItem.ShowCount = item.ShowCount;
                this.updateItem.IsLink = item.IsLink;
                this.updateItem.LinkUrl = item.LinkUrl;
                this.updateItem.Title = item.Title;
                this.updateItem.SubTitle = item.SubTitle;
                this.updateItem.IsShowTitle = item.IsShowTitle;
                this.updateItem.IsShowSubTitle = item.IsShowSubTitle;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.IsShowMoreButton = item.IsShowMoreButton;
                this.updateItem.MoreButtonTitle = item.MoreButtonTitle;
                this.updateItem.MoreButtonLinkUrl = item.MoreButtonLinkUrl;
                this.updateItem.MoreButton_PictureId = item.MoreButton_PictureId;
                this.updateItem.PageLayoutId = item.PageLayoutId;
            },

            openCreate: function (item) {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Enable = true;
                this.updateItem.Description = '';
                this.updateItem.ParentId = 0;
                this.updateItem.DisplayOrder = 1;
                this.updateItem.CMSContentSectionId = 0;
                this.updateItem.IsCMS = false;
                this.updateItem.LayoutType = 3;
                this.updateItem.ControlType = 1;
                this.updateItem.ShowCount = 1;
                this.updateItem.IsLink = false;
                this.updateItem.LinkUrl = '';
                this.updateItem.Title = '';
                this.updateItem.SubTitle = '';
                this.updateItem.IsShowTitle = false;
                this.updateItem.IsShowSubTitle = false;
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.IsShowMoreButton = false;
                this.updateItem.MoreButtonTitle = '';
                this.updateItem.MoreButtonLinkUrl = '';
                this.updateItem.MoreButton_PictureId = 0;
                this.updateItem.PageLayoutId = 0;

                if (this.pageLayout && this.pageLayout.Id > 0) {
                    this.updateItem.NavigationBarId = this.pageLayout.Id;
                }

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

                if (item.ParentId > 0) {
                    let parent = this.getParentNode(this.searchResult.list, item.ParentId);
                    if (parent) {
                        this.updateItem.Parent = parent;
                    } else {
                        this.updateItem.Parent = null;
                    }
                } else {
                    this.updateItem.Parent = null;
                }

                this.updateDialog.isShow = true;
            },

            getParentNode: function (treelist, parentId) {
                let result = null

                for (let i = 0; i < treelist.length; i++) {
                    let obj = treelist[i];
                    if (obj && obj.Id === parentId) {
                        return obj;
                    } else {
                        if (obj.Childs && obj.Childs.length > 0) {
                            result = this.getParentNode(obj.Childs, parentId);
                            if (result) {
                                break;
                            }
                        } else {
                            continue;
                        }
                    }
                }

                return result;
            },

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.Parent) {
                    this.updateItem.Parent = null;
                }

                if(this.selectedContentSections && this.selectedContentSections > 0 && this.updateItem.IsCMS) {
                    this.updateItem.CMSContentSectionId = this.selectedContentSections;
                }

                if(this.pageLayout) {
                    this.updateItem.PageLayoutId = this.pageLayout.Id;
                }

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/cms/backend/pagelayout/ItemCreate', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('新增成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('新增失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                            //console.log(data);
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/cms/backend/pagelayout/ItemEdit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('修改成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('修改失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
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

                this.getAxios('/api/cms/backend/pagelayout/ItemDelete', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.deleteDialog = false;
                        this.$toast.success('删除成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('删除失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('删除失败,请重新提交.</br>' + error.message, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                });
            },

            confirmSetEnable: function (item) {
                this.prepareUpdateItem(item);
                this.setEnableDialog = true;
            },

            saveSetEnable: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/cms/backend/pagelayout/ItemSetEnable', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.Enable ? '禁用成功.' : '启用成功', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + data.errormsg : '启用失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + error.message : '启用失败,请重新提交.</br>' + error.message, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                });
            },

            getPageLayout(id) {
                this.getAxios('/api/cms/backend/pagelayout/GetPageLayout', {id:id}).then((data) => {
                    if(data.errorcode === 0) {
                        this.pageLayout = data.result;
                    } else {

                    }
                }).catch((error) => {

                });
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

            getLayoutTypeName: function(layoutType) {
                let name = '未知';

                switch (layoutType) {
                    case 1:
                        name = '页面';
                        break;
                    case 2:
                        name = '版块';
                        break;
                    case 3:
                        name = '控件';
                        break;
                    default:
                        break;
                }

                return name;
            },

            getControlTypeName(controlType) {
                let name = '未知';

                switch(controlType) {
                    case 1:
                        name = '滚动控件';
                        break;
                    case 2:
                        name = '图片菜单';
                        break;
                    case 3:
                        name = '详情卡片';
                        break;
                    case 4:
                        name = '带标题图片卡片';
                        break;
                    case 5:
                        name = '音乐卡片';
                        break;
                    case 6:
                        name = '视频卡片';
                        break;
                    default:
                        break;
                }
            },

            gotoBack() {
                this.$router.go(-1);//返回上一层
            },

            //加载文章详情页的栏目combobox
            searchArticleContentSection: function () {
                this.getAxios('/api/cms/backend/contentsection/GetListByEnable', {
                    searchName: this.searchArticleContentSectionModel.searchName,
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

        },
    }
</script>

<style scoped>

</style>