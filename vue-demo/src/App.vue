<script setup>
import { watch, reactive } from 'vue';

const state = reactive({
	a: {},
	c: 4
})

watch(() => {
		console.log(state);
		return state.a;
	},
	(val) => {
		console.log('2');
	}
)

setTimeout(() => {
	state.c++;
})
</script>