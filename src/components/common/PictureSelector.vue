<template>
    <v-dialog v-model="show" persistent max-width="1000">
        <v-card>
            <!--标题-->
            <v-card-title class="headline"><span class="">选择图片</span></v-card-title>

            <v-container>
                <!--上传文件区域-->
                <v-row>
                    <v-col cols="12" md="10">
                        <v-file-input v-model="uploadFiles" placeholder="请选择需要上传的文件..." label="选择文件"
                            prepend-icon="mdi-camera" class="mr-4 ml-4">
                            <template v-slot:selection="{ text }">
                                <v-chip small label color="primary">
                                    {{ text }}
                                </v-chip>
                            </template>
                        </v-file-input>
                    </v-col>
                    <v-col class="d-flex align-center" cols="12" md="2">
                        <v-btn color="primary" @click="uploadFile">
                            开始上传
                        </v-btn>
                    </v-col>
                </v-row>

                <!--图片列表区域-->
                <div style="position: relative; min-height: 60px;" id="pictureListBox">
                    <!--刷新小按钮-->
                    <v-btn absolute dark fab top right small color="grey lighten-1" width="32" @click="search(0)">
                        <v-icon>mdi-reload</v-icon>
                    </v-btn>
                    
                    <v-item-group :multiple="multiple" :mandatory="mandatory" v-model="selectedItemskey">
                        <v-container class="pa-0">
                            <v-row>
                                <v-col cols="12" md="3" v-for="(item, i) in searchResult.list" :key="i">
                                    <v-item v-slot:default="{ active, toggle }">
                                        <v-img :src="item.ImageThumbUrl" height="150" width="230"
                                            :class="active ? 'picture-selector-itemactive text-right pa-0' : 'text-right pa-0'"
                                            @click="toggle">
                                            <v-btn icon v-if="active" class="ma-0 pa-0" width="32" height="32"
                                                color="blue darken-3">
                                                <v-icon color="blue darken-3" size="32" class="ma-0 pa-0">
                                                    {{ active ? 'mdi-checkbox-marked' : 'mdi-heart-outline' }}
                                                </v-icon>
                                            </v-btn>
                                        </v-img>
                                    </v-item>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-item-group>
                </div>

                <!--分页控件-->
                <v-row class="d-flex align-end justify-center">
                    <!--分页控件-->
                    <div class="pa-4">
                        <v-pagination v-model="pageSetting.page" :circle="pageSetting.circle"
                            :disabled="pageSetting.disabled" :length="pageSetting.length"
                            :next-icon="pageSetting.nextIcon" :prev-icon="pageSetting.prevIcon" :page="pageSetting.page"
                            :total-visible="pageSetting.totalVisible" v-on:input="search(pageSetting.page - 1)"
                            v-on:previous="search(pageSetting.page - 1)" v-on:Value="search(pageSetting.page - 1)">
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

            multiple: Boolean,

            pictureField: String,

            pictureUrlField: String,

            platformName: String,
        },

        data() {
            return {
                searchModel: {
                    searchName: '',
                },

                searchResult: {
                    totalCount: 1,
                    pageSize: 8,
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

                uploadFiles: [],

                show: this.isShow,

                mandatory: true,
                selectedItemskey: [],
                selectedItems: [],
            }
        },

        created() {
            //this.search(0);
        },

        mounted() {
            
        },

        methods: {
            search: function (pageIndex) {

                // 显示loading
                let loading = this.$loading({
                    text: '数据加载中...',
                    target: '#pictureListBox',
                    type: 'oval'
                })

                this.selectedItemskey = [];
                this.selectedItems = [];

                this.getAxios(this.getApiBaseUrl(this.platformName) + 'GetPictures', {
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

                    loading.close();
                }).catch((error) => {
                    loading.close();
                });
            },


            confirm: function () {
                //this.selectedItems = this.searchResult.list.filter((value, index) => {index = this.selectedItemskey.find((value, index, array) => value=index)});
                if(this.multiple) {
                    this.selectedItems = this.searchResult.list.filter((value, index) => index == this.selectedItemskey.find((value, index, array) => value=index));
                } else {
                    this.selectedItems = this.searchResult.list.filter((value, index) => index == this.selectedItemskey);
                }
                this.$emit("on-confirm", this.selectedItems, this.pictureField, this.pictureUrlField);
                this.show = false;
            },

            uploadFile: function () {
                //判断是否选择了要上传的文件
                if (!this.uploadFiles || this.uploadFiles.length <= 0) {
                    this.$toast.error('请选择需要上传的图片.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    return;
                }

                let file = this.uploadFiles;
                //console.log(this.uploadFiles);
                let dataFile = new FormData();
                dataFile.append('file_upload', file)

                this.postFileAxios(this.getApiBaseUrl(this.platformName) + 'AsyncUpload', dataFile).then((data) => {
                    if (data.errorcode === 0) {
                        this.$toast.success('图片上传成功.', { x: 'center', y: 'top', timeout: 3000, showClose: true, });
                        this.uploadFiles = [];
                        this.search(0);
                    } else {
                        this.$toast.error('图片上传失败.' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.$toast.error('图片上传失败.' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            getApiBaseUrl: function(platform) {
                
                if(platform) {
                    switch(platform) {
                        case 'cms':
                            return'/api/media/backend/picture/';
                        case 'course':
                            return '/api/media/backend/picture/';
                        case 'indentity':
                            return '/api/media/backend/picture/';
                        case 'media':
                            return '/api/media/backend/picture/';
                        default:
                            return '/api/media/backend/picture/';
                    }
                } else {
                    return '/api/media/backend/picture/';
                }
            },


        },

        watch: {
            isShow(val) {
                this.show = val;

                if(this.show) {
                    this.search(0);
                }
            },
            show(val) {
                this.$emit("on-show-change", val);
            },
        },
    }
</script>

<style>
    .picture-selector-itemactive {
        border: 3px solid #1565C0;
    }

    .picture-selector-itemactive-icon {
        background-color: white;
    }
</style>