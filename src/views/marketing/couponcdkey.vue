<template>
    <div id="pageCouponCDKey" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--tool bar-->
            <div class="pb-5">
                <v-toolbar dense dark color="primary" :tile="false">
                    <v-btn icon class="hidden-xs-only" @click="gotoBack">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <v-toolbar-title>卡密管理</v-toolbar-title>
                    <v-spacer></v-spacer>
                </v-toolbar>
            </div>

            <!--优惠券信息-->
            <div class="pb-5">
                <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header ><span>优惠券：{{couponItem.Title}}</span></v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                                Id：{{ couponItem.Id }}
                            </p>
                            <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                                名称：{{ couponItem.Title }}
                            </p>
                            <p class="ml-6 mt-2 mb-1 grey--text text--darken-1">
                                优惠内容：{{getCouponContent(couponItem)}}
                            </p>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
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
                        <v-btn color="primary" dark class="ml-4 mb-2" @click="openCreate">批量导入</v-btn>
                        <v-spacer></v-spacer>
                    </v-toolbar>

                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">
                        <v-simple-table fixed-header class="pl-4 pr-4">
                            <thead>
                                <tr>
                                    <th class="text-left">卡号</th>
                                    <th class="text-left">密码</th>
                                    <th class="text-left">已使用</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchModel.list && searchModel.list.length > 0">
                                    <tr v-for="item in searchModel.list" :key="item.Id">
                                        <td>{{ item.CardNumber }}</td>
                                        <td>{{ item.CardPassword }}</td>
                                        <td>
                                            <template v-if="item.Used">
                                                <span class="used-text">已使用</span>
                                            </template>
                                            <template v-else>
                                                <span class="unused-text">未使用</span>
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
                                            <v-icon size="20" class="mr-4" @click="openEdit(item)">edit</v-icon>
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

            <!--批量导入-->

            <!--创建/更新-->
            <v-dialog v-model="updateDialog.isShow" max-width="800px" persistent >
                <v-card ref="form">
                    <v-card-title>
                        <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span><span>卡密</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-text-field v-model="updateItem.CardNumber" label="卡号"
                                    :rules="[() => !!updateItem.CardNumber || '不能为空.']" :error-messages="errorMessages"
                                    ref="EntityCardNumber">
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-text-field v-model="updateItem.CardPassword" label="密码"
                                    :rules="[() => !!updateItem.CardPassword || '不能为空.']" :error-messages="errorMessages"
                                    ref="EntityCardPassword">
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="closeUpdate">取消
                        </v-btn>
                        <v-btn color="primary" @click="saveUpdate" >
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
    export default {
        data() {
            return {
                searchModel: {
                    searchName: '',
                    loading: false,
                    pageSize: 20,
                    list: [],

                    totalCount: 0,
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
                    CouponId: 0,
                    CardNumber: '',
                    CardPassword: '',
                    Used: false,
                },

                couponItem: {
                    Id: 0,
                    Name: '',
                    Enable: true,
                    Description: '',
                    Title: '',
                    Content: '',
                    ImageThumb_PictureId: 0,
                    ImageThumb_PictureUrl: '',
                    Status: 1,
                    DisplayOrder: 0,
                    BeginTime: '', //开始时间
                    EndTime: '', //结束时间
                    CouponType: 0, //优惠券类型
                    BaseAmount: 0, //满多少(满减券)
                    DiscountAmount: 0, //减多少(满减券)
                    DiscountPercentage: 0, //折扣率(折扣券)100为基数
                    CouponCode: '', //优惠码
                    RequiresCouponCode: false, //是否需要优惠码
                    IsCumulative: false, //是否累积
                    TermOfValidityType: 0, //有效期方式
                    TermOfValidityDays: 0, //有效期天数
                    TermOfValidityBeginTime: '', //有效期开始时间
                    TermOfValidityEndTime: '', //有效期结束时间
                    TotalExchangeQuantity: 0, //总可兑换数量
                    ExchangedQuantity: 0, //已兑换数量
                    ExchangeQuantityByPerPerson: 0, //每个用户可兑换数量
                    AppliedToType: 0, //优惠券适用类型
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


            }
        },

        mounted() {
            let id = this.$route.params.id;
            this.getCouponInfo(id);

            this.search(0);
        },

        methods: {

            search: function (pageIndex) {
                let id = this.$route.params.id;

                this.loadingDialog.isShow = true;

                this.getAxios('/api/marketing/backend/couponcdkey/list', {
                    couponId: id,
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchModel.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchModel.totalCount = data.result.TotalCount;

                        this.searchModel.list = data.result.Data;

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
                this.updateItem.Name = item.Name;
                this.updateItem.Created = item.Created;
                this.updateItem.CouponId = item.CouponId;
                this.updateItem.CardNumber = item.CardNumber;
                this.updateItem.CardPassword = item.CardPassword;
                this.updateItem.Used = item.Used;
            },

            openCreate: function () {
                let id = this.$route.params.id;

                this.updateItem.Id = 0;
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.Name = '';
                this.updateItem.Created = '';
                this.updateItem.CouponId = 0;
                this.updateItem.CardNumber = '';
                this.updateItem.CardPassword = ''; 
                this.updateItem.Used = false; 

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate() {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if(this.couponItem) {
                    this.updateItem.CouponId = this.couponItem.Id;
                }

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/marketing/backend/couponcdkey/create', JSON.stringify(this.updateItem)).then((data) => {
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
                    this.postAxios('/api/marketing/backend/couponcdkey/edit', JSON.stringify(this.updateItem)).then((data) => {
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

                this.getAxios('/api/marketing/backend/couponcdkey/delete', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.deleteDialog = false;
                        this.$toast.success('删除成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('删除失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 5000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('删除失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 5000, showClose: true, });
                });
            },

            confirmSetEnable: function (item) {
                this.prepareUpdateItem(item);
                this.setEnableDialog = true;
            },

            saveSetEnable: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/marketing/backend/couponcdkey/setenable', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.Enable ? '禁用成功.' : '启用成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + data.errormsg : '启用失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 5000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + error.message : '启用失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 5000, showClose: true, });
                });
            },


            getCouponInfo(couponId) {
                this.getAxios('/api/marketing/backend/coupon/GetCouponById', { id: couponId }).then((data) => {
                    if (data.errorcode === 0) {
                        this.couponItem = data.result;
                    } else {

                    }
                }).catch((error) => {

                });
            },

            getCouponContent: function (coupon) {
                let res = '';

                if (coupon) {
                    if (coupon.CouponType == 1) {
                        if (coupon.BaseAmount > 0) {
                            res = '满' + coupon.BaseAmount + '减' + coupon.DiscountAmount;
                        } else {
                            res = '无门槛减' + coupon.DiscountAmount;
                        }
                    } if (coupon.CouponType == 2) {
                        if (coupon.BaseAmount > 0) {
                            res = '满' + coupon.BaseAmount + '元打' + coupon.DiscountPercentage + '折';
                        } else {
                            res = coupon.DiscountPercentage + '折';
                        }
                    } if (coupon.CouponType == 3) {
                        if (coupon.BaseAmount > 0) {
                            res = '满' + coupon.BaseAmount + '件打' + coupon.DiscountPercentage + '折';
                        } else {
                            res = coupon.DiscountPercentage + '折';
                        }
                    }
                }

                return res;
            },

            gotoBack() {
                this.$router.go(-1);//返回上一层
            },

        },


    }
</script>

<style scoped>
    .used-text {
        color:grey;
    }

    .unused-text {
        color:#81C784;
    }
</style>