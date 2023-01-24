<template>
	<div className="bg-slate-200 flex flex-row justify-between w-full h-full rounded-2xl">
		<div className="pl-4 h-full flex flex-col justify-center">
			<img :src="obj?.actualAvatar.path" className="h-5/6 rounded-xl" />
		</div>
		<div className="w-1/3 flex flex-row justify-between h-full">
			<div className="flex flex-col justify-center w-1/2">
				<span> {{ obj?.username }} </span>
			</div>
			<div className="flex flex-col justify-center w-1/2">
				<span v-if="(obj?.status === 'online')" className="text-green-500">En ligne</span>
				<span v-else-if="obj?.status === 'in_game'" className="text-red-400">En game</span>
				<span v-else className="text-slate-500">Disconnected</span>
			</div>
		</div>
		<div className="flex flex-row justify-around h-full w-1/3">
			<div className="icon w-1/5 mt-1 mb-1 mx-2">
				<div className="w-1/2">
					<PlayIcon @click="gameInvite()" />
				</div>
			</div>
			<div className="icon w-1/5 mt-1 mb-1 mx-2">
				<div className="w-1/2">
					<goToAcc :accName=obj?.login />
				</div>
			</div>
			<div className="icon w-1/5 mt-1 mb-1 mx-2">
				<div className="w-1/2">
					<goToChat @click="createDM()" :accName=obj?.login />
				</div>
			</div>
			<div className="icon w-1/5 mt-1 mb-1 mx-2">
				<div className="w-1/2">
					<goToWatch :accName=obj?.login />
				</div>
			</div>
			<div className="icon w-1/5 mt-1 mb-1 mx-2">
				<div className="w-1/2">
					<TrashIcon @click="del()" />
				</div>
			</div>
		</div>
	</div>
</template>
  
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import GoToAcc from './GoToAcc.vue';
import GoToChat from './GoToChat.vue';
import GoToWatch from './GoToWatch.vue';
import { FriendsApi, UserOutput, Configuration, ResponseError, ErrorOutput } from '@/api';
import { getCredentials } from "@/frontJS/cookies"
export default defineComponent({
	name: 'friendBox',
	props: {
		obj: { type: Object as PropType<UserOutput> },
		index: Number,
		// refresh: { type: Function, required:true }
	},
	components: {
		GoToAcc,
		GoToChat,
		GoToWatch
	},
	methods: {
		async createDM() {
			const requestOptions =
			{
				method: "POST",
				headers:
				{
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(
					{
						token: this.$cookies.get("trans_access"),
						login: this.obj?.login
					}
				)
			}
			await fetch(`http://${process.env.VUE_APP_IP}:3004/channel/direct_message`, requestOptions)
				.then(async response => {
					const data = await response.json();
					if (!response.ok) {
						const error = (data && data.message) || response.statusText;
						return Promise.reject(error);
					}
					this.$store.state.globalSocket.emit('preventUser', {msg: null, login: this.obj?.login});
					this.$store.dispatch('setCurrentChannel', data);
					this.$router.push('/chat');
				})
				.catch(e => {
					this.$toast(e, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
					return 0;
				})
		},
		async del() {
			getCredentials().then((accessToken: string) => {
				const Fapi = new FriendsApi(new Configuration({ accessToken: accessToken }))
				Fapi.deleteFriendship({ login: this.obj!.login })
					// .then(() => { this.obj!.login = ''; })
					// .then(() => { this.refresh() })
					.catch((msg: ResponseError) => {
						msg.response.json().then((str: ErrorOutput) =>
							this.$toast(str.message, {
								styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
							}));
					})
				this.$emit('delFriend', this.obj?.login);
			})
		},
		gameInvite() {
			this.createGame();
		},
		sendInvitation(gameCode: string) {
			// this.isInvite = true;
			const payload =
			{
				login: this.obj?.login,
				gameCode: gameCode
			}
			this.$store.state.globalSocket.emit('emitInvitation', payload);
		},
		async createGame() {
			const requestOptions =
			{
				method: "POST",
				headers:
				{
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(
					{
						token: this.$cookies.get("trans_access"),
						login: this.obj?.login,
						custom: false
					}
				)
			}
			await fetch(`http://${process.env.VUE_APP_IP}:3005/match/create`, requestOptions)
				.then(async res => {
					const data = await res.json()
					if (!res.ok) {
						const error = (data && data.message) || res.statusText;
						return Promise.reject(error);
					}
					this.sendInvitation(data.gameCode)
					this.$toast(`Invitation to play sent to ${this.obj?.login}`, { styles: { backgroundColor: "#16b918", color: "#FFFFFF" } });
				})
				.catch(error => {
					this.$toast(error, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
				});
		}
	},
})
</script>
  


<style src="../assets/tailwind.css" />