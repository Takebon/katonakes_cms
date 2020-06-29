import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase/app";
import "firebase/storage";
import { db } from "../plugins/firebase";

Vue.use(Vuex);

export default function(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      loadedCategories: [],
      isLoggedIn: true,
      isLoading: false
    },
    mutations: {
      logout(state) {
        state.isLoggedIn = false
      },
      login(state) {
        state.isLoggedIn = true
      },
      setCategories(state, payload) {
        state.loadedCategories = payload;
      },
      addCategory(state, payload) {
        state.loadedCategories.push(payload);
      },
      updateCategoryImages(state, payload) {
        const category = state.loadedCategories.find(category => {
          return category.fire_id == payload.fire_id;
        });
        category.images = payload.imageURLs;
      },
      deleteCategory(state, id) {
        state.loadedCategories = state.loadedCategories.filter(
          category => category.fire_id !== id
        );
      },
      updateName(state, payload) {
        const category = state.loadedCategories.find(category => {
          return category.fire_id == payload.fire_id;
        });
        category.text = payload.text;
        category.id = payload.id;
      },
      cahngeCategoryImage(state, payload) {
        const category = state.loadedCategories.find(category => {
          return category.fire_id == payload.fire_id;
        });
        category.img = payload.img;
      }
    },
    actions: {
      loadCategories({ commit, state }) {
        state.isLoading = true;
        db.collection("thumbnails")
          .get()
          .then(snapshot => {
            let categories = [];
            snapshot.forEach(doc => {
              const category = {
                fire_id: doc.id,
                id: doc.data().id,
                text: doc.data().text,
                img: doc.data().img,
                images: doc.data().images
              };
              categories.push(category);
            });
            commit("setCategories", categories);
            state.isLoading = false;
          });
      },
      uploadCategory({ commit, state }, payload) {
        state.isLoading = true;
        const file = payload.img;
        const storageRef = firebase.storage().ref(`thumbnails/${file.name}`);
        const task = storageRef.put(file);
        task.on(
          "state_changed",
          function progress(snapshot) {
            let percentage =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          function error(err) {
            this.state.isLoading = false;
            console.log(err);
          },
          function complete() {
            task.snapshot.ref.getDownloadURL().then(downloadURL => {
              payload.img = downloadURL;
              db.collection("thumbnails")
                .add(payload)
                .then(res => {
                  const fire_id = res.id;
                  commit("addCategory", { ...payload, fire_id });
                  state.isLoading = false;
                });
            });
          }
        );
      },
      uploadImages({ commit, getters, dispatch, state }, payload) {
        state.isLoading = true;
        const fire_id = payload.fire_id;
        const images = payload.images;
        const categoryImages = getters.getCategory(fire_id).images;
        let imageURLs = [];
        firebase.storage().ref().constructor.prototype.putFiles = function(
          images
        ) {
          const ref = this;
          return Promise.all(
            Object.values(images).map(image => {
              const fileName = image.name;
              return ref.child(`thumbnails/${fileName}`).put(image);
            })
          );
        };
        firebase.storage().ref().constructor.prototype.getURLs = function(
          uploadedArr
        ) {
          const ref = this;
          return Promise.all(
            uploadedArr.map(item => {
              return ref.child(item.ref.fullPath).getDownloadURL();
            })
          );
        };
        firebase
          .storage()
          .ref()
          .putFiles(images)
          .then(resp => {
            firebase
              .storage()
              .ref()
              .getURLs(resp)
              .then(URLArr => {
                imageURLs = categoryImages.concat(URLArr);
                dispatch("updateCategoryImages", {
                  fire_id,
                  imageURLs
                });
                state.isLoading = false;
              });
          })
          .catch(err => {
            state.isLoading = false;
            console.log(err);
          });
      },
      deleteCategory({ commit, dispatch, state }, payload) {
        state.isLoading = true;
        dispatch("deleteSingleImage", payload.img);
        payload.images.forEach(image => {
          dispatch("deleteSingleImage", image);
        });
        db.collection("thumbnails")
          .doc(`${payload.fire_id}`)
          .delete()
          .then(() => {
            commit("deleteCategory", payload.fire_id);
            state.isLoading = false;
          })
          .catch(err => {
            state.isLoading = false;
            console.log(err);
          });
      },
      deleteSingleImage({ commit, state }, imageURL) {
        state.isLoading = true;
        const fileName = imageURL
          .split("?")[0]
          .split("%2F")
          .slice(-1)[0];
        const storageRef = firebase.storage().ref(`thumbnails/${fileName}`);
        return storageRef
          .delete()
          .then(() => {
            state.isLoading = false;
            return true;
          })
          .catch(err => {
            state.isLoading = false;
            console.log(err);
            return false;
          });
      },
      updateCategoryImages({ commit, state }, categoryData) {
        state.isLoading = true;
        const fire_id = categoryData.fire_id;
        const imageURLs = categoryData.imageURLs;
        db.collection("thumbnails")
          .doc(`${fire_id}`)
          .update({
            images: imageURLs
          });
        commit("updateCategoryImages", {
          fire_id,
          imageURLs
        });
        state.isLoading = false;
      },
      moveImage({ commit, getters, dispatch, state }, payload) {
        state.isLoading = true;
        const fromArr = getters
          .getCategory(payload.fromFire_id)
          .images.filter(img => img !== payload.image);
        const toArr = getters.getCategory(payload.toFire_id).images;
        toArr.push(payload.image);
        dispatch("updateCategoryImages", {
          fire_id: payload.fromFire_id,
          imageURLs: fromArr
        });
        dispatch("updateCategoryImages", {
          fire_id: payload.toFire_id,
          imageURLs: toArr
        });
        state.isLoading = false;
      },
      updateCategoryName({ commit, state }, payload) {
        state.isLoading = true;
        db.collection("thumbnails")
          .doc(`${payload.fire_id}`)
          .update({
            text: payload.text,
            id: payload.id
          })
          .catch(err => {
            console.log(err);
            return;
          });
        commit("updateName", payload);
        state.isLoading = false;
      },
      cahngeCategoryImage({ commit, dispatch, state }, payload) {
        state.isLoading = true;
        const file = payload.newImg;
        const storageRef = firebase.storage().ref(`thumbnails/${file.name}`);
        const task = storageRef.put(file);
        task.on(
          "state_changed",
          function progress(snapshot) {
            let percentage =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          },
          function error(err) {
            console.log(err);
          },
          function complete() {
            task.snapshot.ref.getDownloadURL().then(downloadURL => {
              db.collection("thumbnails")
                .doc(`${payload.fire_id}`)
                .update({
                  img: downloadURL
                });
              commit("cahngeCategoryImage", {
                fire_id: payload.fire_id,
                img: downloadURL
              });
              dispatch("deleteSingleImage", payload.oldImg);
              state.isLoading = false;
            });
          }
        );
      }
    },
    getters: {
      isLoggedIn(state) {
        return state.isLoggedIn;
      },
      getCategories(state) {
        return state.loadedCategories;
      },
      getCategory(state) {
        return fire_id => {
          return state.loadedCategories.find(category => {
            return category.fire_id == fire_id;
          });
        };
      }
    }
  });

  return Store;
}
