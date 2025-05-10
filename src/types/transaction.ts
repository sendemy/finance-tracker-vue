export type TransactionType = 'income' | 'expense'

export type CategoryType = {
	id: string
	name: string
	icon: string
}

export interface Transaction {
	id: string
	type: TransactionType
	amount: number
	categoryId: CategoryType['id']
	date: string // ISO string
	description?: string
}
