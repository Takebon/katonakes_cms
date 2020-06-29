<template>
  <div>
    <h6 class="title">{{ category.text.toUpperCase() }}</h6>
    <div class="category__grid">
      <categoryImage
        v-for="(image, index) in category.images"
        :key="index"
        :image="image"
        :id="fire_id"
        @deletImage="deletImage(image)"
        @moveImage="moveImage"
      ></categoryImage>
      <q-page-sticky position="top-right" :offset="[18, 18]" @click="back">
        <q-btn fab icon="keyboard_arrow_left" color="primary" />
        <q-tooltip
          content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
          anchor="bottom right"
          self="center right"
          >vissza</q-tooltip
        >
      </q-page-sticky>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn fab icon="add" color="primary" @click="$router.push(`/addphoto/${fire_id}`)"/>
        <q-tooltip
          content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
          anchor="top right"
          self="center right"
          >Új kép</q-tooltip
        >
      </q-page-sticky>
    </div>
  </div>
</template>

<script>
import categoryImage from "../components/categoryImage";
export default {
  data(){
    return {
      fire_id: this.$route.params.fire_id
    }
  },
  methods: {
    back() {
      this.$router.push("/");
    },
    async deletImage(image){
      const delImg = await this.$store.dispatch('deleteSingleImage', image)      
      const imageURLs = this.category.images.filter(img => img !== image)
      this.$store.dispatch('updateCategoryImages', {
        fire_id: this.fire_id,
        imageURLs: imageURLs
      })
    },
    moveImage(data) {      
      this.$store.dispatch('moveImage', {
        fromFire_id: this.category.fire_id,
        toFire_id: data.to_fire_id,
        image: data.image
      })
    }
  },
  computed: {
    category() {
      return this.$store.getters.getCategory(this.fire_id);
    }
  },
  components: {
    categoryImage
  }
};
</script>

<style lang="scss" scoped>
.category__grid {
  margin: 15px;
  display: grid;
  grid-gap: 15px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.title {
  text-align: center
};
</style>