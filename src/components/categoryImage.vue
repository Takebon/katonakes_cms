<template>
  <div>
    <q-card class="my-card">
      <q-img :src="image"></q-img>

      <q-card-actions align="right">
        <q-btn flat round color="negative" size=".8rem">
          <q-icon name="delete" @click="deletImage" />
          <q-tooltip
            content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
            anchor="bottom right"
            self="center right"
            >Kép törlése</q-tooltip
          >
        </q-btn>
        <q-btn flat round color="positive" size=".8rem">
          <q-icon name="low_priority" />
          <q-tooltip
            content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
            anchor="bottom right"
            self="center right"
            >Kép áthelyezése</q-tooltip
          >
          <q-popup-proxy transition-show="flip-up" transition-hide="flip-down">
            <q-banner v-for="category in categories" :key="category.id">              
              <q-btn :disable="category.fire_id === id" color="primary" :label="category.text" @click="moveImage(category.fire_id)"/>
            </q-banner>
          </q-popup-proxy>
        </q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  props: ["image", "id"],
  methods: {
    deletImage() {
      if (confirm("Biztosan törlöd a képet?")) {
        this.$emit("deletImage");
      } else {
        return;
      }
    },
    moveImage(to_fire_id) {
      document.querySelector('.q-menu').style.visibility = "hidden"
      this.$emit("moveImage", {image: this.image, to_fire_id})
    }
  },
  computed: {
    categories() {
      return this.$store.getters.getCategories;
    }
  }
};
</script>

<style lang="scss" scoped>
.my-card {
  width: 200px;
  height: 200px;
}
</style>