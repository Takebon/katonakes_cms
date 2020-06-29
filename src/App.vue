<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
*,
  *::after,
  *::before {
    box-sizing: border-box;    
    margin: 0;
    padding: 0;    
  }

  #q-app {   
   background-color: antiquewhite;
   overflow-x: hidden;
 };
</style>