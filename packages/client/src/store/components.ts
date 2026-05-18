import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { arrayMove } from "@dnd-kit/sortable";
import { ulid } from "ulid";
import type { TComponentPropsUnion, TComponentTypes } from "@lowcode/share";
import { calcValueByString } from "@lowcode/share";

export interface TStoreComponents {
  compConfigs: Record<string, TComponentPropsUnion>;
  sortableCompConfig: string[];
  currentCompConfig: string | null;
  copyedCompConig: TComponentPropsUnion | null;
  itemsExpandIndex: number;
}

interface ComponentsHistoryState {
  past: TStoreComponents[];
  present: TStoreComponents;
  future: TStoreComponents[];
}

interface UpdateArrayPayload {
  key: string;
  index: number;
  field: string;
  value: string;
}

function createPresentState(): TStoreComponents {
  return {
    compConfigs: {},
    sortableCompConfig: [],
    currentCompConfig: null,
    copyedCompConig: null,
    itemsExpandIndex: 0,
  };
}

function clonePresentState(state: TStoreComponents): TStoreComponents {
  return JSON.parse(JSON.stringify(state)) as TStoreComponents;
}

function normalizePresentState(
  state?: Partial<TStoreComponents> | null
): TStoreComponents {
  return {
    ...createPresentState(),
    ...clonePresentState((state ?? {}) as TStoreComponents),
  };
}

function commitChange(
  state: ComponentsHistoryState,
  callback: (present: TStoreComponents) => void
) {
  state.past.push(clonePresentState(state.present));
  state.future = [];
  callback(state.present);
}

const initialState: ComponentsHistoryState = {
  past: [],
  present: createPresentState(),
  future: [],
};

const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {
    setCurrentComponent(state, action: PayloadAction<string | null>) {
      state.present.currentCompConfig = action.payload;
    },
    pushComponent(state, action: PayloadAction<TComponentTypes>) {
      commitChange(state, (present) => {
        const comp: TComponentPropsUnion = {
          id: ulid(),
          type: action.payload,
          props: {},
        } as TComponentPropsUnion;
        present.compConfigs[comp.id] = comp;
        present.sortableCompConfig.push(comp.id);
        present.currentCompConfig = comp.id;
      });
    },
    updateCurrentComponent(
      state,
      action: PayloadAction<TComponentPropsUnion["props"]>
    ) {
      if (!state.present.currentCompConfig) return;

      commitChange(state, (present) => {
        const current =
          present.compConfigs[present.currentCompConfig as string] ?? null;
        if (!current) return;

        for (const [key, value] of Object.entries(action.payload)) {
          // @ts-expect-error shared component props are discriminated unions here
          current.props[key] = calcValueByString(value);
        }
      });
    },
    updateCurrentCompConfigWithArray(
      state,
      action: PayloadAction<UpdateArrayPayload>
    ) {
      if (!state.present.currentCompConfig) return;

      commitChange(state, (present) => {
        const current =
          present.compConfigs[present.currentCompConfig as string] ?? null;
        if (!current) return;

        const { key, index, field, value } = action.payload;
        const target = (current.props as Record<string, unknown>)[key];
        if (!Array.isArray(target) || !target[index]) return;
        target[index][field] = value;
      });
    },
    setItemsExpandIndex(state, action: PayloadAction<number>) {
      state.present.itemsExpandIndex = action.payload;
    },
    moveComponent(
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) {
      commitChange(state, (present) => {
        present.sortableCompConfig = arrayMove(
          present.sortableCompConfig,
          action.payload.oldIndex,
          action.payload.newIndex
        );
      });
    },
    copyCurrentComponent(state) {
      const currentId = state.present.currentCompConfig;
      if (!currentId) return;

      state.present.copyedCompConig = JSON.parse(
        JSON.stringify(state.present.compConfigs[currentId])
      ) as TComponentPropsUnion;
    },
    pasteCopyedComponent(state) {
      if (!state.present.copyedCompConig) return;

      commitChange(state, (present) => {
        const comp = {
          ...(JSON.parse(
            JSON.stringify(present.copyedCompConig)
          ) as TComponentPropsUnion),
          id: ulid(),
        };

        present.compConfigs[comp.id] = comp;
        present.sortableCompConfig.push(comp.id);
        present.currentCompConfig = comp.id;
      });
    },
    removeCurrentComponent(state) {
      const currentId = state.present.currentCompConfig;
      if (!currentId) return;

      commitChange(state, (present) => {
        const index = present.sortableCompConfig.indexOf(currentId);
        if (index < 0) return;

        present.sortableCompConfig.splice(index, 1);
        delete present.compConfigs[currentId];

        const rollbackIndex = index - 1 > 0 ? index - 1 : 0;
        present.currentCompConfig =
          present.sortableCompConfig[rollbackIndex] ?? null;
      });
    },
    replacePresent(state, action: PayloadAction<Partial<TStoreComponents>>) {
      state.present = normalizePresentState(action.payload);
      state.past = [];
      state.future = [];
    },
    undo(state) {
      const previous = state.past.pop();
      if (!previous) return;

      state.future.unshift(clonePresentState(state.present));
      state.present = previous;
    },
    redo(state) {
      const next = state.future.shift();
      if (!next) return;

      state.past.push(clonePresentState(state.present));
      state.present = next;
    },
  },
});

export const componentsActions = componentsSlice.actions;

export default componentsSlice.reducer;
