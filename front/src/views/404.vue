<template>
	<div className="flex flex-col justify-start items-center w-full h-full overflow-auto">
		<img src="@/assets/404soob-pepe.gif" className="pt-32 object-scale-down h-56 w-56 lg:h-80 lg:w-80"/>
		<span className ="center-x pt-8 text-slate-500 text-2xl">404 Not found</span>
	</div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'Error_404'
})
</script>

<style src="@/assets/tailwind.css" />
