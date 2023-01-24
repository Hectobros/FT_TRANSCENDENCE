<template>
  <div class="h-full w-full pl-2 pr-2">
    <h1 class="mt-3 font-bold">CHANNEL MEMBERS</h1>
    <div class="h-full overflow-auto">
      <ul>
        <li v-for="userChannel in userchannels" :key="userChannel.id">
          <div class="hover:text-black">
            <ChatChannelUserBox :socket="socket" :currentUser="currentUser"
            :currentChan="currentChan" :userChannels="userchannels" :userChannel="userChannel" :blockList="blockList" />
          </div>
        </li>

		<!-- <li v-for="userchan in userchannels" :key="userchan.id">
			<div>{{userchan.user.login}} ({{userchan.role}})</div>
    </li> -->
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ChatChannelUserBox from "./ChatChannelUserBox.vue";

interface DataI {
  userchannels: any[],
}

export default defineComponent({
  name: "ChatChannelUsersList",
  props: {
    socket: Object,
    currentUser: Object,
    currentChan: Object,
    blockList: Object
  },
  components: {
    ChatChannelUserBox,
  },
  data(): DataI {
    return {
      userchannels: [], //this.currentChan?.userList,
    };
  },
  methods: {
    compareArrays(arr1: any[], arr2: any[]): boolean {
      let i = arr1?.length;
      if (i !== arr2?.length)
        return (false);
      while (i) {
        if (arr1[i] !== arr2[i])
          return (false);
        --i;
      }
      return (true);
    },
    compareUsers(user1: any, user2: any): boolean {
      if (user1?.length !== user2?.length || user1?.id !== user2?.id
          || user1?.login !== user2?.login)
        return (false);
      return (true);
    },
	handleChanUsersList(payload: any)
	{
		if (payload.channelId != this.currentChan?.id)
			return;
		this.userchannels = [];
		this.userchannels = payload.userchannels
    if(this.userchannels.length > 0)
    {
      this.userchannels = this.userchannels.sort(function (a: any, b: any) {
        return a.id - b.id;
      });
    }
	}
  },
  created()
  {
	this.socket?.on('channelUsersToClient', (payload: any) => {
            this.handleChanUsersList(payload)
    })
    this.socket?.emit('getChannelUsers', {id: this.currentChan?.id, password: null});
    
  },
  watch: {
    currentChan: {
        immediate: true, 
        deep: true, 
        handler(newVal, old)
        {
          this.userchannels = [];
          this.socket?.emit('getChannelUsers', {id: this.currentChan?.id, password: null});
        },  
    }
  }
});
</script>



<style src="../../assets/tailwind.css" />