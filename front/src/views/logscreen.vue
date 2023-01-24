<template>
  <title>logScreen</title>
  <body class="bg-gray-900 text-white flex flex-col h-screen">
    <header class="border-b border-gray-800 shadow">
      <div class="p-4 mx-6 flex flex-1 flex-row items-center justify-center">
        <span class="text-sm font-bold self-center mt-2">FT_TRANSCENDENCE</span>
      </div>
    </header>
    <div class="grid place-items-center h-screen">
      <div class="mt-8 px-12 flex justify-center">
        <div class="max-w-screen-xl w-full xl:w-2/3 min-w-full md:min-w-0">
          <div class="mt-8 flex justify-center">
            <div class="w-full md:w-2/4 p-4">
              <div class="flex justify-center mt-4">
                <h1 class="font-bold">Welcome</h1>
              </div>
              <div class="flex justify-center mt-4">
                <a
                  @click="log()"
                  class="flex items-center button rounded focus:ring-0 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed px-4 py-1 text-white bg-gradient-to-r from-blue-500 to-green-500 shadow-sm hover:from-blue-600 hover:to-green-600"
                >
                  <svg
                    class="h-8 w-8"
                    fill="#ffffff"
                    version="1.1"
                    sodipodi:docname="42_logo.svg"
                    inkscape:version="0.48.2 r9819"
                    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                    xmlns:svg="http://www.w3.org/2000/svg"
                    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                    xmlns:dc="http://purl.org/dc/elements/1.1/"
                    xmlns:cc="http://creativecommons.org/ns#"
                    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 -200 960 960"
                    enable-background="new 0 -200 960 960"
                    xml:space="preserve"
                  >
                    <polygon
                      id="polygon5"
                      points="32,412.6 362.1,412.6 362.1,578 526.8,578 526.8,279.1 197.3,279.1 526.8,-51.1 362.1,-51.1   32,279.1 "
                    ></polygon>
                    <polygon
                      id="polygon7"
                      points="597.9,114.2 762.7,-51.1 597.9,-51.1 "
                    ></polygon>
                    <polygon
                      id="polygon9"
                      points="762.7,114.2 597.9,279.1 597.9,443.9 762.7,443.9 762.7,279.1 928,114.2 928,-51.1 762.7,-51.1 "
                    ></polygon>
                    <polygon
                      id="polygon11"
                      points="928,279.1 762.7,443.9 928,443.9 "
                    ></polygon>
                  </svg>
                  <h1 class="text-md">Connect</h1>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getCookie } from "@/frontJS/cookies";
export default defineComponent({
  name: "logScreen",
  created() {
    if (getCookie("trans_refresh")) {
      this.$router.push("/home");
    }
  },
  methods: {
    log() {
      location.href = process.env.VUE_APP_CALLBACK;
    },
  },
});
</script>
