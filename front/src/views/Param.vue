<template>
    <div class="flex flex-col h-full w-full overflow-auto">
        <div className="h-48 w-full flex flex-row">
            <div className="h-48 w-1/6 lg:w-1/5 flex justify-center items-center">
                <label class="toggler-wrapper style-1">
                    <input type="checkbox" v-model="twoFa">
                    <div class="toggler-slider">
                    <div class="toggler-knob"></div>
                </div>
                </label>
                <span className="ml-2">2FA</span>
            </div>
            <div className="h-48 w-3/6 lg:w-3/5 flex flex-col justify-center items-center  overflow-hidden">
                <span>Nom d'utilisateur actuel : {{ this.obj?.username }} </span>
                <input type="text" v-model="new_username" name="search" placeholder="Changer de nom d'utilisateur"
                    autocomplete="off" aria-label="Changer de nom d'utilisateur" maxlength="12"
                    className="rounded-2xl px-3 placeholder-slate-500 text-slate-500 focus-within:border-green-500 focus-within:outline-none border-2 border-slate-500 w-1/2" />
            </div>
            <div className="h-48 w-2/6 lg:w-1/5 flex justify-center items-center ">
                <button @click="update()"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Sauvegarder</button>
            </div>
        </div>
        <!-- <div className="h-50 w-full  ptb-3">
            <imageBox :current_obj="current_map" :obj="maps" :set_object="set_map"
                :declare_text="'Choose your map :'" />
        </div>
        <div className="h-50 w-full  ptb-3">
            <imageBox :current_obj="current_paddle" :obj="paddles" :set_object="set_paddle"
                :declare_text="'Choose your paddle :'" />
        </div> -->
        <div className="h-50 w-full ptb-3 flex flex-col justify-around">
            <div className="flex flex-row justify-center h-44">
                <div className="flex flex-col justify-center h-full">
                    <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg"
                        v-on:change="previewImage" />
                </div>
                <div classNme="flex flex-col justify-center h-full">
                    <div>
                        <img :src="obj?.actualAvatar.path"
                            class="h-36 w-36 border-4 bg-slate-200 rounded-xl border-green-600">
                    </div>
                </div>
				<div className="h-48 w-2/6 lg:w-1/5 flex justify-center items-center ">
					<button @click="updateAvatar()"
						className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
						Sauvegarder</button>
            	</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AvatarsApi, UsersApi, Configuration, UserOutput } from '@/api';
import { getCredentials } from "@/frontJS/cookies"
import { ResponseError, ErrorOutput, UserOutputStatusEnum } from '@/api';



interface paramReturn {
    obj?: UserOutput;
    file: any;
    new_username: string;
    twoFa: boolean;
    current_map: number;
    current_paddle: number;
    maps: Array<string>;
    paddles: Array<string>;
}

export default defineComponent({
    name: 'paramPage',
    data(): paramReturn {
        return {
            obj: undefined,
            file: null,
            new_username: '',
            twoFa: false,
            current_map: 1,
            current_paddle: 1,
            maps: ['map1.jpeg', 'map2.jpeg', 'map3.jpeg', 'map4.jpeg'],
            paddles: ['pad1.jpeg', 'pad2.jpeg', 'pad3.jpeg', 'pad4.jpeg']
        }
    },
    methods: {
        async update() {
            getCredentials().then((accessToken: string) => {
                const Uapi = new UsersApi(new Configuration({ accessToken: accessToken }))
                Uapi.userPartialUpdate({ userPartialUpdateRequest: { username: this.new_username, twoFa: this.twoFa } })
                    .then(() => { this.fetchData(); })
                    .then(() => {this.$toast("Settings updated !", {styles: { backgroundColor: "#16b918", color: "#FFFFFF" }}) })
                    .catch((msg: ResponseError) => {
                        msg.response.json().then((str: ErrorOutput) =>
                            this.$toast(str.message, {
                                styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
                            }));
                    })
            });    
        },
		async updateAvatar() {
            if (this.file)
            {
            getCredentials().then((accessToken: string) => {
                const Aapi = new AvatarsApi(new Configuration({ accessToken: accessToken }))
                Aapi.uploadUserAvatar({ file: this.file })
                    .then(() => { this.fetchData(); })
                    .then(() => { this.$toast("Avatar updated !", { styles: { backgroundColor: "#16b918", color: "#FFFFFF" } }) })
                    .catch((msg: ResponseError) => {
                        msg.response.json().then((str: ErrorOutput) =>
                            this.$toast(str.message, {
                                styles: { backgroundColor: "#FF0000", color: "#FFFFFF" },
                            }));
                    })
            });
            }
        },
		
        set_map(num: number) {
            this.current_map = num;
        },
        set_paddle(num: number) {
            this.current_paddle = num;
        },
        send() {
            // alert("New Username: " + this.new_username + " New map: " + this.current_map);
            // this.new_username = '';
            this.update()
        },
        getImgUrl: function (img: string): any {
            return require(img);
        },
        fileToBlob: function(file: File): Blob {
            return new Blob([file], { type: file.type });
        },
        previewImage: function (event: any): any {
            // Reference to the DOM input element
            var input = event.target;
            // Ensure that you have a file before attempting to read it
            if (input.files && input.files[0]) {
                this.file = this.fileToBlob(input.files[0]);
                // create a new FileReader to read this image and convert to base64 format
                var reader = new FileReader();
                // Define a callback function to run, when FileReader finishes its job
                reader.onload = (e: any) => {
                    // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
                    // Read image as base64 and set to imageData
                    this.obj!.actualAvatar.path = e.target.result;
                }
                // Start the reader job - read file as a data url (base64 format)
                reader.readAsDataURL(input.files[0]);
            }
        },
        async fetchData() {
            getCredentials().then((accessToken: string) => {
                const userAPI = new UsersApi(new Configuration({ accessToken: accessToken }))
                userAPI.getUserMe().then((user: UserOutput) => {
                    this.obj = user
                    this.twoFa = user.twoFa;
                    this.new_username = user.username;
                })
            })
            
            
        }
    },/*
    components: {
        imageBox
    },*/
    async created() {
        await this.fetchData();
    }
})
</script>



<style>
@import "../assets/tailwind.css";
@import "../assets/css/checkbox.css";
</style>