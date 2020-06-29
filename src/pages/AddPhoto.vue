<template>
  <div class="addPhotoCard-wrapper">
    <h6>Kategória: {{ category.text.toUpperCase() }}</h6>
    <q-page-sticky
      position="top-right"
      :offset="[18, 18]"
      @click="$router.go(-1)"
    >
      <q-btn fab icon="keyboard_arrow_left" color="primary" />
      <q-tooltip
        content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
        anchor="bottom right"
        self="center right"
        >vissza</q-tooltip
      >
    </q-page-sticky>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="thumb_up"
        color="positive"
        v-if="!imagePreviewIsNotExist && !needCroppie"
        @click="upload"
      />
      <q-tooltip
        content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
        anchor="top right"
        self="center right"
        >Feltöltés</q-tooltip
      >
    </q-page-sticky>

    <q-card class="my-card">
      <q-card-section v-if="needCroppie">
        <div class="slider">
          <q-badge color="primary"> Quality: {{ quality }}% (20% to 100%) </q-badge>
          <q-slider v-model="quality" :min="20" :max="100" />
        </div>
        <q-page-sticky position="top-right" :offset="[18, 18]">
          <q-btn fab icon="thumb_up" color="positive" @click="crop" />
          <q-tooltip
            content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
            anchor="bottom left"
            self="center left"
            >OK!</q-tooltip
          >
        </q-page-sticky>
        <vue-croppie
          ref="croppieRef"
          :boundary="{ width: 1125 / 2, height: 832 / 2 }"
          :viewport="{ width: 1125 / 2 - 50, height: 832 / 2 - 50 }"
          :showZoomer="true"
          :enableResize="false"
        ></vue-croppie>
      </q-card-section>

      <q-card-section v-if="!needCroppie">
        <div
          id="drop-region"
          @click="fakeInput.click()"
          @dragover.prevent
          @dragenter.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
        >
          <div class="drop-message">
            Drag & Drop images or click to upload
          </div>
        </div>        
      </q-card-section>
      <div class="preview-container"></div>
    </q-card>
  </div>
</template>

<script>
import { randomStr } from "../helpers/randomStr";
export default {
  data() {
    return {
      fire_id: this.$route.params.fire_id,
      needCroppie: false,
      imagesToUpload: [],
      expectedWith: 1125,
      expectedHeight: 832,
      quality: 80
    };
  },
  computed: {
    fakeInput() {
      const fakeInput = document.createElement("input");
      fakeInput.type = "file";
      fakeInput.accept = "image/*";
      fakeInput.multiple = false;
      fakeInput.addEventListener("change", () => {
        this.handleFiles(fakeInput.files);
      });
      return fakeInput;
    },
    category() {
      return this.$store.getters.getCategory(this.fire_id);
    },
    imagePreviewIsNotExist() {
      return this.imagesToUpload.length == 0;
    }
  },
  methods: {
    handleDrop(e) {
      const data = e.dataTransfer;
      const files = data.files;
      if (files.length) {
        this.handleFiles(files);
      }
    },
    handleFiles(files) {
      for (let i = 0; i < files.length; i++) {
        if (this.validateImage(files[i])) {
          this.checkImageDimensions(files[i]);
        }
      }
    },
    validateImage(image) {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (validTypes.indexOf(image.type) === -1) {
        alert("Invalid File Type");
        return false;
      }
      const maxSizeInBytes = 20e6; // 20MB
      if (image.size > maxSizeInBytes) {
        alert("File too large");
        return false;
      }
      return true;
    },
    checkImageDimensions(file) {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.addEventListener("load", img => {
        if (
          // If size is correct
          this.validateImageDimensions(
            img.path[0].naturalWidth,
            img.path[0].naturalHeight
          )
        ) {
          const ext = file.type.split("/")[1];
          const name = `${randomStr(10)}.${ext}`;
          Object.defineProperty(file, "name", {
            writable: true,
            value: name
          });
          this.previewAnduploadImage(file);
        } else {
          // If need crop image
          this.needCroppie = true;
          const reader = new FileReader();
          reader.onload = e => {
            this.$refs.croppieRef.bind({
              url: e.target.result
            });
          };
          reader.readAsDataURL(file);
        }
      });
      image.src = url;
    },
    validateImageDimensions(width, height) {
      return width === this.expectedWith && height === this.expectedHeight;
    },
    crop() {
      const options = {
        type: "blob",
        format: "jpeg",
        size: { width: this.expectedWith, height: this.expectedHeight },
        quality: this.quality/100
      };
      this.$refs.croppieRef.result(options).then(blob => {
        const file = new File([blob], `${randomStr(10)}.jpeg`, {
          type: "image/jpeg"
        });
        this.needCroppie = false;
        this.previewAnduploadImage(file);
      });
    },
    previewAnduploadImage(file) {
      this.imagesToUpload.push(file);

      const reader = new FileReader();
      reader.onload = e => {
        const previewContainer = document.querySelector(".preview-container");
        const image = document.createElement("img");
        image.style.width = "100px";
        image.style.boxShadow = "2px 2px 4px rgba(0,0,0,.5)";
        image.style.borderRadius = "5px";
        image.className = "preview-container__img";
        previewContainer.appendChild(image);
        image.setAttribute("src", e.target.result);
      };
      reader.readAsDataURL(file);
    },
    upload() {
      this.$store.dispatch("uploadImages", {
        fire_id: this.fire_id,
        images: this.imagesToUpload
      });
      this.$router.push(`/category/${this.fire_id}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.addPhotoCard-wrapper {
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
}
.my-card {
  margin-top: 50px;
  width: calc(1165px / 2);
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
.preview-container {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, 1fr);
  margin: 10px;
}

#drop-region {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.3);
  width: calc(1125px / 5);
  height: calc(820px / 5);
  text-align: center;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drop-message {
  margin: 0 20px;
}
#drop-region:hover {
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
}

#preview-image {
  border-radius: 10px;
}
</style>