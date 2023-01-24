<template>

<Teleport to=".MainDiv">
<div className="fixed bottom-0 w-11/12 h-content bg-black bg-opacity-20">
<div className="flex justify-center pt-16">
    <div className =" flex flex-col items-center bg-slate-100  shadow-xl lg:w-1/2 w-full pt-2 pl-16 pr-2 pb-8 rounded-xl">
        <div class="h-12 w-12 text-slate-500 hover:text-red-500 cursor-pointer ml-auto mr-0">
            <XCircleIcon @click="desactivate()" />
        </div>
    <h1 class="mt-4 text-3xl font-semibold">Invite new users!</h1>
    <div class="w-full mt-4 mb-8">
        <div class="w-full flex mt-8 flex-row justify-center">
        <div class="w-fit mt-4">
          <input type="text" v-model="newUser" name="Name" @keyup.enter="inviteUser()"
          placeholder="His 42 Login" autocomplete="off"
          class="w-full rounded-2xl px-3 placeholder-slate-500 text-slate-500
          focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500" />
        </div>
        <div class="w-12 flex justify-center mt-3 text-slate-500 hover:text-green-500 cursor-pointer">
          <ArrowRightCircleIcon class="h-10 w-10" @click.prevent="inviteUser()" />
        </div>
        </div>
  </div>
  </div>
</div>
</div>
</Teleport>

</template>

<script>
export default {
name: 'chatModalInvite',
props : {
    addUser:{type: Function}
},
data() {
    return {
        newUser: '',
    };
},
methods : {
    inviteUser()
    {
        if (this.newUser.length > 0) 
        {
            this.addUser(this.newUser);
        }
        this.newUser = '';
    },
    desactivate(){
        this.$emit("toggleInvite");
    }
}
}
</script>

<style src="@/assets/tailwind.css" />