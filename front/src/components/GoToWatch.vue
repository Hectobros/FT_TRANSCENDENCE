<template>
    <EyeIcon @click="goToWatch()" className="cursor-pointer"/>
</template>

<script lang="ts">
//mettre en ts normalement c bon
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'goToWatch',
    props : {
        accName: String
    },
    methods : {
        goToWatch() {
            if (this.accName)
                this.$router.push('/watch/' + this.accName);
            else
                this.$router.push('/spectate');
        }
    }
})
</script>
<style src="@/assets/tailwind.css" />