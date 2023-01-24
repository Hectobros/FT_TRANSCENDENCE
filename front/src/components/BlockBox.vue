<template>
	<div className="bg-slate-200 flex flex-row justify-between w-full h-full rounded-2xl">
		<div className="pl-4 h-full flex flex-col justify-center bg-slate">
			<img :src="obj?.actualAvatar.path" className ="h-5/6 rounded-xl bg-slate-300"/>
		</div>
		<div className="flex flex-col justify-center w-1/3">
			<span> {{obj?.username}} </span>
		</div>
		<div className="flex flex-row justify-end w-1/3">
			<XMarkIcon @click="del()" class = "text-red-400 cursor-pointer"/>
		</div>
	</div>
</template>
  
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { BlockedsApi, UserOutput, Configuration, ResponseError, ErrorOutput } from '@/api';
import { getCredentials } from "@/frontJS/cookies"
export default defineComponent({
	name: 'BlockBox',
	props : {
		obj: {type: Object as PropType<UserOutput>},
		index: Number,
		// refresh: {type: Function, required: true}
	},
	methods: {
		async del() {
			getCredentials().then((accessToken: string) => {
				const Fapi = new BlockedsApi(new Configuration({accessToken: accessToken}))
				Fapi.deleteBlockedship({login:this.obj!.login})
					// .then(() => {this.obj!.login = '';})
					// .then(() => { })
					.catch((msg:ResponseError) => { msg.response.json().then((str: ErrorOutput) =>
						this.$toast(str.message, {
              			styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
            			}));})
				this.$emit('delBlock', this.obj?.login);
			})
		},
	},
})
</script>
  
  <style src="../assets/tailwind.css" />