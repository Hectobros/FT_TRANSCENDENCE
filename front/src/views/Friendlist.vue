<template>
	<div v-if="(loading == true)">
		<loadingPage />
	</div>
	<div v-else-if="error" className="flex items-center w-full h-full">
		<errorPage :str="error" />
	</div>
	<div v-else className="absolute flex flex-col justify-start items-center w-full h-full overflow-auto">
		<div className="w-3/4 pt-3 h-friendbox">
			<div
				className="flex flex-row justify-center w-full rounded-2xl h-full text-slate-500 focus-within:text-green-500 ">
				<input type="text" v-model="newfriend" @keyup.enter="add()" name="search" placeholder="Add a friend !"
					autocomplete="off" aria-label="Add a friend !"
					className="rounded-2xl px-3 placeholder-slate-500 text-slate-500 focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500 w-1/2" />
				<PaperAirplaneIcon @click="add()" className="cursor-pointer" />
			</div>
		</div>
		<div v-if="tab.length === 0">
			<div className="pt-20 flex flex-col justify-start items-center w-full h-full overflow-hidden">
				<img src="@/assets/nofriend.gif" className="object-scale-down h-44 w-44 rounded-xl"/>
            	<span className="text-slate-500 text-2xl pt-4" >No friends yet</span>
			</div>
		</div>
		<div v-else className="flex flex-col justify-start items-center w-full h-full overflow-auto">
			<div v-for="(item, index) in sortedTab()" v-bind:key="index"
			className="lg:h-friendbox lg:w-3/4 w-11/12 h-16 pt-3">
			<!-- <friendBox :obj=item :index="index" :refresh="fetchData" /> -->
			<friendBox @delFriend="deleteFriend" :obj=item :index="index" />
		</div>
		</div>
	</div>

</template>
  
<script lang="ts">
import friendBox from '../components/FriendBox.vue';
import { defineComponent } from 'vue'
import { FriendsApi, UserOutput, Configuration, ResponseError, ErrorOutput, UserOutputStatusEnum } from '@/api';
import { getCredentials } from "@/frontJS/cookies"
import errorPage from "@/components/Error.vue";
import loadingPage from "@/components/Loading.vue"
import { io, Socket } from "socket.io-client";

interface friendsData {
	tab: Array<UserOutput>;
	loading: boolean;
	newfriend: string;
	error: string;
	gameSocket: any,
}

interface Payload {
	login: string;
	status: UserOutputStatusEnum;
}

export default defineComponent({
	name: 'friendPage',
	data(): friendsData {
		return {
			tab: [],
			loading: true,
			newfriend: '',
			error: '',
			gameSocket: {},
		}
	},
	async mounted() {
		await this.fetchData()
	},
	components: {
		friendBox,
		errorPage,
		loadingPage
	},
	methods: {
		deleteFriend(login: string)
		{
			let index = this.tab.findIndex((e) => e.login == login);
			if (index != -1)
				this.tab.splice(index, 1);
		},
		sortedTab(): Array<UserOutput> {
			return this.tab.sort((a: UserOutput, b: UserOutput) => a.login.localeCompare(b.login)) // Number(a.friend) - Number(b.friend) ||
		},
		async add() {
			if (this.newfriend.length > 0)
			{
			getCredentials().then((accessToken: string) => {
				const Fapi = new FriendsApi(new Configuration({ accessToken: accessToken }))
				Fapi.createFriendship({ login: this.newfriend })
					.then( (user: UserOutput) => { this.tab.push(user)})
					.then(() => { this.newfriend = ''; })
					.catch((msg: ResponseError) => {
						msg.response.json().then((str: ErrorOutput) =>
							this.$toast(str.message, {
								styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
							}));
					})
			})}
		},
		async fetchData() {
			this.loading = true;
			getCredentials().then((accessToken: string) => {
				const Fapi = new FriendsApi(new Configuration({ accessToken: accessToken }))
				Fapi.listUsersFriends().then((user: Array<UserOutput>) => {
					this.tab = user
					this.loading = false;
				})
					.catch((msg: ResponseError) => { msg.response.json().then((str: ErrorOutput) => { this.error = str.message; }); }
					)
			})
		},
		updateFriendStatus(payload: Payload) {
			for (let user of this.tab) {
				if (user.login == payload.login)
					user.status = payload.status;
			}
			this.sortedTab();
		}
	},
	created() {
		const globalSocket = this.$store.state.globalSocket;
		globalSocket.on('userStatus', (payload: Payload) => {
			this.updateFriendStatus(payload);
		})
		const authPayload = { auth: { token: this.$cookies.get("trans_access") } };
		this.gameSocket = io("http://" + process.env.VUE_APP_IP + ":3005", authPayload);

		this.gameSocket.on('userStatus', (payload: Payload) => {
			this.updateFriendStatus(payload);
		})
	},
	unmounted() {
    	this.gameSocket.disconnect();
  	}
})
</script>
  




<style src="../assets/tailwind.css" />