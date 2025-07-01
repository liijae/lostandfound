<template>
  <NavBar />
  <router-view />
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}
</style>