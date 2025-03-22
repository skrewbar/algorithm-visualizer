<template>
  <q-layout view="lHh Lpr lFf">
    <nav>
      <RouterLink to="/">홈</RouterLink>
      <RouterLink to="/topological-sort">위상정렬</RouterLink>
    </nav>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style lang="css" scoped>
nav {
  text-wrap: nowrap;

  display: flex;
  font-size: 2rem;
  text-align: center;

  margin: 0 auto;
  height: 10vh;

  justify-content: space-evenly;
  align-items: center;

  border-bottom: 1px solid;

  overflow-x: scroll;
}

nav a {
  color: var(--faint);
  transition: 0.4s;
  margin: 0 1rem;
}
nav a:hover {
  color: var(--primary);
}
nav a.router-link-exact-active {
  color: var(--primary);
}
</style>
