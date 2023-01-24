<template>
	<div v-if="this.$route.name === 'log'" class="GlobalLoggin">
		<router-view name="log" />
	</div>
	<div v-else class="GlobalApp">
		<div className="fixed top-0 left-0 w-1/12 h-full">
			<router-view name="navbar" />
		</div>
		<div className="fixed top-0 right-0 w-11/12 h-headh">
			<router-view name="headbar" />
		</div>
		<div className="fixed bottom-0 right-0 w-11/12 h-content">
			<router-view :key="$route.path" />
		</div>
	</div>
	<div v-if="isInvite">
		<modalReception :senderLogin="senderLogin" :gameCode="code" :isactive=Invite />
	</div>
</template>
<script lang="ts">
interface appData {
	isInvite: boolean;
	senderLogin: string,
	code: string
}
import { defineComponent } from 'vue';
import modalReception from "@/components/modalReception.vue";
export default defineComponent({
	name: 'App',
	created() {
		let transAccessCookie = this.$cookies.get("trans_access");
		if (transAccessCookie) {
			// if (!this.$store.state.globalSocket.connected)
			this.$store.dispatch('setGlobalSocket', transAccessCookie);
			this.$store.state.globalSocket.on('globalError', (error: any) => {
				this.$toast(error, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
			})
			this.$store.state.globalSocket.on('globalMsg', (msg: any) => {
				this.$toast(msg, { styles: { backgroundColor: "#2E9AFE", color: "#FFFFFF" } });
			})
			this.$store.state.globalSocket.on('receiveInvitation', (payload: any) => {
				this.handleInvitation(payload);
			})
			this.$store.state.globalSocket.on('receiveResponse', (payload: any) => {
				this.handleResponse(payload);
			})
		}

	},
	watch: {
		'$store.state.callbackWatcher':
		{
			immediate: true,
			deep: true,
			handler() {
				if (this.$store.state.callbackWatcher != 0)
				{
					this.$store.state.globalSocket.on('globalError', (error: any) => {
						this.$toast(error, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
					})
					this.$store.state.globalSocket.on('globalMsg', (msg: any) => {
						this.$toast(msg, { styles: { backgroundColor: "#2E9AFE", color: "#FFFFFF" } });
					})
					this.$store.state.globalSocket.on('receiveInvitation', (payload: any) => {
						this.handleInvitation(payload);
					})
					this.$store.state.globalSocket.on('receiveResponse', (payload: any) => {
						this.handleResponse(payload);
					})
				}
			}
		}
	},
	components: {
		modalReception
	},
	data(): appData {
		return {
			isInvite: false,
			senderLogin: '',
			code: "",
		};
	},
	methods: {
		handleResponse(payload: any) {
			if (payload.accepted)
				this.$router.push('/home/' + payload.gameCode);
		},
		handleInvitation(payload: any) {
			this.senderLogin = payload.sender;
			this.code = payload.sentPaylod.gamecode;
			this.Invited();
		},
		Invite() {
			this.isInvite = false;
		},
		Invited() {
			this.isInvite = true;
		},
	}
})
</script>











<style src="./assets/tailwind.css" />
