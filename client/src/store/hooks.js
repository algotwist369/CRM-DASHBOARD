import { useSelector, useDispatch, useStore } from 'react-redux'

// Custom hooks for Redux
export const useAppSelector = useSelector
export const useAppDispatch = useDispatch
export const useAppStore = useStore

// Typed selector hook (commented out for JavaScript)
// export const useAppSelector = <TSelected = unknown>(
//   selector: (state: RootState) => TSelected,
//   equalityFn?: (left: TSelected, right: TSelected) => boolean
// ): TSelected => useSelector(selector, equalityFn)

// Typed dispatch hook (commented out for JavaScript)
// export const useAppDispatch = () => useDispatch<AppDispatch>()

export default {
  useAppSelector,
  useAppDispatch,
  useAppStore
}
