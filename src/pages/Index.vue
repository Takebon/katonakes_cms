<template>
  <div>
    <h6 class="title">KATEGÓRIÁK</h6>
    <div class="showcase">
      <categoryCard
        v-for="category in categories"
        :key="category.id"
        :category="category"
        @showCategory="showCategory($event)"
      ></categoryCard>

      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" @click="addCategory" />
        <q-tooltip
          content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
          anchor="top right"
          self="center right"
          >Új kategoria</q-tooltip
        >
      </q-page-sticky>
    </div>
  </div>
</template>

<script>
import categoryCard from "../components/categoryCard";
export default {
  name: "PageIndex",
  components: {
    categoryCard
  },
  data() {
    return {};
  },
  methods: {
    showCategory(fire_id) {
      this.$router.push(`/category/${fire_id}`);
    },
    addCategory() {
      this.$router.push("/addcategory");
    }
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    categories() {
      return this.$store.getters.getCategories;
    }
  }
};
</script>

<style lang="scss">
.showcase {
  margin: 15px;
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.title {
  text-align: center;
}
</style>
