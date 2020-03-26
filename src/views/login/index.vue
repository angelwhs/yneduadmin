<template>
    <v-app class="split-bg">
        <v-content>
            <v-container fluid fill-height>
                <v-layout align-center justify-center>
                    <v-flex xs12 sm8 md4 lg4>
                        <v-card class="elevation-1 pa-3">
                            <v-card-text>
                                <div class="layout column align-center">
                                    <img src="../../../static/m.png" alt="Vue Material Admin" width="120"
                                        height="120" />
                                    <h1 class="flex my-4 primary--text">
                                        管理后台
                                    </h1>
                                </div>
                                <v-form>
                                    <v-text-field append-icon="person" name="login" label="用户名" type="text"
                                        v-model="model.account" :rules="accountRules"></v-text-field>
                                    <v-text-field append-icon="lock" name="password" label="密码" id="password"
                                        type="password" v-model="model.password" :rules="passwordRules"></v-text-field>
                                </v-form>
                            </v-card-text>
                            <div class="login-btn">
                                <v-btn icon>
                                    <v-icon color="blue">fa fa-facebook-square fa-lg</v-icon>
                                </v-btn>
                                <v-btn icon>
                                    <v-icon color="red">fa fa-google fa-lg</v-icon>
                                </v-btn>
                                <v-btn icon>
                                    <v-icon color="light-blue">fa fa-twitter fa-lg</v-icon>
                                </v-btn>
                                <v-spacer></v-spacer>
                                <v-btn block color="primary" @click="login" :loading="loading">登 录</v-btn>
                            </div>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-content>
    </v-app>

</template>


<script>
    import { mdiAccount } from '@mdi/js'
    export default {
        props: {
            source: String,
        },

        data: () => ({
            svgPath: mdiAccount,
            loading: false,
            model: {
                account: "admin",
                password: "123456"
            },

            accountRules: [
                v => !!v || '用户名不能为空',
            ],

            passwordRules: [
                v => !!v || '密码不能为空',
                v => (v && v.length >= 6) || '密码必须大于6位',
            ],
        }),

        methods: {
            login: function () {
                this.loading = true;

                this.$store.dispatch('LoginByAccount', {
                    account: this.model.account,
                    password: this.model.password,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.$toast.success('登录成功,正在获取用户数据.', { x:'center', y: 'top', timeout: 3000, showClose: true, });

                        this.$store.dispatch('GetUserInfo').then((data) => {
                            let cmp = this.$toast.getCmp();
                            cmp.close();

                            this.$toast.success('获取用户数据成功,正在进入首页.', { x:'center', y: 'top', timeout: 3000, showClose: true, });

                            setTimeout(() => { this.$router.push("/"); },500);

                        }).catch((error) => {
                            let cmp = this.$toast.getCmp();
                            if(cmp !== null)
                                cmp.close();

                            this.loading = false;
                            this.$toast.error('获取用户数据失败: ' + error.errormsg, { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                        });
                    } else {
                        //console.log(data);
                        this.loading = false;
                        this.$toast.error('登录失败,' + data.errormsg, { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    }

                }).catch((error) => {
                    //console.log(error);
                    this.loading = false;
                    this.$toast.error(error.message, { x:'center',  y: 'top', timeout: 3000, showClose: true, });

                });
            },
        },
    }
</script>

<style scoped>
    .split-bg {
        height: 50%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        content: "";
        z-index: 0;
        background-color: #3f51b5 !important;
    }
</style>