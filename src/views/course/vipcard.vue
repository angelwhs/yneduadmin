<template>
    <div id="pageVipCard" class="page-wrapper">
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
                                    <th class="text-left">名称</th>
                                    <th class="text-left">是否关联课程</th>
                                    <th class="text-left">审核状态</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>{{ item.HasAssociateCourses ? '是' : '否' }}</td>
                                        <td>{{ getStatusName(item.Status) }}</td>
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
                            <span>VIP卡</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field v-model="updateItem.Title" dense label="名称" placeholder="请输入VIP卡名称"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title">
                                    </v-text-field>
                                </v-col>

                            </v-row>

                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="排序" dense placeholder="请输入排序"
                                        :error-messages="errorMessages" ref="Entity_DisplayOrder" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-select :items="statusList" dense label="状态" item-text="Name" item-value="Id"
                                        placeholder="请选择状态" v-model="updateItem.Status">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.Enable" label="是否启用" dense></v-switch>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.TermOfValidity" label="有效期(天)" dense placeholder="请输入有效期"
                                        :error-messages="errorMessages" ref="EntityTermOfValidity" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.Price" label="价格" dense placeholder="请输入价格"
                                        :error-messages="errorMessages" ref="EntityPrice" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.PresentationPoints" label="赠送积分" dense placeholder="请输入赠送积分"
                                        :error-messages="errorMessages" ref="EntityPresentationPoints" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.Discount" label="会员折扣(百分比)" dense placeholder="请输入会员折扣(百分比)"
                                        :error-messages="errorMessages" ref="EntityDiscount" type="number">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--关联课程-->
                            <v-row>
                                <v-col class="pt-0 pb-0">
                                    <v-switch v-model="updateItem.HasAssociateCourses" label="是否关联课程" dense hide-details></v-switch>
                                </v-col>
                            </v-row>
                            <v-subheader >关联课程</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col>
                                    <template v-if="updateItem.Lessons && updateItem.Lessons.length > 0">
                                        <v-card class="mt-0 mb-0 ml-12 mr-12" outlined>
                                            <v-row>
                                                <v-col>
                                                    <v-simple-table fixed-header class="pl-4 pr-4">
                                                        <thead>
                                                            <tr>
                                                                <th class="text-left">Id</th>
                                                                <th class="text-left">课程名称</th>
                                                                <th class="text-left">创建时间</th>
                                                                <th class="text-left">操作</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <template v-if="updateItem.Lessons && updateItem.Lessons.length > 0">
                                                                <tr v-for="item in updateItem.Lessons" :key="item.Id">
                                                                    <td>{{ item.Id }}</td>
                                                                    <td>{{ item.Title }}</td>
                                                                    <td>{{ item.Created }}</td>
                                                                    <td>
                                                                        <v-icon size="20"
                                                                            color="deep-orange"
                                                                            @click="lessonDelete(item)">
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
                                                <span class="ma-4">未添加课程</span>
                                            </v-col>
                                        </v-row>
                                    </template>
                                    <v-row>
                                        <v-col class="d-flex justify-center align-center">
                                            <v-btn @click="lessonSelectorShow" small color="light-blue darken-1"  :disabled="!updateItem.HasAssociateCourses">
                                                <span style="color: white;">添加课程</span>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>

                            <v-subheader >封面</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
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

                            <v-subheader class="mt-3">VIP卡说明</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <tinymce ref="editor" v-model="updateItem.Content" />
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

                <!--课程选择器-->
                <lesson-selector :isShow="lessonSelectorSetting.show" :selected="updateItem.Lessons"
                    v-on:on-show-change="lessonSelectorShowChange" v-on:on-confirm="lessonSelectorConfirm">
                </lesson-selector>
            </v-dialog>

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">名称：{{updateItem.Name}}</p>
                        <p class="mb-1">描述：{{updateItem.Description}}</p>
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
                        <p class="mb-1">描述：{{updateItem.Description}}</p>
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
    import { ProductStatus, GetProductStatusName } from '../../global/globalValue.js';
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import LessonSelector from '../../components/common/LessonSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
            LessonSelector,
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
                    Title: '',
                    Content: '',
                    ImageThumb_PictureId: 0,
                    TermOfValidity: 0,
                    Price: 0,
                    PresentationPoints: 0,
                    IsHide: false,
                    DisplayOrder: 0,
                    Discount: 0,
                    HasAssociateCourses: false,
                    Status: 0,
                    ImageThumb_PictureUrl: '',

                    Lessons: [],
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

                //课程选择器参数
                lessonSelectorSetting: {
                    show: false,
                    selectedItems: [],
                },

                statusList: ProductStatus,
            }
        },

        mounted() {
            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/vipcard/list', {
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
                this.updateItem.Description = item.Description;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Title = item.Title;
                this.updateItem.Content = item.Content;
                this.updateItem.TermOfValidity = item.TermOfValidity;
                this.updateItem.Price = item.Price;
                this.updateItem.PresentationPoints = item.PresentationPoints;
                this.updateItem.IsHide = item.IsHide;
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.Discount = item.Discount;
                this.updateItem.HasAssociateCourses = item.HasAssociateCourses;
                this.updateItem.Status = item.Status;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.Title = '';
                this.updateItem.Content = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.ParentId = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.Status = 1;

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
                    this.postAxios('/api/course/backend/vipcard/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveLessons(data.result.Id);
                        } else {
                            this.saveFailed(data.errormessage);
                        }
                    }).catch((error) => {
                        this.saveFailed(error.message);
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/course/backend/vipcard/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveLessons(data.result.Id);
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

            saveLessons: function(vipCardId) {
                if (!vipCardId || vipCardId <= 0) {
                    this.saveSuccessed();
                    return;
                }

                if(!this.updateItem.HasAssociateCourses || !this.updateItem.Lessons || this.updateItem.Lessons.length <= 0) {
                    this.saveSuccessed();
                    return;
                }

                let lessonIds = new Array();
                this.updateItem.Lessons.forEach((val, index) => {
                    lessonIds.push(val.Id);
                });

                this.postAxios('/api/course/backend/vipcard/AddLessons', JSON.stringify({
                    vipcardId: vipCardId,
                    lessons: lessonIds,
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

                this.getAxios('/api/course/backend/vipcard/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/course/backend/vipcard/setenable', { id: this.updateItem.Id, }).then((data) => {
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


            //课程选择器 Begin
            lessonSelectorShowChange: function (val) {
                this.lessonSelectorSetting.show = val;
            },

            lessonSelectorConfirm: function (selectedItems) {
                if (selectedItems && selectedItems.length > 0) {
                    this.updateItem.Lessons = selectedItems;
                }
            },

            lessonSelectorShow: function () {
                this.lessonSelectorSetting.show = true;
            },
            //课程选择器 End

            lessonDelete: function (item) {
                if (this.updateItem.Lessons && this.updateItem.Lessons.length > 0) {
                    this.updateItem.Lessons.forEach((val, index) => {
                        if (val && val.Id === item.Id) {
                            this.updateItem.Lessons.splice(index, 1);
                        }
                    })
                }
            },

            getStatusName: function (status) {
                return GetProductStatusName(status);
            },


            //加载课程

        },
    }
</script>

<style>
</style>