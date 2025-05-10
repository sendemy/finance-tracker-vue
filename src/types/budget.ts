import type { CategoryType } from './transaction'

export type BudgetPeriod = 'weekly' | 'monthly'

export interface Budget {
	id: string
	categoryId: CategoryType['id']
	limit: number
	period: BudgetPeriod
	createdAt: string
	currency?: string
}
