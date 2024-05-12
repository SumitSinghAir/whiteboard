import { createContext } from "react";

const boardContext = createContext({
  activeToolItem: "",
  element: [],
  history: [[]],
  index: 0,
  changeToolHandler: () => {},
  boardMouseDownHandler: () => {},
  boardMouseMoveHandler: () => {},
  boardMouseUpHandler: () => {},
  textAreaBlurHandler: () => {},
  undoHandler: () => {},
  redoHandler: () => {},
});

export default boardContext;
