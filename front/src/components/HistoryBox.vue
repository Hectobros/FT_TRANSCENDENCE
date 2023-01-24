<template>
	<div :class="results === true ? 'bg-green-400' : 'bg-red-400'"
		class="flex flex-row justify-between w-full h-full rounded-2xl">
		<div className="pl-4 h-full flex flex-col justify-center grow-0">
			<img :src="obj.playerOne.avatar.path" className="h-20 w-20 rounded-xl hidden lg:block" />
		</div>
		<div className="lg:pl-4 flex flex-col justify-center overflow-hidden grow-0 ">
			<span className="font-bold center-x">{{ obj.playerOne.userName }} </span>
		</div>
		<div className="flex flex-col justify-center overflow-hidden grow ">
			<div className="hidden lg:block whitespace-nowrap">
				<span className="center-x inline"> {{ displayDate(obj.createdAt) }} </span>
			</div>
			<span className="font-bold center-x" v-if="obj.custom">🧨{{ obj.score1 }} - {{ obj.score2 }}🧨</span>
			<span className="font-bold center-x" v-else>{{ obj.score1 }} - {{ obj.score2 }}</span>
		</div>
		<div className="lg:pr-4 flex flex-col justify-center overflow-hidden grow-0">
			<span className="font-bold center-x">{{ obj.playerTwo.userName }} </span>
		</div>
		<div className="pr-4 h-full flex flex-col justify-center grow-0 ">
			<img :src="obj.playerTwo.avatar.path" className="h-20 w-20  rounded-xl hidden lg:block" />
		</div>
	</div>
</template>
  
<script lang="ts">
export default {
	name: 'historyBox',
	methods:
	{
		displayDate(date: string): string 
		{
			let time = new Date(date);
			let formatedDate = time.toLocaleString("en-GB");
			return formatedDate;
		}
	},
	props: {
		obj: {
			type: Object,
			required: true
		},
		index: {
			type: Number,
			required: true
		},
		results: {
			type: Boolean,
			required: true
		}
	}
}
</script>
  






<style src="../assets/tailwind.css" />