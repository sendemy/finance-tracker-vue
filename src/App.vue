<script setup lang="ts">
import ExampleComponent from './components/ExampleComponent.vue'
import Footer from './components/Footer.vue'
import Header from './components/Header.vue'
</script>

<template>
	<Header />

	<main>
		<RouterView />

		<ExampleComponent />
	</main>

	<Footer />
</template>
