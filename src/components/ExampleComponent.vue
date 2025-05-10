<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTransactionStore } from '../store/useTransactionsStore'

// сторы объявляются так
const transactionStore = useTransactionStore()

// из сторов можно забирать че угодно (обычно ток нужные методы/переменные)
const { transactions, totalBalance } = storeToRefs(transactionStore) // реактивные объекты (переменные)
const { addTransaction } = transactionStore // обычная четкая функция епть

// НЕ ПУТАТЬ! когда пишем код то обращаемся к реактивному значению с помощью .value, в то время как в шаблоне (html) это делается автоматически
console.log(totalBalance.value)

function addTestTransaction() {
	// юзаем как обычную функцию (она и есть такая)
	addTransaction({
		type: 'income',
		amount: 1000,
		categoryId: 'food',
		description: 'Test transaction',
	})
}
</script>

<template>
	<div>
		<h2>Test</h2>
		<button @click="addTestTransaction">Add test transaction</button>
		<div>Total Balance: {{ totalBalance }}</div>
		<div>
			<div v-for="(transaction, index) in transactions" :key="index">
				<p>{{ transaction.categoryId }}</p>
				<p>{{ transaction.amount }}</p>
				<p>{{ transaction.type }}</p>
			</div>
		</div>
	</div>
</template>
