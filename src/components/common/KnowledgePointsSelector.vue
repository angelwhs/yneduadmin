<template>
    <v-dialog v-model="show" persistent max-width="1000">
        <v-card>
            <!--标题-->
            <v-card-title class="headline"><span class="">选择知识点</span></v-card-title>

            <!---->
            <v-container>
                <!--搜索条件-->
                <v-row>
                    <v-col cols="12" md="10" class="">
                        <v-text-field label="搜索条件" dense v-model="searchModel.searchName" 
                            placeholder="请输入搜索条件" clearable hide-details>
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" md="2" class="">
                        <v-btn color="primary" block class="align-center" @click="loadKnowledgePoints()">搜索</v-btn>
                    </v-col>
                </v-row>

                <!--选择知识点-->
                <div>
                    <el-table fixed-header class="pl-4 pr-4" row-key="Id" :data="searchModel.list"
                        size="small" header-row-class-name="table-header-row" max-height="400" border
                        :tree-props="{children: 'Childs', hasChildren: 'Childs.length > 0'}"
                        @selection-change="handleSelectionChange" ref="multipleTable">
                        <el-table-column type="selection" width="45" :selectable="checkSelect"></el-table-column>
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
            selected: Array,
        },

        mounted() {
            this.loadKnowledgePoints();
        },

        data() {
            return {
                show: this.isShow,

                //查询参数 Begin
                searchModel: {
                    searchName: '',
                    list: [],
                },
                //查询参数 End

                selectedItemskey: [],
                selectedItems: [],
            }
        },

        methods: {

            //加载知识点
            loadKnowledgePoints: function() {
                this.getAxios('/api/course/backend/knowledgepoints/GetAllEnable', {
                    searchName: this.searchModel.searchName,
                }).then(data => {
                    if(data.errorcode === 0) {
                        this.searchModel.list = data.result.Data;

                        if(this.selected && this.selected.length > 0) {
                            this.selected.forEach(row => {
                                this.$refs.multipleTable.toggleRowSelection(row);
                            });
                        }
                    } else {

                    }
                }).catch(error => {

                });
            },

            //确认选择结果
            confirm: function () {
                if(!this.selectedItems || this.selectedItems.length <= 0) {
                    this.$toast.error('请选择知识点。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }
                
                this.$emit("on-confirm", this.selectedItems);
                this.show = false;
            },

            handleSelectionChange(val) {
                this.selectedItems = val;
            },

            checkSelect: function(row, index) {
                if(row && row.Childs && row.Childs.length > 0) {
                    return false;
                } else {
                    return true;
                }
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