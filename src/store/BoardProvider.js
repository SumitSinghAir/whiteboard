import React, { useCallback, useReducer } from "react";
import boardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from "../constants";
import { createNewElement, getSvgPathFromStroke } from "../utils/element";
import getStroke from "perfect-freehand";
import { isPointnearElement } from "../utils/element";

function boardReducer(state, action) {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return { ...state, activeToolItem: action.payload.tool };
    }
    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }
    case BOARD_ACTIONS.ERASE: {
      const { pointX, pointY } = action.payload;
      let newElements = [...state.elements];
      newElements = newElements.filter((element) => {
        return !isPointnearElement(element, pointX, pointY);
      });

      return {
        ...state,
        elements: newElements,
      };
    }
    case BOARD_ACTIONS.DRAW_DOWN: {
      const prevElements = [...state.elements];
      const { clientX, clientY, stroke, fill, size } = action.payload;
      const newElement = createNewElement(
        state.elements.length,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );
      const newElements = [...prevElements, newElement];
      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: newElements,
      };
    }

    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const prevElements = [...state.elements];
      const index = prevElements.length - 1;
      const { type } = prevElements[index];
      switch (type) {
        case TOOL_ITEMS.ARROW:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ELLIPSE:
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE: {
          const { x1, y1, type, fill, size, stroke } = prevElements[index];
          const newElement = createNewElement(index, x1, y1, clientX, clientY, {
            type,
            stroke,
            fill,
            size,
          });

          prevElements[index] = newElement;
          const newElements = [...prevElements];
          return {
            ...state,
            elements: newElements,
          };
        }
        case TOOL_ITEMS.BRUSH: {
          prevElements[index].points = [
            ...prevElements[index].points,
            { x: clientX, y: clientY },
          ];
          prevElements[index].path = new Path2D(
            getSvgPathFromStroke(getStroke(prevElements[index].points))
          );
          const newElements = [...prevElements];
          return {
            ...state,
            elements: newElements,
          };
        }
        default: {
          throw new Error("Error in boardReducer case statement");
        }
      }
    }
    case BOARD_ACTIONS.DRAW_UP: {
      const elementsCopy = [...state.elements];
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(elementsCopy);
      return {
        ...state,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.CHANGE_TEXT: {
      const newElements = [...state.elements];
      const index = newElements.length - 1;
      newElements[index].text = action.payload.text;
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(newElements);
      return {
        ...state,
        elements: newElements,
        toolActionType: action.payload.actionType,
        history: newHistory,
        index: state.index + 1,
      };
    }
    case BOARD_ACTIONS.UNDO: {
      const { history, index } = state;
      if (index > 0) {
        const newElements = history[index - 1];
        return {
          ...state,
          elements: newElements,
          index: index - 1,
        };
      } else {
        return state;
      }
    }
    case BOARD_ACTIONS.REDO: {
      const { history, index } = state;
      if (index < history.length - 1) {
        const newElements = history[index + 1];
        return {
          ...state,
          elements: newElements,
          index: index + 1,
        };
      } else {
        return state;
      }
    }
    default:
      return state;
  }
}

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
};

const BoardProvider = ({ children }) => {
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );
  const changeToolHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool,
      },
    });
  };
  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    const activeToolItem = boardState.activeToolItem;
    const stroke = toolboxState[activeToolItem]?.stroke,
      fill = toolboxState[activeToolItem]?.fill,
      size = toolboxState[activeToolItem]?.size;
    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }

    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke,
        fill,
        size,
      },
    });
  };
  const boardMouseMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: {
          pointX: clientX,
          pointY: clientY,
        },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING)
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
  };
  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    if (
      boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING ||
      boardState.toolActionType === TOOL_ACTION_TYPES.ERASING
    ) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
        payload: {},
      });
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  };

  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  };

  const undoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  }, []);
  const redoHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  }, []);

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    history: boardState.history,
    toolActionType: boardState.toolActionType,
    index: boardState.index,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    textAreaBlurHandler,
    undoHandler,
    redoHandler,
  };
  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;
