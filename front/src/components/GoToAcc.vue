<template>
    <UserIcon @click="goToProfile()" className="cursor-pointer"/>
</template>

<script lang="ts">
//mettre en ts normalement c bon
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'goToAcc',
    props : {
        accName: String
    },
    methods : {
        goToProfile() {
            if (this.accName)
                this.$router.push('/user/' + this.accName);
            else
                this.$router.push('/user');
        }
    }
})
</script>
<style src="@/assets/tailwind.css" />