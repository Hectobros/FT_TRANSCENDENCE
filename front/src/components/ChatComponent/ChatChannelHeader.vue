<template>
  <div class="h-full w-full flex flex-row">
    <div class="h-full w-full flex flex-col pt-2 pl-4 pr-4">
      <div class="mt-12 flex flex-row">
        <div class="h-12 w-12">
          <img :src="getImgUrl('Hashtag.png')" class="rounded-full" />
        </div>
        <h1 v-if="currentChan?.type === 'direct'" class="mt-2 text-3xl font-bold">{{ currentChan?.name.substring(1, currentChan?.name.length) }}</h1>
        <h1 v-else class="mt-2 text-3xl font-bold">{{ currentChan?.name }}</h1>
      </div>
      <div class="w-full flex mt-12 mb-2">
        <button @click="quitChannel()" class="pl-1 pr-1 rounded-lg border-2 border-slate-600 hover:text-red-500
        hover:border-red-500">Quit channel</button>
        <div v-if="isAdmin()" class="w-10 h-10 ml-16
        rounded-3xl bg-gray-100 text-gray-500 hover:text-black
        cursor-pointer shadow-lg">
          <Cog8ToothIcon @click="toggleSettings()" />
        </div>
        <div v-if="currentChan?.type != 'direct'" class="w-10 h-10 ml-16
        rounded-3xl bg-gray-100 text-gray-500 hover:text-black
        cursor-pointer shadow-lg">
          <PlusIcon @click="toggleInvite()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChatChannelHeader",
  props: {
    socket: Object,
    currentUser: Object,
    currentChan: Object,
  },
  data() {
    return {
      newPassword:'',
    };
  },
  methods: {
    getImgUrl(img: string) {
      return require('@/assets/' + img);
    },
    toggleSettings() {
      this.$emit('toggleSettings');
    },
    toggleInvite()
    {
      this.$emit('toggleInvite');
    },
    quitChannel() {
      this.socket?.emit('quitChannel', {id: this.currentChan?.id});
      this.$emit('quitChan');
    },
    setPassword() {
      this.newPassword = '';
    },
    getRole(login: string, chan: any): string {
      for (let j = 0; j < chan["userChannels"].length; j++) {
        if (chan["userChannels"][j].user.login == login)
          return chan["userChannels"][j].role;
      }
      return "undefined";
  },
  isAdmin() {
    if(this.currentChan?.type === "direct")
      return false;
    if (!this.currentChan?.creator)
      return true;
    if (this.currentChan?.creator.login === this.currentUser?.login)
      return true;
    if (this.getRole(this.currentUser?.login, this.currentChan) == 'owner' || this.getRole(this.currentUser?.login, this.currentChan) == 'admin' )
      return (true);
    return (false);
    }
  },
});
</script>



<style src="../../assets/tailwind.css" />
