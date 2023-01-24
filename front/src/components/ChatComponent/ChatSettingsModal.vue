<template>

<Teleport to=".MainDiv">
<div className="fixed bottom-0 w-11/12 h-content bg-black bg-opacity-20">
<div className="flex justify-center pt-16">
    <div className =" flex flex-col items-center bg-slate-100  shadow-xl lg:w-1/2 w-full pt-2 pl-16 pr-2 pb-8 rounded-xl">
        <div class="h-12 w-12 text-slate-500 hover:text-red-500 cursor-pointer ml-auto mr-0">
            <XCircleIcon @click="desactivate()" />
        </div>
        <h1 class="mt-4 text-3xl font-semibold">Channel Settings</h1>
        <h1 class="mt-4 text-3xl font-semibold">#{{ currentChan?.name }}</h1>
        <!-- <div v-if="currentChan?.type === 'protected'" class="w-full mt-4 mb-8">
        <h2>Change password:</h2>
        <div class="w-full flex flex-row">
            <div class="w-fit mt-4">
            <input type="text" v-model="newPassword" name="Name" @keyup.enter="changePassword"
            placeholder="Choose a new password" autocomplete="off"
            class="w-full rounded-2xl px-3 placeholder-slate-500 text-slate-500
            focus-within:border-green-500 focus-within:outline-0 border-2 border-slate-500" />
            </div>
            <div class="w-12 flex justify-center mt-3 text-slate-500 hover:text-green-500 cursor-pointer">
            <ArrowRightCircleIcon class="h-10 w-10" @click.prevent="changePassword()" />
            </div>
        </div>
        </div> -->
        <div class="mt-4 mr-4">
            <h2>Channel settings:</h2>
        <div class="mt-4">
            <select v-model="newType">
            <option disabled value="">Select type</option>
            <option>public</option>
            <option>private</option>
            <option>protected</option>
            </select>
        </div>
        </div>
        <div v-if="newType === 'protected'" class="w-fit mt-4">
        <input type="text" v-model="newPassword" name="Password"
        placeholder="Choose a password" autocomplete="off"
        class="w-full rounded-2xl px-3 placeholder-slate-500 text-slate-500
        focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500" @keyup.enter="updateChan()"/>
        </div>
        <div class="mt-4">
        <button @click="updateChan()"
        class="pl-1 pr-1 rounded-lg border-2 border-slate-600 hover:text-green-500
        hover:border-green-500">Update Settings</button>
        </div>
    </div>
</div>
</div>
</Teleport>

</template>

<script>
export default {
name: 'chatSettingsModal',
props : {
    isactive: {type: Function},
    updateChannel:{type: Function},
    currentChan: Object,
},
data() {
    return {
      newPassword: '',
      newType: this.currentChan?.type,
    };
},
methods : {
    updateChan()
    {
        if (this.newType.length > 0 && !(this.newType === 'protected' && (this.newPassword.length == 0))) 
        {
            this.updateChannel(this.newPassword, this.newType);
        }
        this.$emit("toggleSettings");
    },
    desactivate(){
        this.$emit("toggleSettings");
    }
}
}
</script>

<style src="@/assets/tailwind.css" />