<template>
    <div id="pageLessonOrder" class="page-wrapper">
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
                                    <th class="text-left">排序</th>
                                    <th class="text-left">名称</th>
                                    <th class="text-left">支付方式</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.DisplayOrder }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>{{ getPaymentTypeName(item.PaymentType) }}</td>
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
            <v-dialog v-model="updateDialog.isShow" max-width="800px" persistent :disabled="saveLoading">
                <v-card ref="form">
                    <v-card-title>
                        <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span><span>支付方式</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <!--名称-->
                            <v-row>
                                <v-col>
                                    <v-text-field v-model="updateItem.Title" label="名称" dense
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="EntityTitle">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--序号，是否启用-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="序号" ref="DisplayOrder" dense
                                        :error-messages="errorMessages"
                                        :rules="[() => !!updateItem.DisplayOrder || '不能为空.']">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-switch v-model="updateItem.Enable" label="是否启用" dense></v-switch>
                                </v-col>
                            </v-row>

                            <!--支付方式，支付参数-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select :items="paymentTypeList" dense label="支付类型" item-text="Name" item-value="Id"
                                        v-model="updateItem.PaymentType"></v-select>
                                </v-col>
                            </v-row>
                            <template v-if="updateItem.PaymentType === 1">
                                <!--微信支付-->
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="updateItem.Weixin_AppId" label="AppId" dense :error-messages="errorMessages"
                                            ref="EntityWeixinAppId">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="updateItem.Weixin_AppSecret" label="AppSecret" dense :error-messages="errorMessages"
                                            ref="EntityWeixinAppSecret">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="updateItem.Weixin_MerchantNo" label="商户号" dense :error-messages="errorMessages"
                                            ref="EntityWeixinMerchantNo">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="updateItem.Weixin_PaymentKey" label="支付密钥" dense :error-messages="errorMessages"
                                            ref="EntityWeixinPaymentKey">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </template>
                            <template v-else-if="updateItem.PaymentType === 2">
                                <!--支付宝-->
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="updateItem.Alipay_AppId" label="AppId" dense :error-messages="errorMessages"
                                            ref="EntityAlipayAppId">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="updateItem.Alipay_PublicKey" label="PublicKey" dense :error-messages="errorMessages"
                                            ref="EntityAlipayPublicKey">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </template>
                            
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
            </v-dialog>

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
                        <p class="mb-1">名称：{{updateItem.Title}}</p>
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
                        <p class="mb-1">名称：{{updateItem.Title}}</p>
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
                    Title: '',
                    DisplayOrder: 0,
                    Weixin_AppId: '',
                    Weixin_AppSecret: '',
                    Weixin_MerchantNo: '',
                    Weixin_PaymentKey: '',

                    Alipay_AppId: '',
                    Alipay_PublicKey: '',
                    PaymentType: 0,
                    ImageThumb_PictureId: 0,
                    ImageThumb_PictureUrl: '',
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

                paymentTypeList: [
                    {Id: 1, Name: '微信支付'},
                    {Id: 2, Name: '支付宝'},
                    {Id: 3, Name: '商城币'},
                ],
            }
        },

        mounted() {
            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/payment/backend/paymentmethod/list', {
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
                this.updateItem.Title = item.Title;
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.Weixin_AppId = item.Weixin_AppId;
                this.updateItem.Weixin_AppSecret = item.Weixin_AppSecret;
                this.updateItem.Weixin_MerchantNo = item.Weixin_MerchantNo;
                this.updateItem.Weixin_PaymentKey = item.Weixin_PaymentKey;

                this.updateItem.Alipay_AppId = item.Alipay_AppId;
                this.updateItem.Alipay_PublicKey = item.Alipay_PublicKey;
                this.updateItem.PaymentType = item.PaymentType;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Enable = true;
                this.updateItem.Title = '';
                this.updateItem.DisplayOrder = 1;
                this.updateItem.Weixin_AppId = '';
                this.updateItem.Weixin_AppSecret = '';
                this.updateItem.Weixin_MerchantNo = '';
                this.updateItem.Weixin_PaymentKey = '';

                this.updateItem.Alipay_AppId = '';
                this.updateItem.Alipay_PublicKey = '';
                this.updateItem.PaymentType = 1;
                this.updateItem.ImageThumb_PictureId = '';
                this.updateItem.ImageThumb_PictureUrl = '';

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
                    this.postAxios('/api/payment/backend/paymentmethod/create', JSON.stringify(this.updateItem)).then((data) => {
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
                    this.postAxios('/api/payment/backend/paymentmethod/edit', JSON.stringify(this.updateItem)).then((data) => {
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

                this.getAxios('/api/payment/backend/paymentmethod/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/payment/backend/paymentmethod/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            getPaymentTypeName: function(paymentType) {
                let name = '未知';

                switch (paymentType) {
                    case 1:
                        name = '微信支付';
                        break;
                    case 2:
                        name = '支付宝';
                        break;
                    case 3:
                        name = '商城币';
                        break;
                    default:
                        break;
                }

                return name;
            },


        },
    }
</script>

<style scoped>
</style>