<template>
	<div v-if="(loading == true)">
    	<loadingPage />
  	</div>
	  <div v-else-if="error" className="flex items-center w-full h-full">
		<errorPage :str="error" />
	</div>
	<div className="absolute flex flex-col justify-start items-center w-full h-full overflow-auto">
		<div className="w-3/4 pt-3 h-friendbox">
			<div className="flex flex-row justify-center w-full rounded-2xl h-full text-slate-500 focus-within:text-green-500 focus-within:outline-none">
				<input type="text" v-model="newblock" @keyup.enter="add()" name="search" placeholder="Bloquer un utilisateur" autocomplete="off" aria-label="Bloquer un utilisateur" className="rounded-2xl px-3 placeholder-slate-500 text-slate-500 focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500 w-1/2"/>
				<PaperAirplaneIcon @click="add()" />
			</div>
		</div>
		<div v-for="(item, index) in sortedTab()" v-bind:key="index" className="lg:h-friendbox h-12 w-3/4 pt-3">
			<!-- <blockBox :obj=item :index="index" :refresh="fetchData"/> -->
			<blockBox @delBlock="deleteBlock" :obj=item :index="index" />

		</div>
	</div>
  </template>

<script lang="ts">
import blockBox from '../components/BlockBox.vue';
import { defineComponent } from 'vue';
import { BlockedsApi, UserOutput, Configuration, ResponseError, ErrorOutput } from '@/api';
import { getCredentials } from "@/frontJS/cookies"
import  errorPage  from "@/components/Error.vue";
import  loadingPage  from "@/components/Loading.vue"

interface blockedData 
  {
	  tab: Array<UserOutput>;
	  loading: boolean;
	  newblock: string;
	  error: string;
  }

export default defineComponent({
	name: 'blockPage',
	data() : blockedData{
		  return {
			  tab: [],
			  loading : true,
			  newblock: '',
			  error: ''
		  }
	  },
	async mounted() {
		await this.fetchData();
	},
	components : {
        blockBox,
		errorPage,
	  loadingPage
	},
	methods : {
		deleteBlock(login: string)
		{
			let index = this.tab.findIndex((e) => e.login == login);
			if (index != -1)
				this.tab.splice(index, 1);
		},
		sortedTab() : Array<UserOutput>{
		  return this.tab.sort((a : UserOutput, b : UserOutput) =>  a.login.localeCompare(b.login)) // Number(a.friend) - Number(b.friend) ||
		  },
		  async add() {
			if (this.newblock.length > 0)
			{getCredentials().then((accessToken: string) => {
				  const Fapi = new BlockedsApi(new Configuration({accessToken: accessToken}))
				  Fapi.createBlockedship({login: this.newblock})
				  	  .then ((user: UserOutput) => { this.tab.push(user) })
					  .then( () => { this.newblock = '' })
					  .catch((msg:ResponseError) => { msg.response.json().then((str: ErrorOutput) =>
						  this.$toast(str.message, {
							styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
						  }));})
			  })}
		},
		async fetchData()
		{
		  this.loading = true;   
		  getCredentials().then((accessToken: string ) => {
			  const Fapi = new BlockedsApi(new Configuration({accessToken: accessToken}))
			  Fapi.listUsersBlockeds().then((user: Array<UserOutput> ) => { 
				this.tab = user;
				this.loading = false; 
			  })
			  .catch((msg : ResponseError) => { msg.response.json().then((str : ErrorOutput) => {this.error = str.message;});}
			  )})
		  
		}
	  }
	})
</script>
<style src="../assets/tailwind.css" />