import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import {
  getCookie,
  setAccessCookie,
  setRefreshCookie,
} from "@/frontJS/cookies";
import { AuthenticationApi } from "@/api";
import { OauthToken } from "@/api/models";

const routes: Array<RouteRecordRaw> = [
  {
    name: "log",
    path: "/",
    components: {
      log: () => import("@/views/logscreen.vue"),
    },
  },
  {
    name: "homePage",
    path: "/home",
    components: {
      default: () => import("@/views/Home.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Home",
        type: String,
      },
    },
  },
  {
    name: "homeInvite",
    path: "/home/:id",
    components: {
      default: () => import("@/views/Home.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Home",
        type: String,
      },
    },
  },

  {
    name: "watchPage",
    path: "/watch/:id",
    components: {
      default: () => import("@/views/Watch.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Watch",
        type: String,
      },
    },
  },
  {
    name: "accPage",
    path: "/user",
    components: {
      default: () => import("@/views/Account.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Account",
        type: String,
      },
    },
  },
  {
    name: "accQuery",
    path: "/user/:id",
    components: {
      default: () => import("@/views/AccountQuery.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Account",
        type: String,
      },
    },
  },
  {
    path: "/chat",
    components: {
      default: () => import("@/views/Chat.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Chat",
        type: String,
      },
    },
  },
  {
    path: "/friendList",
    name: "friendPage",
    components: {
      default: () => import("@/views/Friendlist.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Friendlist",
        type: String,
      },
    },
  },
  {
    path: "/spectate",
    name: "spectatePage",
    components: {
      default: () => import("@/views/Spectate.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Spectate",
        type: String,
      },
    },
  },
  {
    path: "/blocked",
    name: "blockedPage",
    components: {
      default: () => import("@/views/BlockList.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "BlockedList",
        type: String,
      },
    },
  },
  {
    path: "/param",
    name: "paramPage",
    components: {
      default: () => import("@/views/Param.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "parametres",
        type: String,
      },
    },
  },
  {
    path: "/callback",
    name: "callbackPage",
    components: {
      default: () => import("@/views/Callback.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "TokenLoading",
        type: String,
      },
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    components: {
      default: () => import("@/views/404.vue"),
      navbar: () => import("@/components/Nav.vue"),
      headbar: () => import("@/components/Header.vue"),
    },
    props: {
      headbar: {
        sectionTitle: "Cette page n'existe pas",
        type: String,
      },
    },
  },
];

const baseURL = process.env.NODE_ENV === "production" ? "/app" : "/";
const router = createRouter({
  history: createWebHistory(baseURL),
  routes,
});

router.beforeEach((to) => {
  const access = getCookie("trans_access");
  const refresh = getCookie("trans_refresh");
  const page = to.name == "callbackPage" || to.name == "log";

  if (!refresh && !page) {
    return { name: "log" };
  }
  if (!access && !page) {
    new AuthenticationApi()
      .refreshToken({
        refreshTokenRequest: { token: refresh },
      })
      .then((response: OauthToken) => {
        setAccessCookie(response.accessToken);
        setRefreshCookie(response.refreshToken);
      });
  }
});

export default router;
