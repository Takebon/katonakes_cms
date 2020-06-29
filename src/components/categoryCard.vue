<template>
  <div class="grid-item">
    <q-card class="category-card">
      <q-img :src="category.img" class="img" @click="showCategory()">
        <div class="absolute-bottom">
          <div class="text-h6">{{ category.text }}</div>
        </div>
      </q-img>

      <q-card-actions>
        <q-btn flat round color="negative" size=".8rem">
          <q-icon name="delete" @click="categoryDelete"/>
          <q-tooltip
            content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
            anchor="bottom right"
            self="center right"
          >Kategória törlés</q-tooltip>
        </q-btn>
        <q-btn flat round color="positive" size=".8rem">
          <q-icon name="format_size" @click="dialog = true"/>
          <q-tooltip
            content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
            anchor="bottom right"
            self="center right"
          >Cím szerkesztés</q-tooltip>
        </q-btn>
        <q-btn flat round color="positive" size=".8rem">
          <q-icon name="wallpaper" @click="imageChangeDialog = true"/>
          <q-tooltip
            content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
            anchor="bottom right"
            self="center right"
          >Kép csere</q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Kategória új címe:</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="text" autofocus @keyup.enter="prompt = false" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Mégse" v-close-popup />
          <q-btn flat label="OK" v-close-popup @click="updateCategoryName"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="imageChangeDialog" persistent>
      <q-card style="min-width: 350px">
        <categoryImageChange :oldImage="category.img" @cahngeCategoryImage="cahngeCategoryImage"></categoryImageChange>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import categoryImageChange from './categoryImageChange'
import { englify } from "../helpers/englify";
export default {
  props: ['category'],
  data(){
    return {      
      dialog: false,
      imageChangeDialog: false,
      text: this.category.text,
      oldText: this.category.text
    }
  },
  components: {
  categoryImageChange
  },
  methods: {
    showCategory() {
      this.$emit('showCategory', this.category.fire_id)
    },
    categoryDelete(){
      if(confirm('Biztosan törlöd az egyész kategóriát mindenestül?')){
        this.$store.dispatch('deleteCategory', this.category)
      } else {        
        return
      }
    },
    updateCategoryName(){
      if(this.oldText === this.text) return
      this.$store.dispatch('updateCategoryName', {
        fire_id: this.category.fire_id,
        text: this.text,
        id: englify(this.text)
        })      
    },
    cahngeCategoryImage(data){
      if(data){
        this.$store.dispatch('cahngeCategoryImage', {
          newImg: data,
          oldImg: this.category.img,
          fire_id: this.category.fire_id
        })
      }      
    }
  }
};
</script>

<style>
.grid-item {
  width: 200px;
}
.img {
  cursor: pointer;
  height: 140px;
}
</style>