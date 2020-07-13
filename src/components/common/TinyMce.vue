<template>
    <div class="tinymce-box">
        <editor v-model="myValue" :init="init" :disabled="disabled" @onClick="onClick">

        </editor>
    </div>
</template>

<script>
    import tinymce from 'tinymce/tinymce' //tinymce默认hidden，不引入不显示
    import Editor from '@tinymce/tinymce-vue'
    import 'tinymce/themes/silver'
    // 编辑器插件plugins
    // 更多插件参考：https://www.tiny.cloud/docs/plugins/
    import 'tinymce/plugins/image'// 插入上传图片插件
    import 'tinymce/plugins/media'// 插入视频插件
    import 'tinymce/plugins/table'// 插入表格插件
    import 'tinymce/plugins/lists'// 列表插件
    import 'tinymce/plugins/wordcount'// 字数统计插件

    //import roxy from '../../../public/Roxy_Fileman/index.html';
    //import RoxyFileMan from '../../components/common/RoxyFileMan.vue';

    import { baseURL } from '../../utils/axiosconfig.js';

    export default {
        components: {
            'editor': Editor,
        },
        name: 'tinymce',
        props: {
            value: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            plugins: {
                type: [String, Array],
                default: 'lists image media table wordcount'
            },
            toolbar: {
                type: [String, Array],
                default: 'undo redo |  formatselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists image media table | removeformat'
            }
        },
        data() {
            return {
                init: {
                    language_url: '/tinymce/langs/zh_CN.js',
                    language: 'zh_CN',
                    skin_url: '/tinymce/skins/ui/oxide',
                    // skin_url: 'tinymce/skins/ui/oxide-dark',//暗色系
                    //height: 300,
                    plugins: this.plugins,
                    toolbar: this.toolbar,
                    fontsize_formats: "8pt 9pt 10pt 11pt 12pt 26pt 36pt",
                    height: 600,
                    width: '100%',
                    autoresize_min_height: 600,
                    autoresize_max_height: 1600,
                    convert_urls: true,
                    //ensure that special chars are not encoded. For example, ä, ö and ü should NOT become "&auml;", "&ouml;" and "&uuml;"
                    //Otherwise, database searches become impossible when words contain a character of this kind
                    entity_encoding: "raw",
                    allow_script_urls: true,
                    invalid_elements: "script",

                    image_advtab: true,

                    //branding: false,
                    //menubar: false,
                    file_picker_callback: this.RoxyFileBrowser,
                    // 此处为图片上传处理函数，这个直接用了base64的图片形式上传图片，
                    // 如需ajax上传可参考https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_handler
                    // images_upload_handler: (blobInfo, success, failure) => {
                    //     const img = 'data:image/jpeg;base64,' + blobInfo.base64()
                    //     success(img)
                    // }
                },
                myValue: this.value,
                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },
            }
        },
        mounted() {
            tinymce.init({});

            //监听Roxy Fileman 页面传递过来的数据
            window.addEventListener('message', function (event) {
                //event.data获取传过来的数据
                if(event.data.tinymceCallBackURL && event.data.tinymceCallBackURL !== '') {
                    if(window.tinymceWindowManager) {
                        let baseU = baseURL;
                        if(baseURL.endsWith('/')) {
                            baseU = baseU.substr(0, (baseU.length - 1));
                        }
                        window.tinymceCallBackURL = baseU + event.data.tinymceCallBackURL;
                        window.tinymceWindowManager.close();
                    }
                }
            });
        },
        methods: {
            // 添加相关的事件，可用的事件参照文档=> https://github.com/tinymce/tinymce-vue => All available events
            // 需要什么事件可以自己增加
            onClick(e) {
                this.$emit('onClick', e, tinymce)
            },
            // 可以添加一些自己的自定义事件，如清空内容
            clear() {
                this.myValue = ''
            },

            RoxyFileBrowser: function (callback, value, meta) {
                //we manually generate the configuration file to ensure that it works fine in virtual directory
                // var roxyFileman = '../../../static/lib/Roxy_Fileman/index.html';
                // if (roxyFileman.indexOf("?") < 0) {
                //     roxyFileman += "?type=" + meta.filetype;
                // } else {
                //     roxyFileman += "&type=" + meta.filetype;
                // }
                //roxyFileman += '&input=' + value + '&value=' + document.getElementById(value).value;

                //重新定义tinymce 打开的窗口样式
                var windowManagerCSS = '<style type="text/css">' +
                    '.tox-dialog {max-width: 850px!important; width:850px!important; overflow: hidden; height:650px!important; border-radius:0.25em;}' +
                    '.tox-dialog__body { padding: 0!important; }' +
                    '.tox-dialog__body-content > div { height: 650px; width:840px; overflow:hidden}' +
                    '</style > ';

                window.tinymceCallBackURL = '';
                window.tinymceWindowManager = tinymce.activeEditor.windowManager;

                var filemanUrl = 'http://localhost:8080/Roxy_Fileman/index.html';

                if (filemanUrl.indexOf("?") < 0) {
                    filemanUrl += "?type=" + meta.filetype;
                } else {
                    filemanUrl += "&type=" + meta.filetype;
                }

                tinymce.activeEditor.windowManager.open({
                    title: '图片管理器',
                    width: 850,
                    height: 650,
                    body: {
                        type: 'panel',
                        items: [{
                            type: 'htmlpanel',
                            html: windowManagerCSS + '<iframe src="' + filemanUrl + '"  frameborder="0" style="width:850px; height:650px;"></iframe>',
                        }]
                    },
                    buttons: [],
                    onClose: () => {
                        console.log('close');
                        if (window.tinymceCallBackURL != '')
                            callback(window.tinymceCallBackURL, {}); //to set selected file path  
                    },
                    //resizable: "yes",
                    //plugins: "media",
                    //inline: "yes",
                    //close_previous: "no"
                }, {
                    custom_param: 1
                });
            },

        },

        watch: {
            value(newValue) {
                this.myValue = newValue
            },
            myValue(newValue) {
                this.$emit('input', newValue)
            }
        }
    }

</script>
<style scoped>

</style>