<template>
    <div id="pageCustomer" class="page-wrapper">
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
                                    <th class="text-left">关联账号</th>
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
                                                        <template
                                                            v-if="d.Company">{{d.Company.Title + ' - '}}</template>
                                                        {{d.FullTitle}}
                                                    </v-chip>
                                                </v-row>
                                            </template>
                                        </td>
                                        <td>
                                            <v-row>
                                                <v-col>
                                                    <template v-if="item.UserId && item.UserId > 0">
                                                        <v-chip small class="mt-1 mb-1">
                                                            {{item.User_Account + ' - ' + item.User_NickName}}
                                                        </v-chip>
                                                        <v-btn small outlined color="primary" class="ml-4"
                                                            @click="confirmUnLinkUser(item)">
                                                            解除
                                                        </v-btn>
                                                    </template>
                                                    <template v-else>
                                                        <v-btn small outlined color="primary" 
                                                            @click="userSelectorShow(item)">
                                                            未关联
                                                        </v-btn>
                                                    </template>
                                                </v-col>
                                            </v-row>
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

                    <!--关联账号-->
                    <!--账号选择器-->
                    <user-selector :isShow="userSelectorSetting.show" v-on:on-show-change="userSelectorShowChange"
                        v-on:on-confirm="userSelectorConfirm" :multiple="false">
                    </user-selector>

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
                            <span>学员</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <!--学号-->
                            <!--真实姓名-->
                            <!--昵称-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.RealName" label="真实姓名" dense placeholder="请输入真实姓名"
                                        :rules="[() => !!updateItem.RealName || '不能为空.']"
                                        :error-messages="errorMessages" ref="EntityRealName">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.StudentNo" label="学号" dense placeholder="请输入学号"
                                        :error-messages="errorMessages" ref="EntityStudentNo">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.NickName" label="昵称" dense placeholder="请输入昵称"
                                        :error-messages="errorMessages" ref="EntityNickName">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--状态-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-select :items="statusList" dense label="状态" item-text="Name" item-value="Id"
                                        placeholder="请选择状态" v-model="updateItem.Status"></v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                            </v-row>

                            <!--性别-->
                            <!--性别公开方式-->
                            <!--联系电话-->
                            <!--联系电话公开方式-->
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-select :items="sexlist" dense label="性别" item-text="Name" item-value="Id"
                                        placeholder="请选择性别" v-model="updateItem.Sex"></v-select>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="accessPermissionList" dense label="性别公开方式" item-text="Name"
                                        item-value="Id" placeholder="请选择性别公开方式"
                                        v-model="updateItem.Sex_AccessPermission"></v-select>
                                </v-col>
                                <v-col cols="12" md="1"></v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.Tel" label="联系电话" ref="Entity_Tel" dense
                                        placeholder="请输入联系电话">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="accessPermissionList" dense label="联系电话公开方式" item-text="Name"
                                        item-value="Id" placeholder="请选择联系电话公开方式"
                                        v-model="updateItem.Tel_AccessPermission"></v-select>
                                </v-col>
                            </v-row>

                            <!--邮箱-->
                            <!--邮箱公开方式-->
                            <!--所在地-->
                            <!--所在地公开方式-->
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.Email" label="邮箱" ref="Entity_Email" dense
                                        placeholder="请输入邮箱">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="accessPermissionList" dense label="邮箱公开方式" item-text="Name"
                                        item-value="Id" placeholder="请选择邮箱公开方式"
                                        v-model="updateItem.Email_AccessPermission"></v-select>
                                </v-col>
                                <v-col cols="12" md="1"></v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.Location" label="所在地" ref="EntityLocation" dense
                                        placeholder="请输入所在地">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="accessPermissionList" dense label="所在地公开方式" item-text="Name"
                                        item-value="Id" placeholder="请选择所在地公开方式"
                                        v-model="updateItem.Location_AccessPermission"></v-select>
                                </v-col>
                            </v-row>

                            <!--血型-->
                            <!--血型公开方式-->
                            <!--生日-->
                            <!--生日公开方式-->
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-select :items="bloodTypeList" dense label="血型" item-text="Name" item-value="Id"
                                        placeholder="请选择血型" v-model="updateItem.BloodType"></v-select>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="accessPermissionList" dense label="血型公开方式" item-text="Name"
                                        item-value="Id" placeholder="请选择血型公开方式"
                                        v-model="updateItem.BloodType_AccessPermission"></v-select>
                                </v-col>
                                <v-col cols="12" md="1"></v-col>
                                <v-col cols="12" md="3">
                                    <v-menu v-model="menu2" :close-on-content-click="false"
                                        transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                        <template v-slot:activator="{ on }">
                                            <v-text-field v-model="computedBirthDayFormatted" label="生日"
                                                hint="MM/DD/YYYY format" persistent-hint prepend-icon="event" readonly
                                                v-on="on" dense></v-text-field>
                                        </template>
                                        <v-date-picker v-model="updateItem.BirthDay" no-title @input="menu2 = false"
                                            dense>
                                        </v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="accessPermissionList" dense label="血型公开方式" item-text="Name"
                                        item-value="Id" placeholder="请选择血型公开方式"
                                        v-model="updateItem.BirthDay_AccessPermission"></v-select>
                                </v-col>
                            </v-row>

                            <!--证件类型(1. 身份证)-->
                            <!--证件号码-->
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-select :items="credentialsTypeList" dense label="证件类型" item-text="Name"
                                        item-value="Id" placeholder="请选择证件类型" v-model="updateItem.CredentialsType">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="9">
                                    <v-text-field v-model="updateItem.CredentialsCode" label="证件号码"
                                        ref="EntityCredentialsCode" dense placeholder="请输入证件号码"
                                        :disabled="updateItem.CredentialsType === 0">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--头像-->
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-card-title>
                                            头像
                                        </v-card-title>
                                        <template
                                            v-if="updateItem.ImageThumb_PictureUrl && updateItem.ImageThumb_PictureUrl !== ''">
                                            <v-img width="100%" height="200" contain
                                                :src="updateItem.ImageThumb_PictureUrl" aspect-ratio="1"
                                                ref="ImageThumb_PictureUrl">
                                            </v-img>
                                        </template>
                                        <template v-else>
                                            <div class="d-flex justify-center align-center"
                                                style="width: 100%; height: 200px;">
                                                <span class="subtitle-1">请选择图片</span>
                                            </div>
                                        </template>
                                        <input type="hidden" v-model="updateItem.ImageThumb_PictureId"
                                            ref="ImageThumb_PictureId" />
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
                                                                    <td>{{ item.FullTitle }}</td>
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
                                        <v-btn @click="departmentSelectorShow" class="" small
                                            color="light-blue darken-1" dark>
                                            添加部门
                                        </v-btn>
                                    </div>
                                </v-col>
                            </v-row>

                            <!--简介-->
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
                <department-selector :isShow="departmentSelectorSetting.show"
                    v-on:on-show-change="departmentSelectorShowChange" v-on:on-confirm="departmentSelectorConfirm">
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

            <!--解除关联账号-->
            <v-dialog v-model="unlinkUserDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline">提示</v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold red--text">是否解除该关联账号?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
                        <p class="mb-1">学员姓名：{{updateItem.RealName}}</p>
                        <p class="mb-1">关联账号：{{updateItem.User_Account}}</p>
                        <p class="mb-1">关联账号昵称：{{updateItem.User_NickName}}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="unlinkUserDialog = false">取消</v-btn>
                        <v-btn color="primary" @click="saveUnLinkUser()">确定</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!--关联账号-->
            <v-dialog v-model="linkUserDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline">提示</v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否关联该账号?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
                        <p class="mb-1">学员姓名：{{updateItem.RealName}}</p>
                        <template v-if="userSelectorSetting.selectedItems && userSelectorSetting.selectedItems.length > 0">
                            <p class="mb-1">关联账号：{{userSelectorSetting.selectedItems[0].Account}}</p>
                            <p class="mb-1">关联账号昵称：{{userSelectorSetting.selectedItems[0].UserNickName}}</p>
                        </template>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="linkUserDialog = false">取消</v-btn>
                        <v-btn color="primary" @click="saveLinkUser()">确定</v-btn>
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
    import { AuditStatus, GetAuditStatusName, SexList, GetSexName, AccessPermissions, GetAccessPermissionName } from '../../global/globalValue.js';
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import UserSelector from '../../components/common/UserSelector.vue';
    import DepartmentSelector from '../../components/common/DepartmentSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
            DepartmentSelector,
            UserSelector,
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
                    StudentNo: '',
                    UserId: 0,
                    RealName: '',
                    NickName: '',
                    Summary: '',
                    ImageThumb_PictureId: 0,
                    Sex_AccessPermission: 0,
                    Sex: 0,
                    Tel_AccessPermission: 0,
                    Tel: '',
                    Email_AccessPermission: 0,
                    Email: '',
                    Location_AccessPermission: 0,
                    Location: '',
                    BloodType_AccessPermission: 0,
                    BloodType: 0,
                    BirthDay_AccessPermission: 0,
                    BirthDay: '',
                    Status: 0,
                    CredentialsType: 0,
                    CredentialsCode: '',

                    ImageThumb_PictureUrl: '',
                    User_Account: '',
                    User_NickName: '',
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
                linkUserDialog: false,
                unlinkUserDialog: false,

                statusList: AuditStatus,

                sexlist: SexList,

                accessPermissionList: AccessPermissions,

                bloodTypeList: [
                    { Id: 1, Name: 'A' },
                    { Id: 2, Name: 'B' },
                    { Id: 3, Name: 'AB' },
                    { Id: 4, Name: 'O' },
                    { Id: 5, Name: '其他' },
                    { Id: 6, Name: '保密' },
                ],

                credentialsTypeList: [
                    { Id: 0, Name: '无' },
                    { Id: 1, Name: '身份证' },
                ],

                menu2: false,

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
                },

                //账号选择器参数
                userSelectorSetting: {
                    show: false,
                    selectedItems: [],
                },
            }
        },

        mounted() {
            this.search(0);
        },

        computed: {
            computedBirthDayFormatted() {
                return this.formatDate(this.updateItem.BirthDay);
            },
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/customer/list', {
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
                this.updateItem.StudentNo = item.StudentNo;
                this.updateItem.UserId = item.UserId;
                this.updateItem.RealName = item.RealName;
                this.updateItem.NickName = item.NickName;
                this.updateItem.Summary = item.Summary;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.Sex_AccessPermission = item.Sex_AccessPermission;
                this.updateItem.Sex = item.Sex;
                this.updateItem.Tel_AccessPermission = item.Tel_AccessPermission;
                this.updateItem.Tel = item.Tel;
                this.updateItem.Email_AccessPermission = item.Email_AccessPermission;
                this.updateItem.Email = item.Email;
                this.updateItem.Location_AccessPermission = item.Location_AccessPermission;
                this.updateItem.Location = item.Location;
                this.updateItem.BloodType_AccessPermission = item.BloodType_AccessPermission;
                this.updateItem.BloodType = item.BloodType;
                this.updateItem.BirthDay_AccessPermission = item.BirthDay_AccessPermission;
                this.updateItem.BirthDay = item.BirthDay;
                this.updateItem.Status = item.Status;
                this.updateItem.CredentialsType = item.CredentialsType;
                this.updateItem.CredentialsCode = item.CredentialsCode;

                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.User_Account = item.User_Account;
                this.updateItem.User_NickName = item.User_NickName;

                this.updateItem.Departments = item.Departments;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Enable = true;
                this.updateItem.Description = '';
                this.updateItem.StudentNo = '';
                this.updateItem.UserId = 0;
                this.updateItem.RealName = '';
                this.updateItem.NickName = '';
                this.updateItem.Summary = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.Sex_AccessPermission = 5;
                this.updateItem.Sex = 3;
                this.updateItem.Tel_AccessPermission = 5;
                this.updateItem.Tel = '';
                this.updateItem.Email_AccessPermission = 5;
                this.updateItem.Email = '';
                this.updateItem.Location_AccessPermission = 5
                this.updateItem.Location = '';
                this.updateItem.BloodType_AccessPermission = 5;
                this.updateItem.BloodType = 6;
                this.updateItem.BirthDay_AccessPermission = 5;
                this.updateItem.BirthDay = '';
                this.updateItem.Status = 1;
                this.updateItem.CredentialsType = 0;
                this.updateItem.CredentialsCode = '';

                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.User_Account = '';
                this.updateItem.User_NickName = '';

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
                    this.postAxios('/api/course/backend/customer/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveDepartments(data.result.Id);
                        } else {
                            this.saveFailed(data.errormessage);
                        }
                    }).catch((error) => {
                        this.saveFailed(error.message);
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/course/backend/customer/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveDepartments(data.result.Id);
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

            saveDepartments: function (customerId) {
                if (!customerId || customerId <= 0) {
                    this.saveSuccessed();
                    return;
                }

                if (!this.updateItem.Departments || this.updateItem.Departments.length <= 0) {
                    this.saveSuccessed();
                    return;
                }

                this.postAxios('/api/course/backend/customer/AddDepartment', JSON.stringify({
                    customerId: customerId,
                    departments: this.updateItem.Departments,
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

                this.getAxios('/api/course/backend/customer/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/course/backend/customer/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            confirmLinkUser: function () {
                if(this.userSelectorSetting.selectedItems && this.userSelectorSetting.selectedItems.length > 0) {
                    this.linkUserDialog = true;
                }
            },

            saveLinkUser: function () {
                let customerId = this.updateItem.Id;
                let userId = this.userSelectorSetting.selectedItems[0].Id;

                this.getAxios('/api/course/backend/customer/LinkUser', {
                    customerId: customerId,
                    userId: userId,
                }).then(data => {
                    if(data.errorcode === 0) {
                        this.$toast.success(this.updateItem.Enable ? '绑定账号成功.' : '绑定账号成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        
                        this.search(0);
                    } else {
                        this.$toast.error(this.updateItem.Enable ? '绑定账号失败,请重新提交.</br>' + data.errormsg : '绑定账号失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                    this.linkUserDialog = false;
                }).catch(error => {
                    this.$toast.error(this.updateItem.Enable ? '绑定账号失败,请重新提交.</br>' + error.message : '绑定账号失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    this.linkUserDialog = false;
                });
            },

            confirmUnLinkUser: function (item) {
                this.prepareUpdateItem(item);
                this.unlinkUserDialog = true;
            },

            saveUnLinkUser: function () {
                let customerId = this.updateItem.Id;

                this.getAxios('/api/course/backend/customer/UnLinkUser', {
                    customerId: customerId,
                }).then(data => {
                    if(data.errorcode === 0) {
                        this.$toast.success(this.updateItem.Enable ? '解除绑定成功.' : '解除绑定成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.$toast.error(this.updateItem.Enable ? '解除绑定失败,请重新提交.</br>' + data.errormsg : '解除绑定失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }

                    this.unLinkUserDialog = false;
                }).catch(error => {
                    this.$toast.error(this.updateItem.Enable ? '解除绑定失败,请重新提交.</br>' + error.message : '解除绑定失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    this.unLinkUserDialog = false;
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

            departmentSelectorConfirm: function (selectedItems) {
                this.updateItem.Departments = selectedItems;
            },

            departmentSelectorShow: function () {
                this.departmentSelectorSetting.show = true;
            },

            departmentSelectorDelete: function (item) {
                if (!item) {
                    return;
                }


            },
            //机构/部门选择 End


            //账户选择 Begin
            userSelectorShowChange: function (val) {
                this.userSelectorSetting.show = val;
            },

            userSelectorConfirm: function (selectedItems) {
                if(selectedItems && selectedItems.length > 0) {
                    this.userSelectorSetting.selectedItems = selectedItems;
                    this.confirmLinkUser();
                }
            },

            userSelectorShow: function (item) {
                this.prepareUpdateItem(item);
                this.userSelectorSetting.selectedItems = [];
                this.userSelectorSetting.show = true;
            },
            //账户选择 End

            //日期格式化
            formatDate(date) {
                if (!date) return null

                const [year, month, day] = date.split('-')
                return `${month}/${day}/${year}`
            },
            parseDate(date) {
                if (!date) return null

                const [month, day, year] = date.split('/')
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            },
        },
    }
</script>

<style>
</style>