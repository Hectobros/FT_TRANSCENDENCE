<template>
  <div @mouseleave="hideMenu" class="flex flex-row cursor-pointer">
    <Bars3Icon class="h-6 w-6 rounded-full" @click="toggleMenu" />
    <div class="relative">
      <ul v-if="showOptions" class="form-select form-select-sm appearance-none block w-20 absolute
        px-2 py-1 text-sm font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat
        border border-solid border-gray-300 rounded transition ease-in-out m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
        aria-label=".form-select-sm example">
        <li @click="goProfile(targetUser?.login)" class="hover:font-semibold cursor-pointer">Profile</li>
        <li @click="gameInvite" class="hover:font-semibold cursor-pointer">Play</li>
        <li v-if="!isBlocked(targetUser?.login)" @click="blockUser()" class="hover:font-semibold cursor-pointer">Block</li>
        <li v-else-if="isBlocked(targetUser?.login)" @click="unblockUser()" class="hover:font-semibold cursor-pointer">Unblock</li>

        <!-- <li v-if="canPromote" @click="promoteUser()" class="hover:font-semibold cursor-pointer">Promote</li> -->
        <li v-if="currentChan?.type != 'direct' && userChannel != undefined && CanMute()" @click="muteUser()" class="hover:font-semibold cursor-pointer">Mute</li>
        <li v-if="currentChan?.type != 'direct' && userChannel != undefined && CanUnMute()" @click="unmuteUser()" class="hover:font-semibold cursor-pointer">Unmute</li>
        <li v-if="currentChan?.type != 'direct' && userChannel != undefined && CanPromote()" @click="promoteUser()" class="hover:font-semibold cursor-pointer">Promote</li>
        <li v-if="currentChan?.type != 'direct' && userChannel != undefined && hasAuthorityOver()" @click="ActivateBan()" class="hover:font-semibold cursor-pointer">Ban</li>
        
        <!-- <li v-if="canPromote" @click="promoteUser()" class="hover:font-semibold cursor-pointer">Demote</li> -->
        
        <!-- <li v-else-if="canUnban" @click="unbanUser()" class="hover:font-semibold cursor-pointer">Unban</li> -->
        <!-- <li v-if="canMute" @click="muteUser()" class="hover:font-semibold cursor-pointer">Mute</li> -->
        <!-- <li v-else-if="canUnmute" @click="unmuteUser()" class="hover:font-semibold cursor-pointer">Unmute</li> -->
        
      </ul>
    </div>
  </div>
  <div v-if="isBan">
		<chatModal :isactive=DesactivateBan :target=targetUser :ban=banUser />
	</div>
</template>

<script lang="ts">
import { Bars3Icon } from "@heroicons/vue/24/outline";
import { defineComponent } from "vue";
import { decodePayload } from "engine.io-parser";
import  chatModal from "@/components/ChatComponent/ChatModal.vue"

interface DataI {
  showOptions: boolean;
  canBlock: boolean;
  canUnblock: boolean;
  canBan: boolean;
  canUnban: boolean;
  canMute: boolean;
  canUnmute: boolean;
  canPromote: boolean;
  isBan: boolean;
}

export default defineComponent(
{
  name: "UserOptionsMenu",
  props: {
    socket: Object,
    currentChan: Object,
    currentUser: Object,
    targetUser: Object,
    userChannel: {
      type: Object,
      default: undefined},
    userChannels: Object,
    blockList: Object
  },
  data(): DataI {
    return {
      showOptions: false,
      canBlock: false,
      canUnblock: false,
      canBan: false,
      canUnban: false,
      canMute: false,
      canUnmute: false,
      canPromote: false,
      isBan: false
    };
  },
  components: {
    chatModal
  },
  methods: {
    CanPromote()
    {
      if (this.getRole(this.currentUser?.login, this.currentChan) === "owner" &&  !(this.userChannel?.role === "admin" ))
        return true;
      return false;
    },
    CanMute()
    {
      if( !this.userChannel?.muted && this.hasAuthorityOver())
        return(true)
      return(false)
    },
    CanUnMute()
    {
      if( this.userChannel?.muted && this.hasAuthorityOver())
        return(true)
      return(false)
    },
    ActivateBan()
    {
      this.isBan = true;
    },
    DesactivateBan()
    {
      this.isBan = false;
    },
    toggleMenu() {
      this.showOptions = !this.showOptions;
      this.$emit('toggleOptMenu');
    },
    hideMenu() {
      this.showOptions = false;
      this.$emit('hideMenu');
    },
    goProfile(login: string) {
      if (login !== this.currentUser?.login)
        this.$router.push('/user/' + login);
      else
        this.$router.push('/user/');    },
    gameInvite() {
      this.createGame();
    },
    sendInvitation(gameCode: string) {
      // this.isInvite = true;
      const payload =
      {
        login: this.targetUser?.login,
        gameCode: gameCode
      }
      this.$store.state.globalSocket.emit('emitInvitation', payload);
    },
    async createGame()
    {
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
            login: this.targetUser?.login,
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
          this.$toast(`Invitation to play sent to ${this.targetUser?.login}`, { styles: { backgroundColor: "#16b918", color: "#FFFFFF" } });
        })
        .catch(error => {
          this.$toast(error, { styles: { backgroundColor: "#FF0000", color: "#FFFFFF" } });
        });
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
  getRole(login: string, chan: any): string {
    if(chan["userChannels"])
    {
      if (chan["creator"] && chan["creator"].login === login)
        return "owner";
      for (let j = 0; j < this.userChannels?.length; j++) {
        if (this.userChannels && this.userChannels[j].user.login == login)
          return this.userChannels[j].role;
    }
    }
    return "undefined";
  },
  compareUsers(user1: any, user2: any): boolean {
    if (user1?.length !== user2?.length || user1?.id !== user2?.id
      || user1?.login !== user2?.login)
      return (false);
    return (true);
  },

  hasAuthorityOver(): boolean {
    if (this.getRole(this.currentUser?.login, this.currentChan) === "owner" || (this.getRole(this.currentUser?.login, this.currentChan) === "admin"  && (!(this.getRole(this.targetUser?.login, this.currentChan) === "owner" ) || this.getRole(this.targetUser?.login, this.currentChan) === "admin" )))
      return (true);
    return (false);
  },
  isUserBlocked(): boolean {
    return (this.currentUser?.blockList?.includes(this.targetUser));
  },
  isUserBanned(): boolean {
    return (this.currentChan?.blockList?.includes(this.targetUser));
  },
  isUserMuted(): boolean {
    // return (userIdmuteList?.includes(this.targetUser));
    return true;
  },
  setCanBlock() {
    if (!this.isUserBlocked())
      this.canBlock = true;
    else
      this.canBlock = false;
  },
  setCanUnblock() {
    if (this.isUserBlocked())
      this.canUnblock = true;
    else
      this.canUnblock = false;
  },
  setCanMute() {
    if (this.getRole(this.currentUser?.login, this.currentChan) === "owner" &&  !(this.userChannel?.role === "admin" ))
    this.canMute = !this.userChannel?.muted;

    // if (!this.isUserMuted() && this.haveAuthorityOver())
    //   this.canMute = true;
    // else
    //   this.canMute = false;
  },
  setCanUnmute() {
    this.canUnmute = this.userChannel?.muted;

    // if (this.isUserMuted() && this.haveAuthorityOver())
    //   this.canUnmute = true;
    // else
    //   this.canUnmute = false;
  },
  setCanPromote() {

    if (this.getRole(this.currentUser?.login, this.currentChan) === "owner" &&  !(this.userChannel?.role === "admin" ))
      this.canPromote = true;
    else
      this.canPromote = false;
  },
  setAll() {
    this.setCanBlock();
    this.setCanUnblock();
    this.setCanMute();
    this.setCanUnmute();
    this.setCanPromote();
  },
  blockUser() {
    const payload =
    {
      login: this.targetUser?.login,
      channelId: this.currentChan?.id
    }
    this.socket?.emit('blockUser', payload);
    // if (!this.isUserBlocked())
    //   alert('user has been blocked'); // here, targetUser should be added to currentUser's blockList
    // this.setCanBlock();
    // this.setCanUnblock();
  },
  unblockUser() {
    const payload =
    {
      login: this.targetUser?.login,
      channelId: this.currentChan?.id
    }
    this.socket?.emit('unBlockUser', payload);
    // if (this.isUserBlocked())
    //   alert('user has been unblocked'); // here, targetUser should be removed from currentUser's blockList
    // this.setCanUnblock();
    // this.setCanBlock();
  },
  banUser(date : number)
  {
    const payload = date == 0 ?
    {
      userId: this.targetUser?.id,
      channelId: this.currentChan?.id
    } :
    {
      userId: this.targetUser?.id,
      channelId: this.currentChan?.id,
      expirationDate: date
    } 

    this.socket?.emit('kickUser', payload);
    // if (!this.isUserBanned() && this.haveAuthorityOver())
    //   alert('user has been banned');  // here, targetUser should be added to currentChan's blockList
    // this.setCanBan();
    // this.setCanUnban();
  },
  muteUser() {
    const payload =
    {
      userLogin: this.targetUser?.login,
      channelId: this.currentChan?.id,
      muted: true
    }
    this.socket?.emit('muteUser', payload);


    // if (!this.isUserMuted() && this.haveAuthorityOver())
    //   alert('user has been muted'); // here, targetUser should be added to currentChan's muteList
    // this.setCanMute();
    // this.setCanUnmute();
  },
  unmuteUser() {
    const payload =
    {
      userLogin: this.targetUser?.login,
      channelId: this.currentChan?.id,
      muted: false
    }
    this.socket?.emit('muteUser', payload);

    // if (this.isUserMuted() && this.haveAuthorityOver())
    //   alert('user has been unmuted'); // here, targetUser should be removed from currentChan's muteList
    // this.setCanUnmute();
    // this.setCanMute();  
  },
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
  promoteUser() {
  
    const payload =
    {
      userId: this.targetUser?.id,
      channelId: this.currentChan?.id,
      role: "admin"
    }
    this.socket?.emit('grantUser', payload);

    this.setCanPromote();
  },
},
  mounted() {this.setAll()},
  updated() {this.setAll()},

});
</script>









<style src="../assets/tailwind.css" />