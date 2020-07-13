<template>
    <v-dialog v-model="show" persistent max-width="1000">
        <v-card>
            <!--标题-->
            <v-card-title class="headline"><span class="">选择讲师</span></v-card-title>

            <v-container>
                <!--选择机构-->
                <v-row>
                    <v-col cols="12" md="12">
                        <v-select :items="searchCompanyResult.list" dense label="机构" item-text="Title" item-value="Id"
                            placeholder="请选择机构" return-object v-model="selectedCompany" hide-details clearable
                            v-on:change="selectedCompanyChange"></v-select>
                    </v-col>
                </v-row>

                <!--选择部门-->
                <v-row>
                    <v-col cols="12" md="12" class="pt-0">
                        <label class="v-label v-label--active theme--light" style="left: 0px; right: auto; font-size: 12px;">部门</label>
                        <el-cascader :options="searchDepartmentModel.list" clearable v-model="selectedDepartment"
                            :props="searchDepartmentModel.selectProps" style="width: 100%;" placeholder="请选择部门"
                            ref="departmentsSelector">
                        </el-cascader>
                    </v-col>
                </v-row>

                <!--搜索条件-->
                <v-row>
                    <v-col cols="12" md="10" class="">
                        <v-text-field label="搜索条件" dense v-model="searchLectuerModel.searchName" 
                            placeholder="请输入搜索条件" clearable hide-details>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="2" class="">
                        <v-btn color="primary" block class="align-center" @click="loadLecturerByDepartmentId(0)">搜索</v-btn>
                    </v-col>
                </v-row>

                <!--讲师列表-->
                <v-row>
                    <v-col cols="12" md="12">
                        <label class="v-label v-label--active theme--light" style="left: 0px; right: auto; font-size: 12px;">搜索结果</label>
                        <v-data-table class="elevation-1" show-select hide-default-footer :headers="searchLectuerModel.headers"
                        item-key="Id" :items="searchLectuerModel.list" :loading="searchLectuerModel.loading"
                        no-data-text="未查询到数据" loading-text="数据加载中..." v-model="selectedItems">
    
                        <template v-slot:item.Departments="{ item }">
                            <template v-if="item.Departments && item.Departments.length > 0">
                                <v-row v-for="d in item.Departments" class="mt-1 mb-1">
                                    <v-chip small >
                                        <template v-if="d.Company">{{d.Company.Title + ' - '}}</template>
                                        {{d.Title}}
                                    </v-chip>
                                </v-row>
                            </template>
                            <template v-else>
                                <span>该讲师暂未加入结构</span>
                            </template>
                        </template>
    
                    </v-data-table>
                    </v-col>
                </v-row>

                <v-row class=" d-flex align-end justify-center">
                    <!--分页控件-->
                    <div class="pa-4">
                        <v-pagination v-model="searchLectuerModel.pageSetting.page"
                            :circle="searchLectuerModel.pageSetting.circle"
                            :disabled="searchLectuerModel.pageSetting.disabled"
                            :length="searchLectuerModel.pageSetting.length"
                            :next-icon="searchLectuerModel.pageSetting.nextIcon"
                            :prev-icon="searchLectuerModel.pageSetting.prevIcon"
                            :page="searchLectuerModel.pageSetting.page"
                            :total-visible="searchLectuerModel.pageSetting.totalVisible"
                            v-on:input="loadLecturerByDepartmentId(searchLectuerModel.pageSetting.page - 1)"
                            v-on:previous="loadLecturerByDepartmentId(searchLectuerModel.pageSetting.page - 1)"
                            v-on:Value="loadLecturerByDepartmentId(searchLectuerModel.pageSetting.page - 1)">
                        </v-pagination>
                    </div>
                </v-row>
            </v-container>

            <!--按钮-->
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" text @click="show = false">取消</v-btn>
                <v-btn color="primary" @click="confirm()">确定</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        model: {
            prop: 'selectedItems',
        },

        props: {
            isShow: Boolean,
            selected: Array,
        },

        beforeCreate() {
            this.selectedItems = [];
        },

        mounted() {
            
        },

        data() {
            return {
                show: this.isShow,

                //查询参数 Begin
                searchDepartmentModel: {
                    searchName: '',
                    list: [],
                    selectProps: {
                        multiple: true,
                        label: 'Title',
                        children: 'Childs',
                        value: 'Id',
                        emitPath: false,
                    },
                },

                searchCompanyModel: {
                    searchName: '',
                },

                searchCompanyResult: {
                    list: [],
                },

                searchLectuerModel: {
                    loading: false,
                    searchName: '',
                    totalCount: 2,
                    pageSize: 10,
                    list: [],
                    pageSetting: {
                        circle: false,
                        disabled: false,
                        length: 1, //总共有几页
                        nextIcon: 'mdi-menu-right',
                        nextIcons: ['mdi-chevron-right', 'mdi-arrow-right', 'mdi-menu-right'],
                        prevIcon: 'mdi-menu-left',
                        prevIcons: ['mdi-chevron-left', 'mdi-arrow-left', 'mdi-menu-left'],
                        page: 1, //当前页面
                        totalVisible: 3, //最多显示几页按钮
                    },
                    headers: [
                        { text: 'Id', value: 'Id' },
                        { text: '姓名', value: 'RealName' },
                        { text: '联系电话', value: 'Tel' },
                        { text: '机构/部门', value: 'Departments' },
                    ],
                },
                //查询参数 End

                selectedCompany: null,

                selectedDepartment: [],

                selectedItemskey: [],
                //selectedItems: [],
            }
        },

        methods: {
            //加载机构
            loadCompany: function () {
                this.searchCompanyResult.list = [];

                this.getAxios('/api/course/backend/company/GetAllEnable', {
                    searchName: this.searchCompanyModel.searchName,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchCompanyResult.list = data.result.Data;
                    } else {

                    }
                }).catch((error) => {

                });
            },

            //根据机构加载部门
            loadDepartmentByCompanyId: function (company) {
                this.searchDepartmentModel.list = [];
                this.selectedDepartment = [];

                if (!company || !company.Id || company.Id <= 0) {
                    return;
                }

                this.getAxios('/api/course/backend/department/GetAllEnable', {
                    companyId: company.Id,
                    searchName: this.searchDepartmentModel.searchName,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchDepartmentModel.list = data.result.Data;
                    } else {

                    }
                }).catch((error) => {

                });
            },

            //加载讲师
            loadLecturerByDepartmentId: function (pageIndex) {
                let companyId = 0;
                //let departmentIds = new Array();
                //this.selectedDepartment

                if (this.selectedCompany) {
                    companyId = this.selectedCompany.Id;
                }

                //console.log(this.selectedItems);

                this.postAxios('/api/course/backend/lecturer/GetAllEnable', JSON.stringify({
                    companyId: companyId,
                    departmentIds: this.selectedDepartment,
                    searchName: this.searchLectuerModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchLectuerModel.pageSize
                })).then(data => {
                    if (data.errorcode === 0) {
                        this.searchLectuerModel.pageSetting.page = data.result.PageIndex + 1;
                        this.searchLectuerModel.pageSetting.length = data.result.TotalPages;
                        this.searchLectuerModel.totalCount = data.result.TotalCount;

                        this.searchLectuerModel.list = data.result.Data;

                        this.selectedItems = this.selected;

                        //console.log(this.searchLectuerModel.list);
                    } else {

                    }
                }).catch(error => {

                });
            },

            isEnabled (slot) {
                return this.enabled === slot
            },

            selectedCompanyChange: function (val) {
                //console.log(val);
                if (!val) {
                    return;
                }

                this.loadDepartmentByCompanyId(val);
            },

            selectedDepartmentChange: function (val) {
                if (!val) {
                    return;
                }
            },

            //确认选择结果
            confirm: function () {
                if(!this.selectedItems || this.selectedItems.length <= 0) {
                    this.$toast.error('请选择讲师。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                //console.log(this.selectedItems);
                
                this.$emit("on-confirm", this.selectedItems);
                this.show = false;
            },
        },

        watch: {
            isShow(val) {
                this.show = val;
                if(this.show) {
                    this.loadCompany();
                    this.loadLecturerByDepartmentId(0);
                }
            },

            show(val) {
                this.$emit("on-show-change", val);
            },


        },
    }
</script>