<template>
    <v-dialog v-model="show" persistent max-width="1000">
        <v-card>
            <!--标题-->
            <v-card-title class="headline"><span class="">选择机构/部门</span></v-card-title>

            <!---->
            <v-container>
                <!--选择机构-->
                <v-row>
                    <v-col cols="12" md="10">
                        <v-select :items="searchCompanyResult.list" dense label="机构" item-text="Title" item-value="Id"
                            placeholder="请选择机构" return-object v-model="selectedCompany"
                            v-on:change="selectedCompanyChange"></v-select>
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-btn color="primary" block class="align-center" @click="loadDepartmentByCompanyId(selectedCompany)">刷新</v-btn>
                    </v-col>
                </v-row>

                <!--选择部门-->
                <div>
                    <el-table fixed-header class="pl-4 pr-4" row-key="Id" :data="searchDepartmentResult.list"
                        size="small" header-row-class-name="table-header-row" max-height="400" border
                        :tree-props="{children: 'Childs', hasChildren: 'Childs.length > 0'}"
                        @selection-change="handleSelectionChange" >
                        <el-table-column type="selection" width="45"></el-table-column>
                        <el-table-column prop="Id" label="Id" align="center" min-width="60"></el-table-column>
                        <el-table-column prop="DisplayOrder" label="排序" min-width="20"></el-table-column>
                        <el-table-column prop="Title" label="标题"></el-table-column>
                    </el-table>
                </div>

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

            departmentField: String,
        },

        mounted() {
            this.loadCompany();
        },

        data() {
            return {
                show: this.isShow,

                //查询参数 Begin
                searchDepartmentModel: {
                    searchName: '',
                },

                searchDepartmentResult: {
                    list: [],
                },

                searchCompanyModel: {
                    searchName: '',
                },

                searchCompanyResult: {
                    list: [],
                },
                //查询参数 End

                selectedCompany: null,

                selectedItemskey: [],
                selectedItems: [],
            }
        },

        methods: {

            //加载机构
            loadCompany: function () {
                this.searchCompanyResult.list = [];
                this.searchDepartmentResult.list = [];

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
                this.searchDepartmentResult.list = [];

                if (!company || !company.Id || company.Id <= 0) {
                    return;
                }

                this.getAxios('/api/course/backend/department/GetAllEnable', {
                    companyId: company.Id,
                    searchName: this.searchDepartmentModel.searchName,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.searchDepartmentResult.list = data.result.Data;
                    } else {

                    }
                }).catch((error) => {

                });
            },

            //确认选择结果
            confirm: function () {
                if(!this.selectedItems || this.selectedItems.length <= 0) {
                    this.$toast.error('请选择部门。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                this.selectedItems.forEach((val, index) => {
                    val.Company = this.selectedCompany;
                });
                
                this.$emit("on-confirm", this.selectedItems);
                this.show = false;
            },

            selectedCompanyChange: function (val) {
                //console.log(val);
                if (!val) {
                    return;
                }
                //this.selectedCompany = val;
                this.loadDepartmentByCompanyId(val);
            },


            handleSelectionChange(val) {
                this.selectedItems = val;
            },

        },

        watch: {
            isShow(val) {
                this.show = val;
            },

            show(val) {
                this.$emit("on-show-change", val);
            },


        },


    }
</script>