import type { TStorePage } from "~/store";
import { pageActions } from "~/store";
import { useAppDispatch, useAppSelector } from "~/store/hooks";

export function useStorePage() {
  const dispatch = useAppDispatch();
  const storePage = useAppSelector((state) => state.page);

  function setPageTitle(title: string) {
    dispatch(pageActions.setPageTitle(title));
  }

  function updatePage(page: Partial<TStorePage>) {
    dispatch(pageActions.updatePage(page));
  }

  function replacePage(page: TStorePage) {
    dispatch(pageActions.replacePage(page));
  }

  function resetPage() {
    dispatch(pageActions.resetPage());
  }

  return {
    updatePage,
    setPageTitle,
    replacePage,
    resetPage,
    store: storePage,
  };
}
