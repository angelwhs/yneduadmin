<template>
    <div id="pageCouponRule" class="page-wrapper">
        <v-container grid-list-xl fluid>

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
                    RuleType: 0,
                    LoginBeginTime: '', //登录期限开始时间
                    LoginEndTime: '', //登录期限结束时间
                    IssuedQuantityByPerPerson: 0, //每个用户发放数量
                    TotalIssuedQuantity: 0, //总发放数量
                    IssuanceMethod: 0, //发放方式
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

                ruleItem: {
                    Id: 0,

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
    }
</script>

<style scoped>

</style>