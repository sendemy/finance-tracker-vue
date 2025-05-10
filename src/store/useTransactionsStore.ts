// stores/useTransactionStore.ts
import { DateTime } from 'luxon'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { DEFAULT_CATEGORIES } from '../constants/categories'
import type { Transaction, TransactionType } from '../types/transaction'
import { useBudgetStore } from './useBudgetStore'

export const useTransactionStore = defineStore('transaction', () => {
	const budgetStore = useBudgetStore()

	// State
	const transactions = ref<Transaction[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)

	// Actions
	const addTransaction = async (
		transaction: Omit<Transaction, 'id' | 'date'>
	) => {
		try {
			loading.value = true

			// Валидация
			validateTransaction(transaction)

			const newTransaction: Transaction = {
				...transaction,
				id: crypto.randomUUID(),
				date: DateTime.now().toISO(),
			}

			transactions.value.push(newTransaction)
			saveToLocalStorage()

			// Проверка бюджета после добавления
			checkBudget(newTransaction)
		} catch (err) {
			error.value =
				err instanceof Error ? err.message : 'Failed to add transaction'
			throw err
		} finally {
			loading.value = false
		}
	}

	const updateTransaction = (updatedTransaction: Transaction) => {
		const index = transactions.value.findIndex(
			(t) => t.id === updatedTransaction.id
		)
		if (index !== -1) {
			transactions.value[index] = updatedTransaction
			saveToLocalStorage()
			checkBudget(updatedTransaction)
		}
	}

	const deleteTransaction = (transactionId: string) => {
		transactions.value = transactions.value.filter(
			(t) => t.id !== transactionId
		)
		saveToLocalStorage()
	}

	// Геттеры
	const totalBalance = computed(() => {
		return transactions.value.reduce((acc, t) => {
			return t.type === 'income' ? acc + t.amount : acc - t.amount
		}, 0)
	})

	const getTransactionsByCategory = computed(() => {
		return (categoryId: string) =>
			transactions.value.filter((t) => t.categoryId === categoryId)
	})

	const getCategorySpending = computed(() => {
		return (
			categoryId: string,
			startDate?: string,
			endDate?: string
		): number => {
			return transactions.value
				.filter(
					(t) =>
						t.categoryId === categoryId &&
						t.type === 'expense' &&
						checkDateInRange(t.date, startDate, endDate)
				)
				.reduce((sum, t) => sum + t.amount, 0)
		}
	})

	const filterTransactions = computed(() => {
		return (params: {
			type?: TransactionType
			categoryId?: string
			startDate?: string
			endDate?: string
		}) => {
			return transactions.value.filter((t) => {
				const typeMatch = params.type ? t.type === params.type : true
				const categoryMatch = params.categoryId
					? t.categoryId === params.categoryId
					: true
				const dateMatch = checkDateInRange(
					t.date,
					params.startDate,
					params.endDate
				)

				return typeMatch && categoryMatch && dateMatch
			})
		}
	})

	// Вспомогательные функции
	const validateTransaction = (
		transaction: Omit<Transaction, 'id' | 'date'>
	) => {
		if (transaction.amount <= 0) throw new Error('Amount must be positive')
		if (!DEFAULT_CATEGORIES.some((c) => c.id === transaction.categoryId)) {
			throw new Error('Invalid category')
		}
	}

	const checkBudget = (transaction: Transaction) => {
		if (transaction.type === 'expense') {
			const budget = budgetStore.getBudgetForCategory(
				transaction.categoryId,
				'monthly'
			)
			if (budget) {
				const progress = budgetStore.getBudgetProgress(
					transaction.categoryId,
					'monthly'
				)
				if (progress >= 100) {
					// Триггер уведомления
					console.warn(
						`Budget exceeded for category: ${transaction.categoryId}`
					)
				}
			}
		}
	}

	const checkDateInRange = (date: string, start?: string, end?: string) => {
		if (!start && !end) return true
		const transactionDate = DateTime.fromISO(date)

		return (
			transactionDate >= DateTime.fromISO(start || '1970-01-01') &&
			transactionDate <= DateTime.fromISO(end || '2100-01-01')
		)
	}

	// Персистентность
	const TRANSACTION_STORAGE_KEY = 'transactions'

	const saveToLocalStorage = () => {
		localStorage.setItem(
			TRANSACTION_STORAGE_KEY,
			JSON.stringify(transactions.value)
		)
	}

	const loadFromLocalStorage = () => {
		const saved = localStorage.getItem(TRANSACTION_STORAGE_KEY)
		if (saved) {
			transactions.value = JSON.parse(saved)
		}
	}

	// Инициализация
	loadFromLocalStorage()

	return {
		transactions,
		loading,
		error,
		totalBalance,
		addTransaction,
		updateTransaction,
		deleteTransaction,
		getTransactionsByCategory,
		getCategorySpending,
		filterTransactions,
	}
})
