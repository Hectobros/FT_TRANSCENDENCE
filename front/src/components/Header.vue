<template>
	<div className = "h-full w-full shadow-lg text-xl text-black tracking-wider font-semibold text-opacity-80 flex justify-center items-center bg-white">
		<span># {{sectionTitle}}</span>
		<img @click="goLog()" className="fixed right-2 h-8 w-8 cursor-pointer" src="../assets/remove.png">
		<div className="fixed right-16 h-8 w-8 cursor-pointer">
			<ArrowPathIcon @click="refresh()"/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
props: {
	sectionTitle: String
},
methods : {
	goLog()
	{
		this.$cookies.remove("trans_access")
		this.$cookies.remove("trans_refresh")
		if(this.$store.state.globalSocket != null)
		{
			this.$store.state.globalSocket.disconnect();
		}
		// this.$store.state.chatSocket.disconnect();
		// this.$store.state.gameSocket.disconnect();
		this.$router.push('/');

	},
	refresh()
	{
		window.location.reload()
		//this.$forceUpdate();
	}
},
name : 'headBar'
})
</script>