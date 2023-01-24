<template>
  <div @mouseover="showOptMenuButton" @mouseleave="hideOptMenuButton"
  class="flex flex-row w-full mt-2 pt-2 pb-2 pl-4 pr-4 bg-gray-50 hover:bg-gray-200">
    <img :src="message?.sender.avatar.path" @click="goProfile(message?.sender.login)"
    class="w-12 h-12 rounded-full cursor-pointer" />
    <div class="flex flex-col w-fit ml-2">
      <div class="flex flex-row w-full">
        <h1 @click="goProfile(message?.sender.login)" class="max-w-[95%] mr-3 font-semibold cursor-pointer break-all">
        {{ message?.sender?.userName }}</h1>
        <div v-if="message?.sender.login !== currentUser?.login" v-show="isOptMenuButtonVisible"
        class="ml-1">
          <UserOptionsMenu :socket="socket" :currentChan="getCurrentChan" :currentUser="getCurrentUser"
          :targetUser="getMessageAuthor" @toggle-opt-menu="switchOptMenuState" @hideMenu="hideMenu" :blockList="blockList"
          class="rounded-full bg-gray-300" />
        </div>
      </div>
      <p class="break-all">{{ message?.text }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UserOptionsMenu from "../UserOptionsMenu.vue";

interface DataI {
  isOptMenuButtonVisible: boolean,
  isOptMenuVisible: boolean,
}

export default defineComponent({
  name: "ChatMessagesList",
  props: {
    socket: Object,
    currentUser: Object,
    currentChan: Object,
    message: Object,
    blockList: Object
  },
  components: {
    UserOptionsMenu,
  },
  data(): DataI {
    return {
      isOptMenuButtonVisible: false,
      isOptMenuVisible: false,
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
    hideMenu() {
      this.isOptMenuButtonVisible = false;
      this.isOptMenuVisible = false;
    },
    goProfile(login: string) {
      if (login !== this.currentUser?.login)
        this.$router.push('/user/' + login);
      else
        this.$router.push('/user/');
    },
    isCurrentUser(user: any) {
      return(this.compareUsers(this.currentUser, user));
    },
  },
  computed: {
    getCurrentUser() {
      return (this.currentUser);
    },
    getMessageAuthor() {
      return (this.message?.sender);
    },
    getCurrentChan() {
      return (this.currentChan);
    },
  }
});
</script>



<style src="../../assets/tailwind.css" />