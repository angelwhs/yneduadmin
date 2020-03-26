<template>
    <div id="pageModule" class="page-wrapper">
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
                            <el-table-column prop="Display_Text" label="显示标题"></el-table-column>
                            <el-table-column prop="Sort" label="排序" min-width="20"></el-table-column>
                            <el-table-column prop="FormName" label="路由地址"></el-table-column>
                            <el-table-column prop="APIPermissionLinkUrl" label="API接口"></el-table-column>
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
            <v-dialog v-model="updateDialog.isShow" max-width="800px" persistent :disabled="saveLoading">
                <v-card ref="form">
                    <v-card-title>
                        <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                        <span>{{updateItem.ParentId > 0 ? '子' : ''}}</span>
                        <span>菜单</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col v-if="updateItem.ParentId > 0 && updateItem.Parent" cols="12" md="12">
                                    <v-expansion-panels>
                                        <v-expansion-panel>
                                            <v-expansion-panel-header>父节点：{{updateItem.Parent.Display_Text}}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <p class="mb-1 grey--text text--darken-1">Id：{{updateItem.Parent.Id}}
                                                </p>
                                                <p class="mb-1 grey--text text--darken-1">名称：{{updateItem.Parent.Name}}
                                                </p>
                                                <p class="mb-1 grey--text text--darken-1">
                                                    标题：{{updateItem.Parent.Display_Text}}</p>
                                                <p class="mb-1 grey--text text--darken-1">
                                                    路由地址：{{updateItem.Parent.FormName}}</p>
                                                <p class="mb-1 grey--text text--darken-1">
                                                    菜单类型：{{getModuleTypeName(updateItem.Parent.ModuleType)}}</p>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Display_Text" label="标题" dense
                                        :rules="[() => !!updateItem.Display_Text || '不能为空.']"
                                        :error-messages="errorMessages" ref="Entity_Display_Text">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Name" label="名称" dense
                                        :rules="[() => !!updateItem.Name || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Name">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field v-model="updateItem.FormName" label="路由地址" dense
                                        :rules="[() => !!updateItem.FormName || '不能为空.']"
                                        :error-messages="errorMessages" ref="Entity_FormName">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.OPCode" label="操作事件" dense ref="Entity_OPCode">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Pic_Big" label="显示图标" dense ref="Entity_Pic_Big">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Sort" label="序号" ref="Entity_Sort" dense
                                        :error-messages="errorMessages" :rules="[() => !!updateItem.Sort || '不能为空.']">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select :items="moduleTypeList" dense label="请选择菜单类型" item-text="Name"
                                        item-value="Id" v-model="updateItem.ModuleType"></v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="9">
                                    <v-text-field v-model="updateItem.APIPermissionLinkUrl" clearable dense readonly
                                        placeholder="请选择关联接口">

                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-btn color="primary" @click="openAPIDialog">
                                        浏览
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-switch v-model="updateItem.Enable" label="是否启用" dense></v-switch>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-switch v-model="updateItem.Hide" label="是否隐藏" dense></v-switch>
                                </v-col>
                            </v-row>
                            <v-row>

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

                    <!--接口查询-->
                    <v-dialog v-model="searchAPIModel.isShow" persistent>
                        <v-card>
                            <v-card-title class="headline"><span class="title">选择关联接口</span></v-card-title>
                            <v-row class="mx-auto ">
                                <v-col cols="12" md="10" class="d-flex justify-center align-center">
                                    <v-text-field class="subtitle-2 ml-4" v-model="searchAPIModel.searchName"
                                        label="搜索条件" dense>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2" class="d-flex justify-center align-center">
                                    <v-btn class="align-center" @click="searchAPI(0)">搜索</v-btn>
                                </v-col>
                            </v-row>

                            <div class="pa-2 pt-0">
                                <v-data-table :items="searchAPIModel.list" item-key="Id" hide-default-footer
                                    :headers="searchAPIModel.headers" show-select single-select
                                    v-model="searchAPIModel.selectedItem">

                                </v-data-table>
                            </div>

                            <!--接口查询 分页控件-->
                            <div class="pa-4">
                                <v-pagination v-model="searchAPIModel.pageSetting.page"
                                    :circle="searchAPIModel.pageSetting.circle"
                                    :disabled="searchAPIModel.pageSetting.disabled"
                                    :length="searchAPIModel.pageSetting.length"
                                    :next-icon="searchAPIModel.pageSetting.nextIcon"
                                    :prev-icon="searchAPIModel.pageSetting.prevIcon"
                                    :page="searchAPIModel.pageSetting.page"
                                    :total-visible="searchAPIModel.pageSetting.totalVisible"
                                    v-on:input="searchAPI(searchAPIModel.pageSetting.page - 1)"
                                    v-on:previous="searchAPI(searchAPIModel.pageSetting.page - 1)"
                                    v-on:Value="searchAPI(searchAPIModel.pageSetting.page - 1)">
                                </v-pagination>
                            </div>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="primary" text @click="closeAPIDialog">取消</v-btn>
                                <v-btn color="primary" @click="confirmAPI">确定</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                </v-card>
            </v-dialog>



            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">名称：{{updateItem.Name}}</p>
                        <p class="mb-1">标题：{{updateItem.Display_Text}}</p>
                        <p class="mb-1">路由地址：{{updateItem.FormName}}</p>
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
                        <p class="mb-1">名称：{{updateItem.Name}}</p>
                        <p class="mb-1">标题：{{updateItem.Display_Text}}</p>
                        <p class="mb-1">路由地址：{{updateItem.FormName}}</p>
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
    export default {
        data() {
            return {
                searchModel: {
                    searchName: '',
                },

                searchResult: {
                    totalCount: 2,
                    pageSize: 10000,
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
                    APIPermissionId: 0,
                    Description: '',
                    Display_SubText: '',
                    Display_Text: '',
                    Entry: '',
                    FormName: '',
                    Hide: false,
                    ModuleType: 1,
                    OPCode: '',
                    ParentId: 0,
                    Pic_Big: '',
                    Pic_Small: '',
                    APIPermissionLinkUrl: '',
                    Sort: 1,
                    Enable: true,
                    Parent: null,
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

                moduleTypeList: [
                    { Id: 1, Name: '菜单' },
                    { Id: 2, Name: '按钮' },
                ],

                searchAPIModel: {
                    isShow: false,
                    searchName: '',
                    list: [],
                    selectedItem: [],
                    selectedItemText: '',
                    totalCount: 2,
                    pageSize: 5,
                    pageSetting: {
                        circle: false,
                        disabled: false,
                        length: 1, //总共有几页
                        nextIcon: 'mdi-menu-right',
                        nextIcons: ['mdi-chevron-right', 'mdi-arrow-right', 'mdi-menu-right'],
                        prevIcon: 'mdi-menu-left',
                        prevIcons: ['mdi-chevron-left', 'mdi-arrow-left', 'mdi-menu-left'],
                        page: 1, //当前页面
                        totalVisible: 5, //最多显示几页按钮
                    },
                    headers: [
                        { text: '名称', value: 'Name' },
                        { text: '接口地址', value: 'LinkUrl' },
                    ],
                },
            }
        },

        created() {
            this.search(0);
        },

        computed: {

        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/identity/backend/module/list', {
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
                this.updateItem.APIPermissionId = item.APIPermissionId;
                this.updateItem.Name = item.Name;
                this.updateItem.Description = item.Description;
                this.updateItem.Display_SubText = item.Display_SubText;
                this.updateItem.Display_Text = item.Display_Text;
                this.updateItem.Entry = item.Entry;
                this.updateItem.FormName = item.FormName;
                this.updateItem.Hide = item.Hide;
                this.updateItem.ModuleType = item.ModuleType;
                this.updateItem.OPCode = item.OPCode;
                this.updateItem.ParentId = item.ParentId;
                this.updateItem.Pic_Big = item.Pic_Big;
                this.updateItem.Pic_Small = item.Pic_Small;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Sort = item.Sort;
                this.updateItem.APIPermissionLinkUrl = item.APIPermissionLinkUrl;
            },

            openCreate: function (item) {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.APIPermissionId = 0;
                this.updateItem.Description = '';
                this.updateItem.Display_SubText = '';
                this.updateItem.Display_Text = '';
                this.updateItem.Entry = '';
                this.updateItem.FormName = '';
                this.updateItem.Hide = false;
                this.updateItem.ModuleType = 1;
                this.updateItem.OPCode = '';
                this.updateItem.Pic_Big = '';
                this.updateItem.Pic_Small = '';
                this.updateItem.Sort = 1;
                this.updateItem.Enable = true;
                this.updateItem.APIPermissionLinkUrl = '';

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

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.Parent) {
                    this.updateItem.Parent = null;
                }

                if (this.updateItem.APIPermissionLinkUrl === undefined ||
                    this.updateItem.APIPermissionLinkUrl === null ||
                    this.updateItem.APIPermissionLinkUrl === '') {
                        this.updateItem.APIPermissionId = 0;
                }

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/identity/backend/module/create', JSON.stringify(this.updateItem)).then((data) => {
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
                    this.postAxios('/api/identity/backend/module/edit', JSON.stringify(this.updateItem)).then((data) => {
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

                this.getAxios('/api/identity/backend/module/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/identity/backend/module/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            getModuleTypeName: function (moduleType) {
                if (moduleType === 1) {
                    return '菜单';
                } else if (moduleType === 2) {
                    return '按钮';
                } else {
                    return '未知';
                }
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

            openAPIDialog: function () {
                this.searchAPI(0);

                this.searchAPIModel.isShow = true;
            },

            searchAPI: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/identity/backend/apipermission/list', {
                    searchName: this.searchAPIModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchAPIModel.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchAPIModel.pageSetting.page = data.result.PageIndex + 1;
                        this.searchAPIModel.pageSetting.length = data.result.TotalPages;

                        this.searchAPIModel.totalCount = data.result.TotalCount;

                        this.searchAPIModel.list = data.result.APIPermissions;


                    } else {

                    }
                    this.loadingDialog.isShow = false;
                }).catch((error) => {

                    this.loadingDialog.isShow = false;
                });
            },

            closeAPIDialog: function () {
                this.searchAPIModel.selectedItem = [];
                this.searchAPIModel.isShow = false;
            },

            confirmAPI: function () {
                if (this.searchAPIModel.selectedItem && this.searchAPIModel.selectedItem.length > 0) {
                    let item = this.searchAPIModel.selectedItem[0];
                    this.updateItem.APIPermissionId = item.Id;
                    this.updateItem.APIPermissionLinkUrl = item.LinkUrl;
                    this.searchAPIModel.isShow = false;
                } else {
                    this.$toast.error('请选择接口.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                }
            },

        },
    }
</script>

<style scoped>
    .dialog-bg {
        background-color: white;
    }
</style>

<style>
    .table-header-row {
        color: rgba(0, 0, 0, 0.6);
    }
</style>