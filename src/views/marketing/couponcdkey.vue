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
                        <v-btn color="primary" dark class="mb-2" @click="openCreate">批量导入</v-btn>
                        <v-spacer></v-spacer>
                    </v-toolbar>

                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">
                        <v-simple-table fixed-header class="pl-4 pr-4">
                            <thead>
                                <tr>
                                    <th class="text-left">卡号</th>
                                    <th class="text-left">密码</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.CardNumber }}</td>
                                        <td>{{ item.CardPassword }}</td>
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
                                            <v-btn small outlined text color="primary" class="ml-4"
                                                @click="getRoleItemModules(item)" :loading="getModulesLoading"
                                                :disabled="getModulesLoading">
                                                设置菜单
                                            </v-btn>
                                            <v-btn small outlined color="primary" class="ml-4"
                                                @click="openAPIListDialog(item)">
                                                设置接口
                                            </v-btn>
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
            <v-dialog v-model="editDialog.isShow" max-width="800px" persistent :disabled="saveRoleLoading">
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
                        <v-btn color="blue darken-1" text @click="closeEdit" :disabled="saveRoleLoading">取消
                        </v-btn>
                        <v-btn color="primary" @click="saveEdit" :loading="saveRoleLoading" :disabled="saveRoleLoading">
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
            }
        },

        mounted() {
            
        },

        methods: {
            

            getCouponInfo(couponId) {
                
            },


        },


    }
</script>

<style scoped>

</style>