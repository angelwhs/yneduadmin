<template>
    <div id="pageLesson" class="page-wrapper">
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
                                    <th class="text-left">课程名称</th>
                                    <th class="text-left">讲师</th>
                                    <th class="text-left">价格</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>
                                            <template v-if="item.Lecturers && item.Lecturers.length > 0">
                                                <v-chip v-for="l in item.Lecturers" class="ma-2" small>
                                                    {{l.RealName}}
                                                </v-chip>
                                            </template>
                                        </td>
                                        <td>{{ item.Price }}</td>
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
                                            <v-btn small outlined color="primary" class="mr-4"
                                                @click="gotoLessonChapter(item)">
                                                章节
                                            </v-btn>
                                            <v-btn small outlined color="primary" class="mr-4"
                                                @click="gotoLessonCatalog(item)">
                                                目录
                                            </v-btn>
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
                    <!--tool bar-->
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="updateDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                            <span>课程</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text class="mt-2 pl-2 pr-2">
                        <v-tabs background-color="white" color="primary " v-model="tabsSetting.tab">
                            <v-tabs-slider></v-tabs-slider>
                            <v-tab :key="1">基本信息</v-tab>
                            <v-tab :key="2">价格信息</v-tab>
                            <v-tab :key="3">课程介绍</v-tab>
                            <v-tab :key="4">营销信息</v-tab>
                            <v-tab :key="5">分享信息</v-tab>
                            <v-tab :key="6">用户协议</v-tab>
                        </v-tabs>

                        <v-tabs-items v-model="tabsSetting.tab">
                            <!--基本信息-->
                            <v-tab-item :key="1">
                                <v-card flat>
                                    <v-card-text>
                                        <!--标题-->
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-text-field v-model="updateItem.Title" label="课程标题" dense
                                                    placeholder="请输入课程标题" :rules="[() => !!updateItem.Title || '不能为空.']"
                                                    :error-messages="errorMessages" ref="Entity_Title">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--分类-->
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

                                        <!--课程标签-->
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-select outlined chips clearable label="课程标签" item-text="Name"
                                                    item-value="Id" placeholder="请选择课程标签" :items="lessonTags.list" return-object
                                                    v-model="updateItem.LessonTags" dense multiple deletable-chips small-chips>
                                                </v-select>
                                            </v-col>
                                        </v-row>

                                        <!--课程类型-->
                                        <!--课程状态-->
                                        <!--连载状态-->
                                        <v-row>
                                            <v-col cols="12" md="4">
                                                <v-select :items="courseTypeList" dense label="课程类型" item-text="Name"
                                                    item-value="Id" placeholder="请选择课程类型"
                                                    v-model="updateItem.CourseType"></v-select>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-select :items="lessonStatusList" dense label="课程状态" item-text="Name"
                                                    item-value="Id" placeholder="请选择课程状态" v-model="updateItem.Status">
                                                </v-select>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-select :items="serializeStatusList" dense label="连载状态"
                                                    item-text="Name" item-value="Id" placeholder="请选择连载状态"
                                                    v-model="updateItem.SerializeStatus"></v-select>
                                            </v-col>
                                        </v-row>

                                        <!--是否发布-->
                                        <!--排序-->
                                        <!--总章节数-->
                                        <!--已更新章节数-->
                                        <v-row>
                                            <v-col cols="12" md="3">
                                                <v-switch v-model="updateItem.Published" label="是否发布" dense></v-switch>
                                            </v-col>
                                            <v-col cols="12" md="3">
                                                <v-text-field v-model="updateItem.DisplayOrder" label="排序" dense
                                                    placeholder="请输入排序" :error-messages="errorMessages"
                                                    ref="Entity_DisplayOrder" type="number">
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="3">
                                                <v-text-field v-model="updateItem.TotalChapterCount" label="总章节数" dense
                                                    placeholder="请输入总章节数" :error-messages="errorMessages"
                                                    ref="Entity_TotalChapterCount" type="number">
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="3">
                                                <v-text-field v-model="updateItem.UpdatedChapterCount" label="已更新章节数" dense
                                                    placeholder="请输入已更新章节数" :error-messages="errorMessages" readonly
                                                    ref="Entity_UpdatedChapterCount" type="number">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--任课讲师-->
                                        <v-subheader class="mt-3">讲师</v-subheader>
                                        <v-divider></v-divider>
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <template v-if="updateItem.Lecturers && updateItem.Lecturers.length">
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
                                                                            v-if="updateItem.Lecturers && updateItem.Lecturers.length > 0">
                                                                            <tr v-for="item in updateItem.Lecturers"
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

                                        <!--封面-->
                                        <v-subheader class="mt-3">封面图片</v-subheader>
                                        <v-divider></v-divider>
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-card outlined class="pr-4 pl-4 pb-4 pt-4">
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

                                        <!--难度-->
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-text-field v-model="updateItem.Level" label="课程难度" dense
                                                    placeholder="请输入课程难度（例如：入门篇、高级篇）" :error-messages="errorMessages"
                                                    ref="Entity_Level">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--默认显示-->
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-select :items="defaultDisplayList" dense label="默认显示"
                                                    item-text="Name" item-value="Id" placeholder="请选择默认显示"
                                                    v-model="updateItem.DefaultDisplay"></v-select>
                                            </v-col>
                                        </v-row>

                                    </v-card-text>
                                </v-card>
                            </v-tab-item>

                            <!--价格信息-->
                            <v-tab-item :key="2">
                                <v-card flat>
                                    <v-card-text>
                                        <v-row>
                                            <v-col cols="12" md="4">
                                                <v-select :items="chargingModeList" dense label="收费模式" item-text="Name"
                                                    item-value="Id" placeholder="请选择收费模式"
                                                    v-model="updateItem.ChargingMode"></v-select>
                                            </v-col>
                                        </v-row>

                                        <!--价格-->
                                        <v-subheader class="mt-3">价格</v-subheader>
                                        <v-divider class="mb-3"></v-divider>
                                        <v-row >
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.Price" label="价格" dense :disabled="updateItem.ChargingMode !== 2"
                                                    placeholder="请输入课程价格" :error-messages="errorMessages"
                                                    ref="Entity_Price" type="number">
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.OldPrice" label="原价" dense :disabled="updateItem.ChargingMode !== 2"
                                                    placeholder="请输入课程原价" :error-messages="errorMessages"
                                                    ref="Entity_OldPrice" type="number">
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.ProductCost" label="成本价" dense :disabled="updateItem.ChargingMode !== 2"
                                                    placeholder="请输入课程成本价" :error-messages="errorMessages"
                                                    ref="Entity_ProductCost" type="number">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--库存-->
                                        <v-subheader class="mt-3">库存</v-subheader>
                                        <v-divider class="mb-3"></v-divider>
                                        <v-row>
                                            <v-col cols="12" md="3">
                                                <v-switch v-model="updateItem.DisplayStockQuantity" label="是否启用库存"
                                                    dense></v-switch>
                                            </v-col>
                                            <v-col cols="12" md="9">
                                                <v-text-field v-model="updateItem.StockQuantity" label="库存数" dense
                                                    placeholder="请输入库存数" :error-messages="errorMessages"
                                                    ref="Entity_StockQuantity" type="number">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--最少订购数量-->
                                        <!--最高订购数量-->
                                        <v-row>
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.OrderMinimumQuantity" label="最少订购数量"
                                                    dense placeholder="请输入最少订购数量" :error-messages="errorMessages"
                                                    ref="Entity_OrderMinimumQuantity" type="number">
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.OrderMaximumQuantity" label="最高订购数量"
                                                    dense placeholder="请输入最高订购数量" :error-messages="errorMessages"
                                                    ref="Entity_OrderMaximumQuantity" type="number">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-tab-item>

                            <!--课程介绍-->
                            <v-tab-item :key="3">
                                <v-card flat>
                                    <v-card-text>
                                        <!--课程介绍-->
                                        <v-subheader class="mt-3">课程介绍</v-subheader>
                                        <v-divider></v-divider>
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <tinymce ref="editor" v-model="updateItem.Content" />
                                            </v-col>
                                        </v-row>

                                        <!--简短说明-->
                                        <v-row>
                                            <v-col>
                                                <v-textarea v-model="updateItem.ShortDescription" outlined>
                                                    <template v-slot:label>
                                                        <div>
                                                            简短说明
                                                        </div>
                                                    </template>
                                                </v-textarea>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-tab-item>

                            <!--营销信息-->
                            <v-tab-item :key="4">
                                <v-card flat>
                                    <v-card-text>
                                        <v-row>

                                        </v-row>

                                        <!--虚拟访问量-->
                                        <!--虚拟购买量-->
                                        <v-row>
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.VirtualPV" label="虚拟访问量" dense
                                                    placeholder="请输入虚拟访问量" :error-messages="errorMessages"
                                                    ref="Entity_VirtualPV" type="number">
                                                </v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field v-model="updateItem.VirtualPurchaseQuantity" label="虚拟购买量"
                                                    dense placeholder="请输入虚拟购买量" :error-messages="errorMessages"
                                                    ref="Entity_VirtualPurchaseQuantity" type="number">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-tab-item>

                            <!--分享信息-->
                            <v-tab-item :key="5">
                                <v-card flat>
                                    <v-card-text>
                                        <!--微信分享标题-->
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-text-field v-model="updateItem.WechatShareTitle" label="微信分享标题" dense
                                                    placeholder="请输入微信分享标题" :error-messages="errorMessages"
                                                    ref="Entity_WechatShareTitle">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--微信分享描述-->
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-text-field v-model="updateItem.WechatShareDescription" label="微信分享描述"
                                                    dense placeholder="请输入微信分享描述" :error-messages="errorMessages"
                                                    ref="Entity_WechatShareDescription">
                                                </v-text-field>
                                            </v-col>
                                        </v-row>

                                        <!--微信分享图片-->
                                        <v-subheader class="mt-3">微信分享图片</v-subheader>
                                        <v-divider></v-divider>
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-card outlined class="pr-4 pl-4 pb-4 pt-4">
                                                    <template
                                                        v-if="updateItem.WechatShareImgUrl && updateItem.WechatShareImgUrl !== ''">
                                                        <v-img width="100%" height="200" contain
                                                            :src="updateItem.WechatShareImgUrl" aspect-ratio="1"
                                                            ref="Entity_WechatShareImgUrl">
                                                        </v-img>
                                                    </template>
                                                    <template v-else>
                                                        <div class="d-flex justify-center align-center"
                                                            style="width: 100%; height: 200px;">
                                                            <span class="subtitle-1">请选择图片</span>
                                                        </div>
                                                    </template>
                                                    <input type="hidden" v-model="updateItem.WechatShareImg"
                                                        ref="WechatShareImg" />
                                                    <div class="d-flex justify-center mt-2">
                                                        <v-btn
                                                            @click="pictureSelectorShow('WechatShareImg', 'WechatShareImgUrl')"
                                                            class="mr-12" small color="light-blue darken-1" dark>
                                                            选择图片
                                                        </v-btn>
                                                        <v-btn
                                                            @click="updateItem.WechatShareImg=0;updateItem.WechatShareImgUrl=''"
                                                            small color="light-blue darken-1" dark>
                                                            删除图片
                                                        </v-btn>
                                                    </div>
                                                </v-card>
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-tab-item>

                            <!--用户协议-->
                            <v-tab-item :key="6">
                                <v-card flat>
                                    <v-card-text>
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <v-switch v-model="updateItem.HasUserAgreement" label="是否有用户协议" dense>
                                                </v-switch>
                                            </v-col>
                                        </v-row>
                                        <v-subheader>用户协议</v-subheader>
                                        <v-divider></v-divider>
                                        <v-row>
                                            <v-col cols="12" md="12">
                                                <tinymce ref="editor" v-model="updateItem.UserAgreementText" />
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-tab-item>

                        </v-tabs-items>

                    </v-card-text>

                </v-card>

                <!--选择图片-->
                <picture-selector :isShow="imgSelectorSetting.show" v-on:on-show-change="pictureSelectorShowChange"
                    :multiple="false" :pictureField="imgSelectorSetting.pictureField" platformName="course"
                    :pictureUrlField="imgSelectorSetting.pictureUrlField" v-on:on-confirm="pictureSelectorConfirm">
                </picture-selector>

                <!--讲师选择器-->
                <lecturer-selector :isShow="lecturerSelectorSetting.show" :selected="updateItem.Lecturers"
                    v-on:on-show-change="lecturerSelectorShowChange" v-on:on-confirm="lecturerSelectorConfirm">
                </lecturer-selector>
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
    import { AuditStatus, GetAuditStatusName } from '../../global/globalValue.js';
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import LecturerSelector from '../../components/common/LecturerSelector.vue';

    export default {
        components: {
            tinymce,
            PictureSelector,
            LecturerSelector,
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
                    Content: '',  //内容
                    ImageThumb_PictureId: 0, //封面
                    ImageThumb_PictureUrl: '',
                    Title: '', //标题
                    Status: 0, //状态
                    Level: '', //Level(入门,进阶,高级)
                    SerializeStatus: 0, //连载状态(更新中,已完结)
                    DefaultDisplay: 0, //默认显示(课程目录,课程详情)
                    DisplayOrder: 0, //DisplayOrder
                    CourseType: 0, //CourseType
                    VirtualPV: 0, //虚拟访问量
                    VirtualPurchaseQuantity: 0, //虚拟购买量
                    WechatShareTitle: '', //
                    WechatShareImg: 0,
                    WechatShareImgUrl: '',
                    WechatShareDescription: '',
                    AllowReviews: false, //允许评论
                    HasStock: false, //是否有库存
                    HasUserAgreement: false, //是否有用户协议
                    UserAgreementText: '', //用户协议文本
                    StockQuantity: 0, //库存数
                    DisplayStockQuantity: false, //是否显示库存
                    OrderMinimumQuantity: 0, //最少订购数量
                    OrderMaximumQuantity: 0, //最高订购数量
                    DisableBuyButton: false, //是否显示购买按钮
                    Price: 0, //价格
                    OldPrice: 0, //旧价格
                    ProductCost: 0, //成本价
                    Badges: '', //徽章
                    HasDiscountsApplied: false, //是否有折扣
                    AvailableStartDateTime: '',
                    AvailableEndDateTime: '',
                    Published: false, //是否发布
                    ShortDescription: '', //简短说明
                    ShowOnHomePage: false, //是否显示在首页
                    TotalChapterCount: 0, //总章节数
                    UpdatedChapterCount: 0, //已更新章节数
                    ChargingMode: 0, //收费模式(免费、收费)

                    //扩展数据
                    //任课讲师(已选择的)
                    Lecturers: [],

                    //课程分类(已选择的)
                    LessonCategories: [],

                    //课程标签(已选择的)
                    LessonTags: [],
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

                statusList: AuditStatus,

                //图片选择控件参数
                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                //讲师选择器参数
                lecturerSelectorSetting: {
                    show: false,
                    selectedItems: [],
                },

                //tab 设置
                tabsSetting: {
                    tab: null,
                },

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

                //课程标签
                lessonTags: {
                    list: [],
                    searchName: '',
                },

                //课程状态
                lessonStatusList: [
                    { Id: 1, Name: '上架' },
                    { Id: 2, Name: '编辑中' },
                    { Id: 3, Name: '下架' },
                ],

                //连载状态
                serializeStatusList: [
                    { Id: 1, Name: '已完结' },
                    { Id: 2, Name: '连载中' },
                ],

                //默认显示选项
                defaultDisplayList: [
                    { Id: 1, Name: '课程目录' },
                    { Id: 2, Name: '课程详情' },
                ],

                //课程类型
                courseTypeList: [
                    { Id: 1, Name: '普通课程' },
                    { Id: 2, Name: '报名课程' },
                ],

                //收费模式
                chargingModeList: [
                    { Id: 1, Name: '免费' },
                    { Id: 2, Name: '收费' },
                ],
            }
        },

        mounted() {
            

            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/lesson/list', {
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
                this.updateItem.Description = item.Description;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Content = item.Content;  //内容
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId; //封面
                this.updateItem.Title = item.Title; //标题
                this.updateItem.Status = item.Status; //状态
                this.updateItem.Level = item.Level; //Level(入门,进阶,高级)
                this.updateItem.SerializeStatus = item.SerializeStatus; //连载状态(更新中,已完结)
                this.updateItem.DefaultDisplay = item.DefaultDisplay; //默认显示(课程目录,课程详情)
                this.updateItem.DisplayOrder = item.DisplayOrder; //DisplayOrder
                this.updateItem.CourseType = item.CourseType; //CourseType
                this.updateItem.VirtualPV = item.VirtualPV; //虚拟访问量
                this.updateItem.VirtualPurchaseQuantity = item.VirtualPurchaseQuantity; //虚拟购买量
                this.updateItem.WechatShareTitle = item.WechatShareTitle; //
                this.updateItem.WechatShareImg = item.WechatShareImg;
                this.updateItem.WechatShareDescription = item.WechatShareDescription;
                this.updateItem.AllowReviews = item.AllowReviews; //允许评论
                this.updateItem.HasStock = item.HasStock; //是否有库存
                this.updateItem.HasUserAgreement = item.HasUserAgreement; //是否有用户协议
                this.updateItem.UserAgreementText = item.UserAgreementText; //用户协议文本
                this.updateItem.StockQuantity = item.StockQuantity; //库存数
                this.updateItem.DisplayStockQuantity = item.DisplayStockQuantity; //是否显示库存
                this.updateItem.OrderMinimumQuantity = item.OrderMinimumQuantity; //最少订购数量
                this.updateItem.OrderMaximumQuantity = item.OrderMaximumQuantity; //最高订购数量
                this.updateItem.DisableBuyButton = item.DisableBuyButton; //是否显示购买按钮
                this.updateItem.Price = item.Price; //价格
                this.updateItem.OldPrice = item.OldPrice; //旧价格
                this.updateItem.ProductCost = item.ProductCost; //成本价
                this.updateItem.Badges = item.Badges; //徽章
                this.updateItem.HasDiscountsApplied = item.HasDiscountsApplied; //是否有折扣
                this.updateItem.AvailableStartDateTime = item.AvailableStartDateTime;
                this.updateItem.AvailableEndDateTime = item.AvailableEndDateTime;
                this.updateItem.Published = item.Published; //是否发布
                this.updateItem.ShortDescription = item.ShortDescription; //简短说明
                this.updateItem.ShowOnHomePage = item.ShowOnHomePage; //是否显示在首页
                this.updateItem.TotalChapterCount = item.TotalChapterCount; //总章节数
                this.updateItem.UpdatedChapterCount = item.UpdatedChapterCount; //已更新章节数

                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.WechatShareImgUrl = item.WechatShareImgUrl;

                //讲师
                this.updateItem.Lecturers = item.Lecturers;

                //课程分类
                this.updateItem.LessonCategories = item.LessonCategories;
                this.lessonCategories.selected = [];
                if(this.updateItem.LessonCategories && this.updateItem.LessonCategories.length > 0) {
                    this.updateItem.LessonCategories.forEach((val, index) => {
                        this.lessonCategories.selected.push(val.Id);
                    });
                }

                //课程标签
                this.updateItem.LessonTags = item.LessonTags;
            },

            openCreate: function () {
                this.loadLessonCategories();
                this.loadLessonTags();

                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.Content = '';  //内容
                this.updateItem.ImageThumb_PictureId = 0; //封面
                this.updateItem.Title = ''; //标题
                this.updateItem.Status = 1; //状态
                this.updateItem.Level = ''; //Level(入门,进阶,高级)
                this.updateItem.SerializeStatus = 1; //连载状态(更新中,已完结)
                this.updateItem.DefaultDisplay = 1; //默认显示(课程目录,课程详情)
                this.updateItem.DisplayOrder = 1; //DisplayOrder
                this.updateItem.CourseType = 1; //CourseType
                this.updateItem.VirtualPV = 0; //虚拟访问量
                this.updateItem.VirtualPurchaseQuantity = 0; //虚拟购买量
                this.updateItem.WechatShareTitle = ''; //
                this.updateItem.WechatShareImg = 0;
                this.updateItem.WechatShareDescription = '';
                this.updateItem.AllowReviews = false; //允许评论
                this.updateItem.HasStock = false; //是否有库存
                this.updateItem.HasUserAgreement = false; //是否有用户协议
                this.updateItem.UserAgreementText = ''; //用户协议文本
                this.updateItem.StockQuantity = 0; //库存数
                this.updateItem.DisplayStockQuantity = false; //是否显示库存
                this.updateItem.OrderMinimumQuantity = 0; //最少订购数量
                this.updateItem.OrderMaximumQuantity = 0; //最高订购数量
                this.updateItem.DisableBuyButton = false; //是否显示购买按钮
                this.updateItem.Price = 0; //价格
                this.updateItem.OldPrice = 0; //旧价格
                this.updateItem.ProductCost = 0; //成本价
                this.updateItem.Badges = ''; //徽章
                this.updateItem.HasDiscountsApplied = false; //是否有折扣
                this.updateItem.AvailableStartDateTime = '';
                this.updateItem.AvailableEndDateTime = '';
                this.updateItem.Published = false; //是否发布
                this.updateItem.ShortDescription = ''; //简短说明
                this.updateItem.ShowOnHomePage = false; //是否显示在首页
                this.updateItem.TotalChapterCount = 0; //总章节数
                this.updateItem.UpdatedChapterCount = 0; //已更新章节数

                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.WechatShareImgUrl = '';

                this.updateItem.Lecturers = [];
                this.updateItem.LessonCategories = [];
                this.lessonCategories.selected = [];

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.loadLessonCategories();
                this.loadLessonTags();

                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/course/backend/lesson/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveLessonCategory(data.result.Id);
                        } else {
                            this.saveFailed(data.errormessage);
                        }
                    }).catch((error) => {
                        this.saveFailed(error.message);
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/course/backend/lesson/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.saveLessonCategory(data.result.Id);
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

            saveLessonCategory: function (lessonId) {
                if (!lessonId || lessonId <= 0) {
                    this.saveLessonLecturer(lessonId);
                    return;
                }

                if (!this.lessonCategories.selected || this.lessonCategories.selected.length <= 0) {
                    this.saveLessonLecturer(lessonId);
                    return;
                }

                this.postAxios('/api/course/backend/lesson/AddCategories', JSON.stringify({
                    lessonId: lessonId,
                    categories: this.lessonCategories.selected,
                })).then(data => {
                    if (data.errorcode === 0) {
                        this.saveLessonLecturer(lessonId);
                    } else {
                        this.saveFailed(data.errormessage);
                    }
                }).catch(error => {
                    this.saveFailed(data.errormessage);
                });
            },

            saveLessonLecturer: function (lessonId) {
                if (!lessonId || lessonId <= 0) {
                    this.saveSuccessed();
                    return;
                }

                if (!this.updateItem.Lecturers || this.updateItem.Lecturers.length <= 0) {
                    this.saveSuccessed();
                    return;
                }

                this.postAxios('/api/course/backend/lesson/AddLecturers', JSON.stringify({
                    lessonId: lessonId,
                    lecturers: this.updateItem.Lecturers,
                })).then(data => {
                    if (data.errorcode === 0) {
                        this.saveLessonTag(lessonId);
                    } else {
                        this.saveFailed(data.errormessage);
                    }
                }).catch(error => {
                    this.saveFailed(data.errormessage);
                });
            },

            saveLessonTag: function(lessonId) {
                if (!lessonId || lessonId <= 0) {
                    this.saveSuccessed();
                    return;
                }

                if(!this.updateItem.LessonTags || this.updateItem.LessonTags.length <= 0) {
                    this.saveSuccessed();
                    return;
                }

                let tagsIds = new Array();
                this.updateItem.LessonTags.forEach((val, index) => {
                    tagsIds.push(val.Id);
                });

                this.postAxios('/api/course/backend/lesson/AddTags', JSON.stringify({
                    lessonId: lessonId,
                    tags: tagsIds,
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

                this.getAxios('/api/course/backend/lesson/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/course/backend/lesson/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            //讲师选择器 Begin
            lecturerSelectorShowChange: function (val) {
                this.lecturerSelectorSetting.show = val;
            },

            lecturerSelectorConfirm: function (selectedItems) {
                if (selectedItems && selectedItems.length > 0) {
                    this.updateItem.Lecturers = selectedItems;
                }
            },

            lecturerSelectorShow: function () {
                this.lecturerSelectorSetting.show = true;
            },
            //讲师选择器 End

            lecturerDelete: function (item) {
                if (this.updateItem.Lecturers && this.updateItem.Lecturers.length > 0) {
                    this.updateItem.Lecturers.forEach((val, index) => {
                        if (val && val.Id === item.Id) {
                            this.updateItem.Lecturers.splice(index, 1);
                        }
                    })
                }
            },

            //加载数据
            //加载课程分类
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

            //加载课程标签
            loadLessonTags: function() {
                this.getAxios('/api/course/backend/lessontag/GetAllEnable', {
                    searchName: this.lessonTags.searchName,
                }).then(data => {
                    if (data.errorcode === 0) {
                        this.lessonTags.list = data.result.Data;
                    } else {

                    }
                }).catch(error => {

                });
            },

            //跳转课程目录页面
            gotoLessonCatalog: function (item) {
                if (!item) {
                    return;
                }

                this.$router.push({
                    name: 'CourseCatalogManage',
                    params: { id: item.Id },
                });
            },

            //跳转课程章节页面
            gotoLessonChapter: function (item) {
                if (!item) {
                    return;
                }

                this.$router.push({
                    name: 'CourseChapterManage',
                    params: { id: item.Id },
                });
            }


        },
    }
</script>

<style>
</style>