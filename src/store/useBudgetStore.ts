// stores/useBudgetStore.ts
import { DateTime } from 'luxon'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Budget, BudgetPeriod } from '../types/budget'
import type { CategoryType } from '../types/transaction'
import { useTransactionStore } from './useTransactionsStore'

export const useBudgetStore = defineStore('budget', () => {
	const transactionsStore = useTransactionStore()

	// State
	const budgets = ref<Budget[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)

	// Получение текущей даты для расчетов периода
	const currentDate = DateTime.now()

	// Actions
	const addBudget = (newBudget: Omit<Budget, 'id'>) => {
		try {
			// Валидация
			if (newBudget.limit <= 0) {
				throw new Error('Budget limit must be positive')
			}

			const budget: Budget = {
				...newBudget,
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
			}

			budgets.value.push(budget)
			saveToLocalStorage()
		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to add budget'
			throw err
		}
	}

	const updateBudget = (updatedBudget: Budget) => {
		const index = budgets.value.findIndex((b) => b.id === updatedBudget.id)
		if (index !== -1) {
			budgets.value[index] = updatedBudget
			saveToLocalStorage()
		}
	}

	const deleteBudget = (budgetId: string) => {
		budgets.value = budgets.value.filter((b) => b.id !== budgetId)
		saveToLocalStorage()
	}

	// Геттеры
	const getBudgetForCategory = computed(() => {
		return (categoryId: CategoryType['id'], period: BudgetPeriod) => {
			return budgets.value.find(
				(b) => b.categoryId === categoryId && b.period === period
			)
		}
	})

	const getCurrentSpending = computed(() => {
		return (categoryId: CategoryType['id'], period: BudgetPeriod) => {
			const periodRange = getPeriodDates(period)
			return transactionsStore.getCategorySpending(
				categoryId,
				periodRange.start,
				periodRange.end
			)
		}
	})

	const getBudgetProgress = computed(() => {
		return (categoryId: CategoryType['id'], period: BudgetPeriod) => {
			const budget = getBudgetForCategory.value(categoryId, period)
			if (!budget) return 0

			const spent = getCurrentSpending.value(categoryId, period)
			return (spent / budget.limit) * 100
		}
	})

	// Вспомогательные функции
	const getPeriodDates = (period: BudgetPeriod) => {
		switch (period) {
			case 'weekly':
				return {
					start: currentDate.startOf('week').toISO(),
					end: currentDate.endOf('week').toISO(),
				}
			case 'monthly':
				return {
					start: currentDate.startOf('month').toISO(),
					end: currentDate.endOf('month').toISO(),
				}
			default:
				throw new Error('Invalid budget period')
		}
	}

	// Персистентность
	const BUDGET_STORAGE_KEY = 'budgets'

	const saveToLocalStorage = () => {
		localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets.value))
	}

	const loadFromLocalStorage = () => {
		const saved = localStorage.getItem(BUDGET_STORAGE_KEY)
		if (saved) {
			budgets.value = JSON.parse(saved)
		}
	}

	// Инициализация
	loadFromLocalStorage()

	return {
		budgets,
		loading,
		error,
		addBudget,
		updateBudget,
		deleteBudget,
		getBudgetForCategory,
		getCurrentSpending,
		getBudgetProgress,
	}
})
