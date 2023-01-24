<template>
  <div id ="messagesList" class="h-full w-full overflow-auto pt-3">
    <ul>
      <li v-for="message in messages" :key="message.id">
        <ChatMessageBox :socket="socket" :currentChan="currentChan"
        :currentUser="currentUser" :blockList="blockList" :message="message" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ChatMessageBox from "./ChatMessageBox.vue";



export default defineComponent({
  name: "ChatMessagesList",
  props: {
    socket: Object,
    currentUser: Object,
    currentChan: Object,
    blockList: Object,
  },
  components: {
    ChatMessageBox,
  },
  data() {
    return {
      locked: false as boolean,
      messages: [] as any[],
      password: null
    };
  },
  methods:
  {
    handleChanConnection(payload: any)
    {
      if (payload.channelId != this.currentChan?.id)
        return;
      this.locked =  payload.locked;
      if (this.locked === false)
        this.$emit('isValidated');
      this.messages = [];
      if (payload.messages.length > 0) {
        this.messages = payload.messages.reverse();
        this.messages = this.messages.sort(function (a: any, b: any) {
          return a.id - b.id;
        });
      }
    },
    receiveMessage(message: any)
    {
      if (this.locked)
        return;
      if (message.channel.id == this.currentChan?.id)
        this.messages.push(message);
    },
    isUserMember() {
      let i = this.currentChan?.userChannels.length;
      i--;
      while (i >= 0) {
        if (this.currentChan?.userChannels[i].user.login === this.currentUser?.login)
          return (true);
        --i;
      }
      return (false);
    },
    scrollToEnd() {
      var objDiv = document.getElementById("messagesList");
        if (objDiv)
          objDiv.scrollTop = objDiv.scrollHeight;
    },
  },
  updated() {
    this.scrollToEnd();
  },
  mounted()
  {
    // this.socket?.emit('joinChannel', {id: this.currentChan?.id, password: this.password});
    this.socket?.on('allChanMessagesToClient', (payload: any) => {
        this.handleChanConnection(payload)
    })
    this.socket?.on('msgToChannel', (message: any) => {
        this.receiveMessage(message)
    })
    this.scrollToEnd();
  },
  beforeUnmount() {
    this.socket?.off('allChanMessagesToClient');
    this.socket?.off('msgToChannel');
  },
  watch: {
    currentChan: {
        immediate: true, 
        deep: true, 
        handler(newVal, old)
        {
          this.messages = [];
          if (this.currentChan?.type === 'protected' && !this.isUserMember()) //rajouter une condition
            this.$emit('isProtected');
          else {
            this.socket?.emit('joinChannel', {id: this.currentChan?.id, password: this.password}); 
          }        
        },
    }
  }
});
</script>



<style src="../../assets/tailwind.css" />