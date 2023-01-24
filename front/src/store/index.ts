import Vuex from 'vuex';
import { createStore } from 'vuex';
import io from 'socket.io-client';

const hostIp = process.env.VUE_APP_IP;

export default createStore({
	state:
	{
		globalSocket: {},
		chatSocket: {},
		gameSocket: {},
		callbackWatcher: 0,
		currentChannel: null
	},
	mutations:
	{
		setCurrentChannel(state, channel) {
			state.currentChannel = channel;
		},

		setCallbackWatcher(state) {
			state.callbackWatcher++;
		},

		setGlobalSocket(state, authPayload) {
			state.globalSocket = io(`http://${hostIp}:3003`, authPayload);
		},
		
		setChatSocket(state, authPayload) {
			state.chatSocket = io(`http://${hostIp}:3004`, authPayload);
		},

		setGameSocket(state, authPayload) {
			state.gameSocket = io(`http://${hostIp}:3005`, authPayload);
		},

	},
	actions:
	{

		setCurrentChannel({commit, state}, channel)
		{
			commit('setCurrentChannel', channel);
		},

		setCallbackWatcher({commit, state})
		{
			commit('setCallbackWatcher');
		},

		setAllSockets({commit, state}, authToken)
		{
			const authPayload = { auth: { token: authToken} };
			commit('setGlobalSocket', authPayload);
			// commit('setChatSocket', authPayload);
			// commit('setGameSocket', authPayload);
		},
		setGlobalSocket({commit, state}, authToken)
		{
			const authPayload = { auth: { token: authToken} };
			commit('setGlobalSocket', authPayload);
		},
		setChatSocket({commit, state}, authToken)
		{
			const authPayload = { auth: { token: authToken} };
			commit('setChatSocket', authPayload);
		},
		setGameSocket({commit, state}, authToken)
		{
			const authPayload = { auth: { token: authToken} };
			commit('setGameSocket', authPayload);
		}
	}
})