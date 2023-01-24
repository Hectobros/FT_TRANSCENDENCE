<template>
    <ChatBubbleLeftEllipsisIcon className="cursor-pointer"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
    name: 'goToChat',
    props : {
        accName: String
    }
})
</script>
<style src="@/assets/tailwind.css" />