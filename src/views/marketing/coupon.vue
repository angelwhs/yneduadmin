<template>
    <div id="pageArticleTag" class="page-wrapper">
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
                                    <th class="text-left">类型</th>
                                    <th class="text-left">优惠内容</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>{{ item.Title }}</td>
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
                            <span>优惠券</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <!--名称-->
                            <!--排序-->
                            <!--状态-->
                            <!--是否可累积-->
                            <!--是否启用-->
                            <v-row>
                                <v-col cols="12" md="5">
                                    <v-text-field v-model="updateItem.Title" dense label="名称" placeholder="请输入名称"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="EntityTitle">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="1">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="排序" dense placeholder="请输入排序"
                                        :error-messages="errorMessages" ref="EntityDisplayOrder" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select :items="statusList" dense label="状态" item-text="Name" item-value="Id"
                                        placeholder="请选择状态" v-model="updateItem.Status">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-switch v-model="updateItem.IsCumulative" label="是否可累积"></v-switch>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                            </v-row>

                            <!--优惠券类型-->
                            <!--满多少(满减券)-->
                            <!--减多少(满减券)-->
                            <!--折扣率(折扣券)100为基数-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-select :items="couponTypeList" dense label="优惠券类型" item-text="Name"
                                        item-value="Id" placeholder="请选择优惠券类型" v-model="updateItem.CouponType">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="8">
                                    <v-row class="ml-2">
                                        <span class="item-text-style">满</span>
                                        <div style="width: 80px;">
                                            <v-text-field v-model="updateItem.BaseAmount" dense placeholder="0"
                                                :error-messages="errorMessages" ref="EntityBaseAmount" type="number">
                                            </v-text-field>
                                        </div>

                                        <template v-if="updateItem.CouponType === 1 || updateItem.CouponType === 2">
                                            <span class="item-text-style">元 </span>
                                        </template>
                                        <template v-else-if="updateItem.CouponType === 3">
                                            <span class="item-text-style">件 </span>
                                        </template>
                                        <template v-if="updateItem.CouponType === 1">
                                            <span class="item-text-style">减</span>
                                            <div style="width: 80px;">
                                                <v-text-field v-model="updateItem.DiscountAmount" dense placeholder="0"
                                                    :error-messages="errorMessages" ref="EntityDiscountAmount"
                                                    type="number">
                                                </v-text-field>
                                            </div>

                                            <span class="item-text-style">元</span>
                                        </template>
                                        <template
                                            v-else-if="updateItem.CouponType === 2 || updateItem.CouponType === 3">
                                            <span class="item-text-style">打</span>
                                            <div style="width: 80px;">
                                                <v-text-field v-model="updateItem.DiscountPercentage" dense
                                                    placeholder="0" :error-messages="errorMessages"
                                                    ref="EntityDiscountPercentage" type="number">
                                                </v-text-field>
                                            </div>
                                            <span class="item-text-style">折</span>
                                        </template>
                                    </v-row>
                                </v-col>

                            </v-row>

                            <!--领取开始时间-->
                            <!--领取结束时间-->
                            <v-row>
                                
                                <v-col cols="12" md="6">
                                    <v-menu v-model="datePickSettings.beginTimeMenu" :close-on-content-click="false"
                                        :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field v-model="updateItem.BeginTime" label="领取开始时间" dense
                                                prepend-icon="event" readonly v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="updateItem.BeginTime"
                                            @input="datePickSettings.beginTimeMenu = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-menu v-model="datePickSettings.endTimeMenu" :close-on-content-click="false"
                                        :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field v-model="updateItem.EndTime" label="领取结束时间" dense
                                                prepend-icon="event" readonly v-bind="attrs" v-on="on"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="updateItem.EndTime"
                                            @input="datePickSettings.endTimeMenu = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>

                            <!--总可兑换数量-->
                            <!--每个用户可兑换数量-->
                            <!--是否需要优惠码-->
                            <!--优惠码-->
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.TotalExchangeQuantity" dense placeholder="0"
                                        label="总可兑换数量" :error-messages="errorMessages" ref="EntityTotalExchangeQuantity"
                                        type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.ExchangeQuantityByPerPerson" dense placeholder="0"
                                        label="每个用户可兑换数量" :error-messages="errorMessages"
                                        ref="EntityExchangeQuantityByPerPerson" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-switch v-model="updateItem.RequiresCouponCode" label="是否可累积"></v-switch>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.CouponCode" dense label="优惠码"
                                        :placeholder="updateItem.RequiresCouponCode?'请输入优惠码':'无'"
                                        :error-messages="errorMessages" ref="EntityCouponCode"
                                        :disabled="!updateItem.RequiresCouponCode">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--有效期方式-->
                            <!--有效期天数-->
                            <!--有效期开始时间-->
                            <!--有效期结束时间-->
                            <v-row>
                                <v-col cols="12" md="2">
                                    <v-select :items="termOfValidityTypeList" dense label="有效期方式" item-text="Name"
                                        item-value="Id" placeholder="请选择有效期方式" v-model="updateItem.TermOfValidityType">
                                    </v-select>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-menu v-model="datePickSettings.termOfValidityBeginTimeMenu"
                                        :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field v-model="updateItem.TermOfValidityBeginTime" label="有效期开始时间"
                                                dense prepend-icon="event" readonly v-bind="attrs" v-on="on"
                                                :disabled="updateItem.TermOfValidityType !== 2"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="updateItem.TermOfValidityBeginTime"
                                            @input="datePickSettings.termOfValidityBeginTimeMenu = false">
                                        </v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-menu v-model="datePickSettings.termOfValidityEndTimeMenu"
                                        :close-on-content-click="false" :nudge-right="40" transition="scale-transition"
                                        offset-y min-width="290px">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field v-model="updateItem.TermOfValidityEndTime" label="有效期结束时间"
                                                dense prepend-icon="event" readonly v-bind="attrs" v-on="on"
                                                :disabled="updateItem.TermOfValidityType !== 2"></v-text-field>
                                        </template>
                                        <v-date-picker v-model="updateItem.TermOfValidityEndTime"
                                            @input="datePickSettings.termOfValidityEndTimeMenu = false"></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field v-model="updateItem.TermOfValidityDays" dense placeholder="0"
                                        label="有效期天数" :error-messages="errorMessages" ref="EntityTermOfValidityDays"
                                        type="number" :disabled="updateItem.TermOfValidityType !== 1">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--优惠券适用类型-->
                            <v-row>
                                <v-col>
                                    <v-select :items="appliedToTypeList" dense label="优惠券适用类型" item-text="Name"
                                        item-value="Id" placeholder="请选择优惠券适用类型" v-model="updateItem.AppliedToType">
                                    </v-select>
                                </v-col>
                            </v-row>
                            <template v-if="updateItem.AppliedToType === 2">
                                <v-row>
                                    <v-col cols="12" md="12">
                                        <label class="v-label v-label--active theme--light"
                                            style="left: 0px; right: auto; font-size: 12px;">课程分类</label>
                                        <el-cascader :options="lessonCategories.list" clearable
                                            v-model="lessonCategories.selected"
                                            :props="lessonCategories.selectProps" style="width: 100%;"
                                            placeholder="请选择分类" ref="lessonCategoriesSelector">
                                        </el-cascader>
                                        <div class="v-messages theme--light"></div>
                                    </v-col>
                                </v-row>
                            </template>
                            <template v-else-if="updateItem.AppliedToType === 3">
                                <v-card>
                                    <!--关联课程-->
                                    <v-row>
                                        <v-col>
                                            <template
                                                v-if="updateItem.AppliedToLessons && updateItem.AppliedToLessons.length > 0">
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
                                                                    <template
                                                                        v-if="updateItem.AppliedToLessons && updateItem.AppliedToLessons.length > 0">
                                                                        <tr v-for="item in updateItem.AppliedToLessons"
                                                                            :key="item.Id">
                                                                            <td>{{ item.Id }}</td>
                                                                            <td>{{ item.Title }}</td>
                                                                            <td>{{ item.Created }}</td>
                                                                            <td>
                                                                                <v-icon size="20" color="deep-orange"
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
                                                    <v-btn @click="lessonSelectorShow" small color="light-blue darken-1">
                                                        <span style="color: white;">添加课程</span>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </template>
                            <template v-else-if="updateItem.AppliedToType === 4">
                                <v-card>
                                    <!--任课讲师-->
                                    <v-row>
                                        <v-col cols="12" md="12">
                                            <template v-if="updateItem.AppliedToLecturers && updateItem.AppliedToLecturers.length">
                                                <v-card class="mt-0 mb-0 ml-12 mr-12" outlined>
                                                    <v-row>
                                                        <v-col>
                                                            <v-simple-table fixed-header class="pl-4 pr-4">
                                                                <thead>
                                                                    <tr>
                                                                        <th class="text-left">Id</th>
                                                                        <th class="text-left">姓名</th>
                                                                        <th class="text-left">关联机构</th>
                                                                        <th class="text-left">操作</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <template
                                                                        v-if="updateItem.AppliedToLecturers && updateItem.AppliedToLecturers.length > 0">
                                                                        <tr v-for="item in updateItem.AppliedToLecturers"
                                                                            :key="item.Id">
                                                                            <td>{{ item.Id }}</td>
                                                                            <td>{{ item.RealName }}</td>
                                                                            <td>
                                                                                <template
                                                                                    v-if="item.Departments && item.Departments.length">
                                                                                    <v-row
                                                                                        v-for="d in item.Departments"
                                                                                        class="mt-1 mb-1">
                                                                                        <v-chip small>
                                                                                            <template
                                                                                                v-if="d.Company">{{d.Company.Title + ' - '}}</template>
                                                                                            {{d.Title}}
                                                                                        </v-chip>
                                                                                    </v-row>
                                                                                </template>
                                                                            </td>
                                                                            <td>
                                                                                <v-icon size="20"
                                                                                    color="deep-orange"
                                                                                    @click="lecturerDelete(item)">
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
                                                        <span class="ma-4">未添加讲师</span>
                                                    </v-col>
                                                </v-row>
                                            </template>
                                            <v-row>
                                                <v-col class="d-flex justify-center align-center">
                                                    <v-btn @click="lecturerSelectorShow" small
                                                        color="light-blue darken-1" dark>
                                                        添加讲师
                                                    </v-btn>
                                                </v-col>

                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-card>
                            </template>


                            <!--封面-->
                            <v-subheader>封面</v-subheader>
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

                            <!--介绍-->
                            <v-subheader class="mt-3">优惠券说明</v-subheader>
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
                <lesson-selector :isShow="lessonSelectorSetting.show" :selected="updateItem.AppliedToLessons"
                    v-on:on-show-change="lessonSelectorShowChange" v-on:on-confirm="lessonSelectorConfirm">
                </lesson-selector>

                <!--讲师选择器-->
                <lecturer-selector :isShow="lecturerSelectorSetting.show" :selected="updateItem.AppliedToLecturers"
                    v-on:on-show-change="lecturerSelectorShowChange" v-on:on-confirm="lecturerSelectorConfirm">
                </lecturer-selector>
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
    import { formatDate } from '../../common/data.js';
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import { AuditStatus, GetAuditStatusName } from '../../global/globalValue.js';
    import LessonSelector from '../../components/common/LessonSelector.vue';
    import LecturerSelector from '../../components/common/LecturerSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
            LessonSelector,
            LecturerSelector,
        },

        data() {
            return {
                baseApiPath: '/api/marketing/backend/coupon',

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

                    AppliedToLessons: [],
                    AppliedToLecturers: [],
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

                // #region 列表数据
                statusList: AuditStatus,

                //优惠券类型 
                couponTypeList: [
                    { Id: 1, Name: '满减券' },
                    { Id: 2, Name: '折扣券(满金额)' },
                    { Id: 3, Name: '折扣券(满件数)' },
                ],

                //有效期方式 
                termOfValidityTypeList: [
                    { Id: 1, Name: '按天数' },
                    { Id: 2, Name: '按时间限制' },
                ],

                //优惠券适用类型 
                appliedToTypeList: [
                    { Id: 1, Name: '全部课程' },
                    { Id: 2, Name: '按课程分类' },
                    { Id: 3, Name: '按课程' },
                    { Id: 4, Name: '按讲师' },
                ],
                // #endregion

                // #region 加载的数据
                //课程分类
                lessonCategories: {
                    list: [],
                    selected: [],
                    selectProps: {
                        multiple: true,
                        label: 'Title',
                        children: 'Childs',
                        value: 'Id',
                        emitPath: false,
                    },
                    searchName: '',
                },

                //讲师选择器参数
                lecturerSelectorSetting: {
                    show: false,
                    selectedItems: [],
                },

                //课程选择器参数
                lessonSelectorSetting: {
                    show: false,
                    selectedItems: [],
                },

                // #endregion

                datePickSettings: {
                    beginTimeMenu: false,
                    endTimeMenu: false,
                    termOfValidityBeginTimeMenu: false,
                    termOfValidityEndTimeMenu: false,
                },

            }
        },

        mounted() {
            this.search(0);

            this.loadLessonCategories();
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios(this.baseApiPath + '/list', {
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
                this.updateItem.Description = item.Description;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Title = item.Title;
                this.updateItem.Content = item.Content;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.Status = item.Status;
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.BeginTime = item.BeginTime; //开始时间
                this.updateItem.EndTime = item.EndTime; //结束时间
                this.updateItem.CouponType = item.CouponType; //优惠券类型
                this.updateItem.BaseAmount = item.BaseAmount; //满多少(满减券)
                this.updateItem.DiscountAmount = item.DiscountAmount; //减多少(满减券)
                this.updateItem.DiscountPercentage = item.DiscountPercentage; //折扣率(折扣券)100为基数
                this.updateItem.CouponCode = item.CouponCode; //优惠码
                this.updateItem.RequiresCouponCode = item.RequiresCouponCode; //是否需要优惠码
                this.updateItem.IsCumulative = item.IsCumulative; //是否累积
                this.updateItem.TermOfValidityType = item.TermOfValidityType; //有效期方式
                this.updateItem.TermOfValidityDays = item.TermOfValidityDays; //有效期天数
                this.updateItem.TermOfValidityBeginTime = item.TermOfValidityBeginTime; //有效期开始时间
                this.updateItem.TermOfValidityEndTime = item.TermOfValidityEndTime; //有效期结束时间
                this.updateItem.TotalExchangeQuantity = item.TotalExchangeQuantity; //总可兑换数量
                this.updateItem.ExchangedQuantity = item.ExchangedQuantity; //已兑换数量
                this.updateItem.ExchangeQuantityByPerPerson = item.ExchangeQuantityByPerPerson; //每个用户可兑换数量
                this.updateItem.AppliedToType = item.AppliedToType; //优惠券适用类型
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.Title = '';
                this.updateItem.Content = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.Status = 1;
                this.updateItem.DisplayOrder = 0;
                this.updateItem.BeginTime = ''; //开始时间
                this.updateItem.EndTime = ''; //结束时间
                this.updateItem.CouponType = 1; //优惠券类型
                this.updateItem.BaseAmount = 0; //满多少(满减券)
                this.updateItem.DiscountAmount = 0; //减多少(满减券)
                this.updateItem.DiscountPercentage = 0; //折扣率(折扣券)100为基数
                this.updateItem.CouponCode = ''; //优惠码
                this.updateItem.RequiresCouponCode = false; //是否需要优惠码
                this.updateItem.IsCumulative = false; //是否累积
                this.updateItem.TermOfValidityType = 2; //有效期方式
                this.updateItem.TermOfValidityDays = 30; //有效期天数
                this.updateItem.TermOfValidityBeginTime = ''; //有效期开始时间
                this.updateItem.TermOfValidityEndTime = ''; //有效期结束时间
                this.updateItem.TotalExchangeQuantity = 0; //总可兑换数量
                this.updateItem.ExchangedQuantity = 0; //已兑换数量
                this.updateItem.ExchangeQuantityByPerPerson = 1; //每个用户可兑换数量
                this.updateItem.AppliedToType = 1; //优惠券适用类型

                //初始化时间
                let begindate = new Date();
                let daysms = 30 * (1000 * 60 * 60 * 24);
                let enddate = new Date(begindate.getTime() + daysms);

                this.updateItem.BeginTime = formatDate(begindate, 'yyyy-MM-dd');
                this.updateItem.EndTime = formatDate(enddate, 'yyyy-MM-dd');
                this.updateItem.TermOfValidityBeginTime = formatDate(begindate, 'yyyy-MM-dd'); 
                this.updateItem.TermOfValidityEndTime = formatDate(enddate, 'yyyy-MM-dd');

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                console.log(this.updateItem);

                if (this.updateItem.Id === 0) {
                    this.postAxios(this.baseApiPath + '/create', JSON.stringify(this.updateItem)).then((data) => {
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
                    this.postAxios(this.baseApiPath + '/edit', JSON.stringify(this.updateItem)).then((data) => {
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
                        this.$toast.error('修改失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
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

                this.getAxios(this.baseApiPath + '/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios(this.baseApiPath + '/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            // #region 封面图片选择
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
            // #endregion

            // #region 讲师选择器
            lecturerSelectorShowChange: function (val) {
                this.lecturerSelectorSetting.show = val;
            },

            lecturerSelectorConfirm: function (selectedItems) {
                if (selectedItems && selectedItems.length > 0) {
                    this.updateItem.AppliedToLecturers = selectedItems;
                }
            },

            lecturerSelectorShow: function () {
                this.lecturerSelectorSetting.show = true;
            },

            lecturerDelete: function (item) {
                if (this.updateItem.AppliedToLecturers && this.updateItem.AppliedToLecturers.length > 0) {
                    this.updateItem.AppliedToLecturers.forEach((val, index) => {
                        if (val && val.Id === item.Id) {
                            this.updateItem.AppliedToLecturers.splice(index, 1);
                        }
                    })
                }
            },
            // #endregion

            // #region 课程选择器
            lessonSelectorShowChange: function (val) {
                this.lessonSelectorSetting.show = val;
            },

            lessonSelectorConfirm: function (selectedItems) {
                if (selectedItems && selectedItems.length > 0) {
                    this.updateItem.AppliedToLessons = selectedItems;
                }
            },

            lessonSelectorShow: function () {
                this.lessonSelectorSetting.show = true;
            },

            lessonDelete: function (item) {
                if (this.updateItem.AppliedToLessons && this.updateItem.AppliedToLessons.length > 0) {
                    this.updateItem.AppliedToLessons.forEach((val, index) => {
                        if (val && val.Id === item.Id) {
                            this.updateItem.AppliedToLessons.splice(index, 1);
                        }
                    })
                }
            },
            // #endregion

            loadLessonCategories: function () {
                this.getAxios('/api/course/backend/lessoncategory/GetAllEnable', {
                    searchName: this.lessonCategories.searchName,
                }).then(data => {
                    if (data.errorcode === 0) {
                        this.lessonCategories.list = data.result.Data;
                    } else {

                    }
                }).catch(error => {

                });
            },

            getStatusName: function (status) {
                return GetAuditStatusName(status);
            },

            getCouponType: function (coupontype) {
                let res = '';
                switch (coupontype) {
                    case 1:
                        name = '满减券';
                        break;
                    case 2:
                        name = '折扣券(满金额)';
                        break;
                    case 3:
                        name = '折扣券(满件数)';
                        break;
                    default:
                        break;
                }
                return res;
            },

            getTermOfValidityType: function (termOfValidityType) {
                let res = '';
                switch (termOfValidityType) {
                    case 1:
                        name = '按天数';
                        break;
                    case 2:
                        name = '按时间限制';
                        break;
                    default:
                        break;
                }
                return res;
            },

            getAppliedToType: function (appliedToType) {
                let res = '';
                switch (appliedToType) {
                    case 1:
                        name = '全部课程';
                        break;
                    case 2:
                        name = '按课程分类';
                        break;
                    case 3:
                        name = '按课程';
                        break;
                    case 4:
                        name = '按讲师';
                        break;
                    default:
                        break;
                }
                return res;
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
        },
    }
</script>

<style scoped>
    .item-text-style {
        line-height: 18px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.87);
        margin-top: 8px;
        margin-left: 5px;
        margin-right: 5px;
    }
</style>