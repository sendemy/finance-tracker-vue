import type { CategoryType } from '../types/transaction'

// TODO: добавить еще категорий
export const DEFAULT_CATEGORIES: ReadonlyArray<CategoryType> = [
	{
		id: 'food',
		name: 'Food',
		icon: '🍔',
	},
	{
		id: 'transport',
		name: 'Transport',
		icon: '🚗',
	},
] as const
