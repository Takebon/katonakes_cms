<template>
  <div id="login-overlay">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Log in</div>
      </q-card-section>

      <q-separator />
      <div class="q-gutter-y-md column" style="max-width: 300px">
        <q-input outlined v-model="email" filled label="email" :dense="dense" />
        <q-input
          outlined
          v-model="password"
          filled
          label="password"
          :dense="dense"
        />
      </div>
      <q-card-actions vertical>
        <q-btn color="primary" @click="login">OK</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import firebase from "firebase/app";
import { auth } from "../plugins/firebase";
export default {
  data() {
    return {
      email: "",
      password: "",
      dense: false
    };
  },
  methods: {
    login() {
      auth.signInWithEmailAndPassword(this.email, this.password).then(cred => {
        this.$store.commit('login')
        this.email = "";
        this.password = "";
      });
    }
  }
};
</script>

<style lang="scss" scoped>
#login-overlay {
  z-index: 10000000;
  position: absolute;
  width: 100%;
  height: calc(100vh - 50px);
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.my-card {
  width: 250px;
  padding: 0 15px;
  text-align: center;
}
</style>