<template>
<Teleport to=".MainDiv">
<div className="fixed bottom-0 w-11/12 h-content bg-black bg-opacity-20">
<div className="flex justify-center pt-16">
    <div class=" flex flex-col items-center bg-slate-100  shadow-xl lg:w-1/2 w-full pt-2 pl-16 pr-2 pb-8 rounded-xl">
        <div class="h-12 w-12 text-slate-500 hover:text-red-500 cursor-pointer ml-auto mr-0">
            <XCircleIcon @click="desactivate()" />
        </div>
    <h1 class="mt-4 text-3xl font-semibold">New Channel</h1>
    <div class="w-fit mt-4">
      <input type="text" v-model="newName" name="Name"
      placeholder="Choose a name" autocomplete="off" maxlength="16"
      class="w-full rounded-2xl px-3 placeholder-slate-500 text-slate-500
      focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500" @keyup.enter="createChannel()" />
    </div>
    <div class="w-fit mt-4">
      <select v-model="newType">
        <option disabled value="">Select a type</option>
        <option>public</option>
        <option>private</option>
        <option>protected</option>
      </select>
    </div>
    <div v-if="newType === 'protected'" class="w-fit mt-4">
      <input type="text" v-model="newPassword" name="Password"
      placeholder="Choose a password" autocomplete="off" maxlength="16"
      class="w-full rounded-2xl px-3 placeholder-slate-500 text-slate-500
      focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500" @keyup.enter="createChannel()" />
    </div>
    <div class="mt-4">
      <button @click="createChannel()"
      class="pl-1 pr-1 rounded-lg border-2 border-slate-600 hover:text-green-500
      hover:border-green-500">Create channel</button>
    </div>
    <div v-if="formInvalid" class="mt-4 text-red-500">
      <p>Invalid form</p>
    </div>
  </div>
  </div>
</div>
</Teleport>

</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
name: 'ChatNewChanModal',
props : {
    newChan:{type: Function,
    required: true}
},
data() {
    return {
      newName: '',
      newType: '',
      newPassword: '',
      formInvalid: false,
    };
  },
methods : {
    createChannel() {
      if (this.validateInput()) {
        this.newChan(this.newName, this.newType, this.newPassword)
        this.$emit("cancelForm");
      }
      else
        this.formInvalid = true;
    },
    validateType(type: string) {
      if (type === 'protected' && this.newPassword.length == 0)
        return false;
      return true;
    },
    validateInput() {
      return (
        this.newName.length > 0 && this.newType.length > 0
        && this.validateType(this.newType));
    },
    desactivate(){
        this.$emit("cancelForm");
    }
}
})
</script>

<style src="@/assets/tailwind.css" />