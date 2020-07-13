<template>
    <div id="pageArticleTag" class="page-wrapper">
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
                        <v-toolbar-title class="title">查询结果</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-btn color="primary" dark class="mb-2" @click="openCreate">新建</v-btn>
                        <v-spacer></v-spacer>
                    </v-toolbar>

                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">
                        <v-simple-table fixed-header class="pl-4 pr-4">
                            <thead>
                                <tr>
                                    <th class="text-left">Id</th>
                                    <th class="text-left">姓名</th>
                                    <th class="text-left">关联机构</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.RealName }}</td>
                                        <td>
                                            <template v-if="item.Departments && item.Departments.length">
                                                <v-row v-for="d in item.Departments">
                                                    <v-chip small class="mt-1 mb-1">
                                                        <template v-if="d.Company">{{d.Company.Title + ' - '}}</template>
                                                        {{d.FullTitle}}
                                                    </v-chip>
                                                </v-row>
                                            </template>
                                        </td>
                                        <td>
                                            <v-icon size="20" v-if="!item.Enable" @click="confirmSetEnable(item)"
                                                color="red lighten-2">
                                                mdi-cancel
                                            </v-icon>
                                            <v-icon size="20" v-else @click="confirmSetEnable(item)"
                                                color="green lighten-2">
                                                mdi-checkbox-marked-circle
                                            </v-icon>
                                        </td>
                                        <td>
                                            <v-icon size="20" class="mr-4" @click="openEdit(item)">
                                                edit
                                            </v-icon>
                                            <v-icon size="20" color="deep-orange" @click="confirmDelete(item)">
                                                mdi-delete-forever</v-icon>
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
                            <span>讲师</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.RealName" label="真实姓名" dense placeholder="请输入真实姓名"
                                        :rules="[() => !!updateItem.RealName || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_RealName">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-select :items="statusList" dense label="审核状态" item-text="Name" item-value="Id"
                                        placeholder="请选择审核状态" v-model="updateItem.Status"></v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-select :items="sexlist" dense label="性别" item-text="Name" item-value="Id"
                                        placeholder="请选择性别" v-model="updateItem.Sex"></v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Tel" label="联系电话" ref="Entity_Tel" dense placeholder="请输入联系电话">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Email" label="邮箱" ref="Entity_Email" dense placeholder="请输入邮箱">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--头像-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-card-title>
                                            移动端头像
                                        </v-card-title>
                                        <template
                                            v-if="updateItem.ImageThumb_Mobile_PictureUrl && updateItem.ImageThumb_Mobile_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain :src="updateItem.ImageThumb_Mobile_PictureUrl"
                                                aspect-ratio="1" ref="Entity_ImageThumb_Mobile_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center"
                                                style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.ImageThumb_Mobile_PictureId"
                                            ref="Entity_ImageThumb_Mobile_PictureId" />
                                        <div class="d-flex justify-center mt-2">
                                            <v-btn
                                                @click="pictureSelectorShow('ImageThumb_Mobile_PictureId', 'ImageThumb_Mobile_PictureUrl')"
                                                class="mr-12" small color="light-blue darken-1" dark>
                                                选择图片
                                            </v-btn>
                                            <v-btn
                                                @click="updateItem.ImageThumb_Mobile_PictureId=0;updateItem.ImageThumb_Mobile_PictureUrl=''"
                                                small color="light-blue darken-1" dark>
                                                删除图片
                                            </v-btn>
                                        </div>
                                    </v-card>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-card-title>
                                            PC端头像
                                        </v-card-title>
                                        <template
                                            v-if="updateItem.ImageThumb_PC_PictureUrl && updateItem.ImageThumb_PC_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain
                                                :src="updateItem.ImageThumb_PC_PictureUrl" aspect-ratio="1"
                                                ref="Entity_ImageThumb_PC_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center"
                                                style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.ImageThumb_PC_PictureId"
                                            ref="Entity_ImageThumb_PC_PictureId" />
                                        <div class="d-flex justify-center mt-2">
                                            <v-btn
                                                @click="pictureSelectorShow('ImageThumb_PC_PictureId', 'ImageThumb_PC_PictureUrl')"
                                                class="mr-12" small color="light-blue darken-1" dark>
                                                选择图片
                                            </v-btn>
                                            <v-btn
                                                @click="updateItem.ImageThumb_PC_PictureId=0;updateItem.ImageThumb_PC_PictureUrl=''"
                                                small color="light-blue darken-1" dark>
                                                删除图片
                                            </v-btn>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <!--部门-->
                            <v-subheader class="mt-3">关联机构/部门</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <template v-if="updateItem.Departments && updateItem.Departments.length">
                                        <v-card class="mt-0 mb-0 ml-12 mr-12" outlined>
                                            <v-row>
                                                <v-col>
                                                    <v-simple-table fixed-header class="pl-4 pr-4">
                                                        <thead>
                                                            <tr>
                                                                <th class="text-left">Id</th>
                                                                <th class="text-left">部门名称</th>
                                                                <th class="text-left">所属机构</th>
                                                                <th class="text-left">操作</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <template
                                                                v-if="updateItem.Departments && updateItem.Departments.length > 0">
                                                                <tr v-for="item in updateItem.Departments"
                                                                    :key="item.Id">
                                                                    <td>{{ item.Id }}</td>
                                                                    <td>{{ item.Title }}</td>
                                                                    <td>
                                                                        <template v-if="item.Company">
                                                                            <span>{{item.Company.Title}}</span>
                                                                        </template>
                                                                    </td>
                                                                    <td>
                                                                        <v-icon size="20" color="deep-orange"
                                                                            @click="departmentSelectorDelete(item)">
                                                                            mdi-delete-forever</v-icon>
                                                                    </td>
                                                                </tr>
                                                            </template>

                                                        </tbody>
                                                    </v-simple-table>
                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </template>
                                    <template v-else>
                                        <v-row>
                                            <v-col class="d-flex justify-center align-center">
                                                <span>暂未关联机构/部门</span>
                                            </v-col>
                                        </v-row>
                                    </template>
                                    <div class="d-flex justify-center mt-2">
                                        <v-btn
                                            @click="departmentSelectorShow"
                                            class="mr-12" small color="light-blue darken-1" dark>
                                            添加部门
                                        </v-btn>
                                    </div>
                                </v-col>
                            </v-row>

                            <v-subheader class="mt-3">简介</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <tinymce ref="editor" v-model="updateItem.Summary" />
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>
                </v-card>

                <!--选择图片-->
                <picture-selector :isShow="imgSelectorSetting.show" v-on:on-show-change="pictureSelectorShowChange"
                    :multiple="false" :pictureField="imgSelectorSetting.pictureField" platformName="course"
                    :pictureUrlField="imgSelectorSetting.pictureUrlField" v-on:on-confirm="pictureSelectorConfirm">
                </picture-selector>

                <!--选择机构/部门-->
                <department-selector :isShow="departmentSelectorSetting.show" v-on:on-show-change="departmentSelectorShowChange"
                    v-on:on-confirm="departmentSelectorConfirm">
                </department-selector>
            </v-dialog>

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
                        <p class="mb-1">姓名：{{updateItem.RealName}}</p>
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
                        <p class="mb-1">姓名：{{updateItem.RealName}}</p>
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
    import { AuditStatus, GetAuditStatusName, SexList, GetSexName } from '../../global/globalValue.js';
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import DepartmentSelector from '../../components/common/DepartmentSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
            DepartmentSelector,
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
                    Description: '',
                    Enable: true,
                    RealName: '',
                    Summary: '',
                    Sex: 3,
                    Tel: '',
                    Email: '',
                    Status: 1,
                    HeadImg_PictureId: 0,
                    HeadImg_PictureUrl: '',
                    QR_PictureId: 0,
                    ImageThumb_Mobile_PictureId: 0,
                    ImageThumb_PC_PictureId: 0,
                    ImageThumb_Mobile_PictureUrl: '',
                    ImageThumb_PC_PictureUrl: '',

                    Departments: [],
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

                statusList: AuditStatus,

                sexlist: SexList,

                //图片选择控件参数
                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                //机构/部门选择参数
                departmentSelectorSetting: {
                    show: false,
                    selectedItems: [],
                    itemField: '',
                },
            }
        },

        mounted() {
            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/lecturer/list', {
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
                this.updateItem.Enable = item.Enable;
                this.updateItem.Description = item.Description;
                this.updateItem.RealName = item.RealName;
                this.updateItem.Summary = item.Summary;
                this.updateItem.Sex = item.Sex;
                this.updateItem.Tel = item.Tel;
                this.updateItem.Email = item.Email;
                this.updateItem.Status = item.Status;
                this.updateItem.HeadImg_PictureId = item.HeadImg_PictureId;
                this.updateItem.HeadImg_PictureUrl = item.HeadImg_PictureUrl;
                this.updateItem.QR_PictureId = item.QR_PictureId;
                this.updateItem.ImageThumb_Mobile_PictureId = item.ImageThumb_Mobile_PictureId;
                this.updateItem.ImageThumb_PC_PictureId = item.ImageThumb_PC_PictureId;
                this.updateItem.ImageThumb_Mobile_PictureUrl = item.ImageThumb_Mobile_PictureUrl;
                this.updateItem.ImageThumb_PC_PictureUrl = item.ImageThumb_PC_PictureUrl;

                this.updateItem.Departments = item.Departments;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Enable = true;
                this.updateItem.Description = '';
                this.updateItem.RealName = '';
                this.updateItem.Summary = '';
                this.updateItem.Sex = 3;
                this.updateItem.Tel = '';
                this.updateItem.Email = '';
                this.updateItem.Status = 1;
                this.updateItem.HeadImg_PictureId = 0;
                this.updateItem.HeadImg_PictureUrl = '';
                this.updateItem.QR_PictureId = 0;
                this.updateItem.ImageThumb_Mobile_PictureId = 0;
                this.updateItem.ImageThumb_PC_PictureId = 0;
                this.updateItem.ImageThumb_Mobile_PictureUrl = '';
                this.updateItem.ImageThumb_PC_PictureUrl = '';

                this.updateItem.Departments = [];

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
                    this.postAxios('/api/course/backend/lecturer/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {

                            this.postAxios('/api/course/backend/lecturer/AddDepartment', JSON.stringify({
                                lecturerId: data.result.Id,
                                departments: this.updateItem.Departments,
                            })).then((data) => {
                                if(data.errorcode === 0) {

                                } else {

                                }

                                this.loadingDialog.isShow = false;
                                this.updateDialog.isShow = false;
                                this.$toast.success('新增成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                                this.search(0);
                            }).catch((error) => {
                                this.loadingDialog.isShow = false;
                                this.updateDialog.isShow = false;
                                this.$toast.success('新增成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                                this.search(0);
                            });
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
                    this.postAxios('/api/course/backend/lecturer/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.postAxios('/api/course/backend/lecturer/AddDepartment', JSON.stringify({
                                lecturerId: this.updateItem.Id,
                                departments: this.updateItem.Departments,
                            })).then((data) => {
                                if(data.errorcode === 0) {

                                } else {

                                }
                                
                                this.loadingDialog.isShow = false;
                                this.updateDialog.isShow = false;
                                this.$toast.success('修改成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                                this.search(0);
                            }).catch((error) => {
                                this.loadingDialog.isShow = false;
                                this.updateDialog.isShow = false;
                                this.$toast.success('修改成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                                this.search(0);
                            });
                            
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

                this.getAxios('/api/course/backend/lecturer/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/course/backend/lecturer/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            getStatusName: function (status) {
                return GetAuditStatusName(status);
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


            //机构/部门选择 Begin
            departmentSelectorShowChange: function (val) {
                this.departmentSelectorSetting.show = val;
            },

            departmentSelectorConfirm: function(selectedItems) {
                this.updateItem.Departments = selectedItems;
            },

            departmentSelectorShow: function() {
                this.departmentSelectorSetting.show = true;
            },

            departmentSelectorDelete: function(item) {
                if(!item) {
                    return;
                }

                
            },
            //机构/部门选择 End


        },
    }
</script>

<style scoped>
</style>