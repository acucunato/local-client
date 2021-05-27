import produce from "immer";
import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {},
};

const reducer = produce((state: CellsState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CELLS_ERROR:
      state.error = action.payload;

      return state;
    case ActionType.FETCH_CELLS:
      state.loading = true;
      state.error = null;

      return state;
    case ActionType.FETCH_CELLS_COMPLETE:
      state.order = action.payload.map((cell) => cell.id);

      state.data = action.payload.reduce((acc, cell) => {
        acc[cell.id] = cell;
        return acc;
      }, {} as CellsState["data"]);

      return state;
    case ActionType.FETCH_CELLS_ERROR:
      state.loading = false;
      state.error = action.payload;
      return state;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      state.data[id].content = content;
      return state;

    // WITHOUT IMMER
    // return {
    //   ...state,
    //   data: {
    //     ...state.data,
    //     [id]: {
    //       ...state.data[id],
    //       content,
    //     },
    //   },
    // };

    case ActionType.DELETE_CELL:
      // delete the data at the id from action.payload, then filter the array and remove the id at the action. payload then return the new array
      delete state.data[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);
      return state;
    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      // find index of cell you want to move
      const index = state.order.findIndex((id) => id === action.payload.id);

      // if our direction is up , and our target index is before we are trying to find earlier element or the one before and move it WHERE YOU WANT TO MOVE IT
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return state;
      }
      // take whateevre is at index right now, swap with target index, then move and assign to new space in the array

      state.order[index] = state.order[targetIndex];
      state.order[targetIndex] = action.payload.id;

      return state;
    case ActionType.INSERT_CELL_AFTER:
      // create new cell and add into state, type checking to which cell we are creating
      const cell: Cell = {
        // default content is empty
        content: "",
        // tell us the type of cell we are creating
        type: action.payload.type,
        // random generate from the client/redux app so we will generate a random id
        id: randomID(),
      };

      // insert into the data object, new prop of cell.id new record at this object set that too the cell that we just generated
      state.data[cell.id] = cell;

      // insert cell into ORDER ARRAY id of action.payload prop where that id is inside of our order array, we need to insert right before the order of the current array
      // find index of the one we want to move to
      const foundIndex = state.order.findIndex(
        (id) => id === action.payload.id
      );

      // if it is null, and we cannot find then we are going to add our cells id to the very end of order array, if not we will want to insert the new cell id
      if (foundIndex < 0) {
        state.order.unshift(cell.id);
      } else {
        state.order.splice(foundIndex + 1, 0, cell.id);
      }

      return state;
    default:
      return state;
  }
}, initialState);

const randomID = () => {
  // random number, 36 (random numbers and letters), small portion of string we get back, having random id generation
  return Math.random().toString(36).substring(2, 5);
};

export default reducer;
