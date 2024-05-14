import React, { useContext } from "react";
import { useRef, useEffect, useLayoutEffect } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import toolboxContext from "../../store/toolbox-context";
import classes from "./index.module.css";

const Board = () => {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const { toolboxState } = useContext(toolboxContext);
  const {
    elements,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    toolActionType,
    boardMouseUpHandler,
    textAreaBlurHandler,
    redoHandler,
    undoHandler,
  } = useContext(boardContext);
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.save();
    const roughCanvas = rough.canvas(canvas);
    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.ARROW:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ELLIPSE:
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
          roughCanvas.draw(element.roughEle);
          break;
        case TOOL_ITEMS.BRUSH: {
          context.fillStyle = element.stroke;
          context.fill(element.path);
          context.restore();
          break;
        }
        case TOOL_ITEMS.TEXT: {
          context.textBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(element.text, element.x1, element.y1);
          context.restore();
          break;
        }
        default: {
          throw new Error("Error in Board in canvas handling");
        }
      }
    });

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        undoHandler();
      } else if (event.ctrlKey && event.key === "y") {
        redoHandler();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoHandler, redoHandler]);

  const handleBoardMouseDown = (event) => {
    boardMouseDownHandler(event, toolboxState);
  };

  const handleBoardMouseMove = (event) => {
    boardMouseMoveHandler(event);
  };

  const handleBoardMouseUp = () => {
    boardMouseUpHandler();
  };
  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: elements[elements.length - 1]?.stroke,
          }}
          onBlur={(event) => textAreaBlurHandler(event.target.value)}
        />
      )}
      <canvas
        id="canvas"
        ref={canvasRef}
        onMouseDown={handleBoardMouseDown}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
      ></canvas>
    </>
  );
};

export default Board;
