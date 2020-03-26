<template>
    <v-layout row class="align-center layout px-4 pt-4 app--page-header">
        <div class="page-header-left">
            <h3 class="pr-3">{{ $route.meta.title || '' }}</h3>
        </div>
        <!-- <v-breadcrumbs divider="-" :items="breadcrumbs">
            <template v-slot:item="props">
                <v-breadcrumbs-item :href="props.item.href" :class="[props.item.disabled && 'disabled']"></v-breadcrumbs-item>
                {{ props.item.text}}
            </template>
        </v-breadcrumbs> -->
        <v-spacer></v-spacer>
        <div class="page-header-right">
            <v-btn icon>
                <v-icon class="text--secondary">refresh</v-icon>
            </v-btn>
        </div>
    </v-layout>
</template>

<script>
    export default {
        data() {
            return {
                title: "Home",
                breadcrumbs: [
                ]
            }
        },
        watch: {
            '$route.path': function (newVal) {
                this.computeBreadcrumbs()
            }
        },
        methods: {
            computeBreadcrumbs() {
                let breadcrumbs = [
                    {
                        text: "Home",
                        href: "/",
                        disabled: false
                    }
                ];
                let appends = []
                appends = this.$route.matched.map(item => {
                    return {
                        text: item.meta.title || "",
                        href: item.path || "/",
                        disabled: item.path === this.$route.path
                    }
                })
                this.breadcrumbs = breadcrumbs.concat(appends)
            }
        },
        created() {
            this.computeBreadcrumbs()
        }
    }
</script>
<style scoped>
    .disabled {
        color: grey;
        pointer-events: none;
        text-decoration: blink;
    }
</style>