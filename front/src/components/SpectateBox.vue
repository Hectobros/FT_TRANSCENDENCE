<template>
	<div @click="spec()" className="bg-slate-200 flex flex-row justify-between w-auto h-48 rounded-2xl cursor-pointer border-2 hover:border-green-500">
		<div className="pl-4 flex flex-col justify-center ">
			<img :src="obj?.playerOne.avatar.path" className ="h-36 w-36 rounded-xl hidden lg:block"/>
		</div>
		<div className="flex flex-col justify-center overflow-hidden w-24 lg:w-64">
			<span className="font-bold center-x w-auto">{{obj?.playerOne.userName}} </span>
			<span className="center-x">Elo: {{obj?.playerOne.stats.level}} </span>
		</div>
		<div className="flex flex-col justify-center overflow-hidden w-24 lg:w-64">
			<span className="center-x" v-if="obj?.custom">🧨 [CUSTOM] 🧨</span>
			<span className="center-x">VS</span>
		</div>	
		<div className="flex flex-col justify-center overflow-hidden w-24 lg:w-64">
			<span className="font-bold center-x w-auto">{{obj?.playerTwo.userName}} </span>
			<span className="center-x">Elo: {{obj?.playerTwo.stats.level}} </span>
		</div>
		<div className="pr-4 flex flex-col justify-center ">
			<img :src="obj?.playerTwo.avatar.path" className ="h-36 w-36 rounded-xl hidden lg:block"/>
		</div>
	</div>
</template>
  
<script lang="ts">
import { defineComponent } from "vue"; 


export default defineComponent({
	name: 'spectateBox',
	props : {
		obj: {type: Object,
			required: true},
		index: {type : Number,
			required: true}
	},
	methods: {
		spec()
		{
			this.$router.push('/watch/' + this.obj?.playerOne.login);
		}
	},
  })
</script>
  
<style src="../assets/tailwind.css" />