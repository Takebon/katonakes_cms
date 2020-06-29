<template>
  <div class="addCategoryCard-wrapper">
    <q-page-sticky position="top-right" :offset="[18, 18]" @click="back">
      <q-btn fab icon="keyboard_arrow_left" color="primary" />
      <q-tooltip
        content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
        anchor="bottom right"
        self="center right"
        >vissza</q-tooltip
      >
    </q-page-sticky>
    <q-card class="my-card">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          fab
          icon="thumb_up"
          color="positive"
          v-if="!imagePreviewIsNotExist && textIsExist"
          @click="upload"
        />
        <q-tooltip
          content-style="font-size: 12px; background-color: rgba(0,0,0,0.6)"
          anchor="top right"
          self="center right"
          >Feltöltés</q-tooltip
        >
      </q-page-sticky>

      <q-card-section>
        <q-input outlined v-model="text" label="Kategória neve:" />
      </q-card-section>
      <q-card-section v-if="needCroppie">
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
          :boundary="{ width: 400, height: 300 }"
          :viewport="{ width: 200, height: 148 }"
          :showZoomer="true"
          :enableResize="false"
        ></vue-croppie>
      </q-card-section>
      <q-card-section v-if="!needCroppie">
        <div
          id="drop-region" @click="fakeInput.click()"
          @dragover.prevent
          @dragenter.prevent
          @dragleave.prevent
          @drop.prevent="handleDrop"
        >
          <div class="drop-message" v-if="imagePreviewIsNotExist">
            Drag & Drop image or click to upload
          </div>
          <div id="preview-wrapper">
            <img id="preview-image" src v-if="!imagePreviewIsNotExist" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { randomStr } from "../helpers/randomStr";
import { englify } from "../helpers/englify";
export default {
  data() {
    return {
      text: "",
      needCroppie: false,
      expectedWith: 200,
      expectedHeight: 148,
      imagesToUpload: []
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
    imagePreviewIsNotExist() {
      return this.imagesToUpload.length == 0;
    },
    textIsExist() {
      return this.text !== "";
    },
    id() {
      return englify(this.text);
    }
  },
  methods: {
    back() {
      this.$router.push("/");
    },
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
          const name = `${randomStr(10)}_thumbnail.${ext}`;
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
        size: { width: this.expectedWith, height: this.expectedHeight }
      };
      this.$refs.croppieRef.result(options).then(blob => {
        const file = new File([blob], `${randomStr(10)}_thumbnail.jpg`, {type: 'image/jpeg'});
        this.needCroppie = false;
        this.previewAnduploadImage(file);
      });
    },
    previewAnduploadImage(file) {
      this.imagesToUpload = [file];
      const reader = new FileReader();
      reader.onload = e => {
        document
          .getElementById("preview-image")
          .setAttribute("src", e.target.result);
      };
      reader.readAsDataURL(file);
    },
    upload() {
      const data = {
        text: this.text,
        id: this.id,
        img: this.imagesToUpload[0],
        images: []
      };
      this.$store.dispatch("uploadCategory", data);
      this.$router.push("/");
    }
  }
};
</script>

<style lang="scss" scoped>
.addCategoryCard-wrapper {
  height: calc(100vh - 50px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.my-card {
  width: 400px;
  height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
#drop-region {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 4px 4px 16px rgba(0, 0, 0, 0.3);
  width: 250px;
  height: 200px;
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