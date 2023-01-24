<template>
  <div v-show="protected" class="h-full w-full">
    <ChatChanPass :Connect="joinChannel" :ChannelName="currentChan?.name" />
  </div>
  <div v-show="!protected" class="h-full w-full flex flex-row">
    <div class="h-full w-full flex flex-col divide-y-2">
      <div class="h-56 grow-0">
        <ChatChannelHeader :socket="socket" :currentUser="currentUser" :currentChan="currentChan"
        @toggleSettings="toggleSettings" @toggleInvite="toggleInvite" @quitChan="quitChan" />
      </div>
      <div class="flex h-8 grow flex-col ml-2 mr-2">
        <div class="grow h-8">
          <ChatMessagesList :socket="socket" :currentUser="currentUser" :currentChan="currentChan"
          @isProtected="protect" @isValidated="validate" :blockList="blockList"/>
        </div>
        <div class="grow-0 h-12 mb-2">
          <ChatMessageInput :socket="socket" :currentChan="currentChan" />
        </div>
      </div>
    </div>
    <div class="h-full w-1/5 text-slate-600 bg-gray-100 hidden lg:block">
      <ChatChannelUsersList :socket="socket" :currentUser="currentUser" :blockList="blockList" :currentChan="currentChan" />r
    </div>
  </div>
</template>

<script lang="ts">
import ChatMessagesList from "./ChatMessagesList.vue";
import ChatMessageInput from "./ChatMessageInput.vue";
import ChatChannelHeader from "./ChatChannelHeader.vue";
import ChatChannelUsersList from "./ChatChannelUsersList.vue";
import ChatChanPass from "./ChatChanPass.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChatChannelBox",
  props: {
    socket: Object,
    currentUser: Object,
    currentChan: Object,
    blockList: Object
  },
  components: {
    ChatMessagesList,
    ChatMessageInput,
    ChatChannelHeader,
    ChatChannelUsersList,
    ChatChanPass,
  },
  data() {
    return {
      protected: false,
    };
  },
  methods: {
    protect() {
      this.protected = true;
    },
    validate() {
      this.protected = false;
    },
    joinChannel(password: string) {
      this.socket?.emit('joinChannel', {id: this.currentChan?.id, password: password});
    },
    toggleSettings() {
      this.$emit('toggleSettings');
    },
    toggleInvite()
    {
      this.$emit('toggleInvite');
    },
    quitChan() {
      this.$emit('quitChan');
    }
  },
  created()
  {
    this.socket?.on('getCurrentChannel', (payload: any) => {
      this.$store.dispatch('setCurrentChannel', payload.channel);
    })
  }
});
</script>



<style src="../../assets/tailwind.css" />