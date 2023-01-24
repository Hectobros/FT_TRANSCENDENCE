<template>
  <div @mouseover="showOptMenuButton" @mouseleave="hideOptMenuButton"
  class="flex flex-row w-full mt-2 pt-2 pb-2 bg-inherit hover:bg-gray-300">
    <img :src="userChannel?.user.avatar.path" @click="goProfile(userChannel?.user.login)"
    class="w-12 h-12 rounded-full cursor-pointer" />
    <div class="flex flex-col ml-2">
      <h1 @click="goProfile(userChannel?.user.login)" class="font-semibold cursor-pointer break-all">
      {{ userChannel?.user.userName }}
      <span v-if="userChannel?.role==='owner'">👑</span>
      <span v-if="userChannel?.role==='admin'">★</span>
      <span v-if="userChannel?.muted">🔇</span>
      <span v-if="isBlocked(userChannel?.user.login)">🚫</span>
      </h1>
      <div v-if="userChannel?.user.login !== currentUser?.login" v-show="isOptMenuButtonVisible">
        <UserOptionsMenu :socket="socket" :currentChan="getCurrentChan" :currentUser="getCurrentUser"
        :targetUser="getUserChannel" :userChannels="userChannels" :userChannel="userChannel" :blockList="blockList" @toggle-opt-menu="switchOptMenuState"
        class="h-6 w-6 rounded-full bg-gray-400" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UserOptionsMenu from "../UserOptionsMenu.vue";

export default defineComponent({
  name: "ChatChannelUserBox",
  props: {
    socket: Object,
    currentUser: Object,
    currentChan: Object,
    userChannel: Object,
    userChannels: Object,
    blockList: Object
  },
  components: {
    UserOptionsMenu,
  },
  data() {
    return {
      isOptMenuButtonVisible: false,
      isOptMenuVisible: false,
    };
  },
  methods: {
    isBlocked(login: string)
    {
      if (this.blockList == null)
        return false;
      for (let j = 0; j < this.blockList.length; j++) {
        if (this.blockList[j]["blocked"].login == login)
          return true
      }
      return false;
    },
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
    showOptMenuButton() {
      this.isOptMenuButtonVisible = true;
    },
    hideOptMenuButton() {
      if (!this.isOptMenuVisible)
        this.isOptMenuButtonVisible = false;
    },
    switchOptMenuState() {
      this.isOptMenuVisible = !this.isOptMenuVisible;
    },
    goProfile(login: string) {
      if (login !== this.currentUser?.login)
        this.$router.push('/user/' + login);
      else
        this.$router.push('/user/');    },
    isCurrentUser(user: any) {
      return(this.compareUsers(this.currentUser, user));
    },
  },
  computed: {
    getCurrentUser() {
      return (this.currentUser);
    },
    getCurrentChan() {
      return (this.currentChan);
    },
    getUserChannel() {
      return (this.userChannel?.user);
    },
  }
});
</script>



<style src="../../assets/tailwind.css" />