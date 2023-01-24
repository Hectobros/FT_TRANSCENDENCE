<template>
  <div v-if="loading">
    <loadingPage />
  </div>
  <div v-else class="MainDiv h-full w-full flex flex-row">
    <div class="h-full w-1/6 text-slate-600 bg-gray-100 hidden lg:block">
      <ChatChannelsList :socket="socket" :currentUser="currentUser" :currentChan="currentChan"
      @selectedChannel="changeCurrentChannel" @showChanForm="showChanCreationForm" @showDMForm="showDMCreationForm" />
    </div>
    <div v-if="!currentChan"
      className="flex flex-col pt-32  justify-start items-center w-full h-full overflow-hidden">
      <img src="@/assets/nochan.gif" className="object-scale-down h-44 w-44 rounded-xl" />
      <span className="text-slate-500 text-2xl pt-4">No channel selected</span>
    </div>
    <!-- <div v-else-if="currentChan?.type === 'direct_message'" class="h-full w-5/6 bg-gray-50">
      <ChatDirectMessageBox :socket="socket" :currentChan="currentChan" @quitChan="quitChan" />
    </div> -->
    <div v-else class="h-full lg:w-5/6 w-full bg-gray-50">
      <ChatChannelBox :socket="socket" :currentUser="currentUser" :currentChan="currentChan" :blockList="blockList"
        @toggleSettings="showChannelSettings" @quitChan="quitChan" @toggleInvite="showChannelInvite" />
    </div>
  </div>
  <div v-if="currentChan && changingSett">
    <ChatSettingsModal :currentChan="currentChan" :updateChannel=updateChan @toggleSettings="showChannelSettings" />
  </div>
  <div v-if="currentChan && changingInvite">
    <ChatModalInvite :addUser="addUser" @toggleInvite="showChannelInvite"/>
  </div>
  <div v-if="creatingChan">
    <ChatNewChanModal :newChan="createChannel" @cancelForm="showChanCreationForm" />
  </div>
  <div v-if="creatingDM">
    <ChatNewDmModal :newDm="createDM" @cancelForm="showDMCreationForm"/>
  </div>
</template>

<script lang="ts">
import io from 'socket.io-client';
import ChatChannelsList from "../components/ChatComponent/ChatChannelsList.vue";
import ChatChannelBox from "../components/ChatComponent/ChatChannelBox.vue";
//import ChatDirectMessageBox from "../components/ChatComponent/ChatDirectMessageBox.vue";
//import ChatNewChannelForm from "../components/ChatComponent/ChatNewChannelForm.vue";
//import ChatNewDirectMessageForm from "../components/ChatComponent/ChatNewDirectMessageForm.vue";
//import ChatChannelSettings from "../components/ChatComponent/ChatChannelSettings.vue";
//import ChatChannelInvite from '@/components/ChatComponent/ChatChannelInvite.vue';
import { defineComponent } from "vue";
import { UsersApi, Configuration, UserOutput } from '@/api';
import { getCredentials } from "@/frontJS/cookies";
import loadingPage from "@/components/Loading.vue";
import ChatSettingsModal from "@/components/ChatComponent/ChatSettingsModal.vue";
import ChatModalInvite from "@/components/ChatComponent/ChatModalInvite.vue";
import ChatNewChanModal from "@/components/ChatComponent/ChatNewChanModal.vue";
import ChatNewDmModal from "@/components/ChatComponent/ChatNewDmModal.vue";

interface DataI {
  creatingChan: boolean,
  creatingDM: boolean,
  changingSett: boolean,
  changingInvite: boolean
  socket: any,
  currentChan: any,
  currentUser?: UserOutput,
  loading: boolean,
  blockList: any
}
export default defineComponent({
  name: "ChatPage",
  components: {
    ChatChannelsList,
    ChatChannelBox,
    //ChatDirectMessageBox,
    //ChatNewChannelForm,
    //ChatNewDirectMessageForm,
    //ChatChannelSettings,
    loadingPage,
    //ChatChannelInvite,
    ChatSettingsModal,
    ChatModalInvite,
    ChatNewChanModal,
    ChatNewDmModal
  },
  data(): DataI {
    return {
      creatingChan: false,
      creatingDM: false,
      changingSett: false,
      changingInvite: false,
      socket: null as any,
      currentChan: null as any,
      currentUser: undefined,
      loading: true,
      blockList: null as any
    };
  },
  methods: {
    changeCurrentChannel(channel: any) {
      this.currentChan = channel;
      this.changingSett = false;
      this.$store.dispatch('setCurrentChannel', channel);
    },
    showChanCreationForm() {
      this.creatingChan = !this.creatingChan;
    },
    showDMCreationForm() {
      this.creatingDM = !this.creatingDM;
    },
    showChannelSettings() {
      this.changingSett = !this.changingSett;
    },
    showChannelInvite() {
      this.changingInvite = !this.changingInvite;
    },
    quitChan() {
      this.currentChan = null;
      //window.location.reload();
    },
    async fetchData() {
      getCredentials().then((accessToken: string) => {
        const userAPI = new UsersApi(new Configuration({ accessToken: accessToken }))
        userAPI.getUserMe().then((user: UserOutput) => {
          this.currentUser = user;
          this.loading = false;
        })
      })
    },
    /* Channel Settings Functions */
    updateChan(newPass : string, newType: string) {
        const payload = newPass.length > 0 ?
        {
          id: this.currentChan?.id,
          password: newPass, 
          type: newType,
        }:
        {
          id: this.currentChan?.id,
          type: newType,
        }
        this.socket?.emit('updateChannel', payload);
    },
    /* Channel Invite */
    addUser(newUser : string) {
      const payload = 
      {
        userLogin: newUser,
        channelId: this.currentChan?.id
      }
      this.socket?.emit('inviteUser', payload);
    },
    /* Create Channel*/
    createChannel(newName : string, newType : string, newPassword: string) {
      const payload = newType != 'protected' ?
        {
          name: newName,
          type: newType,
        } :
        {
          name: newName,
          type: newType,
          password: newPassword
        };
      this.socket?.emit('createChannel', payload);
    },
    /* Create DM*/
    createDM(newUser : string) {
		  const payload =
		  {
			  login: newUser
		  }
      this.socket?.emit('directMessage', payload)
    }
  },
  async created() {
    await getCredentials().then((accessToken: string) => {
      const authPayload = { auth: { token: accessToken } };
      this.socket = io("http://" + process.env.VUE_APP_IP + ":3004", authPayload);
      this.socket.on('chatError', (error: any) => {
        this.$toast(error, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
      })
      this.socket.on('chatMsg', (error: any) => {
        this.$toast(error, { styles: { backgroundColor: "#16b918", color: "#FFFFFF" } });
      })
      this.socket.on('redirectChan', (payload: any) => {
        if (payload.channelFromId)
        {
          if(payload.channelFromId == this.currentChan?.id)
            this.changeCurrentChannel(payload.channel);
          return;
        }
        else
          this.changeCurrentChannel(payload.channel);
      })
      this.socket.on('updateUser', (payload: any) => {
        this.currentUser = payload.user;        
      })
      this.socket.on('updateBlockList', (payload: any) => {
        this.blockList = payload.blockList;
      })
    })
    this.currentChan = this.$store.state.currentChannel;
    this.fetchData();
  },
  unmounted() {
    this.socket.disconnect();
  },
})
</script>





<style src="../assets/tailwind.css" />