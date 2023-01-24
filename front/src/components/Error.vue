<template>
    <div className="h-full w-full flex flex-col justify-start items-center">
        <div className="flex flex-col justify-end pb-5 pt-5 overflow-hidden">
                <img src="@/assets/crying.gif" className="object-scale-down h-44 w-44 rounded-xl">
        </div>
        <p>Oh no!</p>
        <p>{{str}}</p>
    </div>
</template>

<script lang="ts">
export default {
    name: "errorPage",
    props: {
        str : {
            type: String
        }
    }
}
</script>

<style>

</style>