<template>
  <q-layout>
    <q-header elevated>
      <q-toolbar class="text-white q-electron-drag">
        <q-toolbar-title>
          <img id="katona-logo" src="~assets/katonaLogo.svg" />
        </q-toolbar-title>
        <q-btn
          v-if="isLoggedIn"
          outline
          
          dense
          label="Logout"
          @click="logout"
        />
        <q-btn dense flat icon="minimize" @click="minimize" />
        <q-btn dense flat icon="crop_square" @click="maximize" />
        <q-btn dense flat icon="close" @click="close" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <loginForm v-if="!isLoggedIn"></loginForm>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import firebase from "firebase/app";
import { auth } from "../plugins/firebase";
import loginForm from "../components/loginForm";
export default {
  name: "MainLayout",
  data() {
    return {};
  },
  methods: {
    logout() {
      auth.signOut().then(() => {
        this.$store.commit("logout");
        console.log("logged out");
      });
    },
    minimize() {
      if (process.env.MODE === "electron") {
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().minimize();
      }
    },

    maximize() {
      if (process.env.MODE === "electron") {
        const win = this.$q.electron.remote.BrowserWindow.getFocusedWindow();

        if (win.isMaximized()) {
          win.unmaximize();
        } else {
          win.maximize();
        }
      }
    },
    close() {
      if (process.env.MODE === "electron") {
        console.log('hello')
        this.$q.electron.remote.BrowserWindow.getFocusedWindow().close();
      }
    }
  },
  components: {
    loginForm
  },
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
    isLoggedIn() {
      return this.$store.state.isLoggedIn;
    }
  },
  watch: {
    isLoading(val) {
      if (val) {
        this.$q.loading.show();
      } else {
        this.$q.loading.hide();
      }
    }
  },
  created() {
    auth.onAuthStateChanged(user => {
      if (user) {
        this.$store.commit("login");
      } else {
        this.$store.commit("logout");
      }
    });
  }
};
</script>

<style lang="scss" scoped>
#katona-logo {
  height: 40px;
}
</style>
