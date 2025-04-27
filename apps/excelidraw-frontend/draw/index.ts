import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d")!;
  if (!ctx) return;

  let existingShapes: Shape[] = await getExistingShapes(roomId);
  let clicked = false;
  let startX = 0;
  let startY = 0;
  let currentPencilPath: Shape[] = [];

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.forEach((shape) => {
      drawShape(shape);
    });
  }

  function drawShape(shape: Shape) {
    if (shape.type === "rect") {
      ctx.strokeStyle = "white";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape.type === "pencil") {
      ctx.beginPath();
      ctx.moveTo(shape.startX, shape.startY);
      ctx.lineTo(shape.endX, shape.endY);
      ctx.stroke();
    }
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == "chat") {
      const parsedShape = JSON.parse(message.message);
      existingShapes.push(parsedShape.shape);
      clearCanvas();
    }
  };

  clearCanvas();

  canvas.addEventListener("mousedown", (e) => {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;

    //@ts-ignore
    if (window.selectedTool === "pencil") {
      currentPencilPath = [];
    }
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!clicked) return;
    clicked = false;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    //@ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      shape = {
        type: "circle",
        centerX: startX + width / 2,
        centerY: startY + height / 2,
        radius,
      };
    } else if (selectedTool === "pencil") {
      currentPencilPath.forEach((line) => {
        existingShapes.push(line);
        sendShape(line);
      });
      currentPencilPath = [];
      clearCanvas();
      return;
    }

    if (shape) {
      existingShapes.push(shape);
      sendShape(shape);
      clearCanvas();
    }
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!clicked) return;

    const width = e.clientX - startX;
    const height = e.clientY - startY;

    //@ts-ignore
    const selectedTool = window.selectedTool;

    if (selectedTool === "pencil") {
      const lastX = startX;
      const lastY = startY;
      const currentX = e.clientX;
      const currentY = e.clientY;

      const line: Shape = {
        type: "pencil",
        startX: lastX,
        startY: lastY,
        endX: currentX,
        endY: currentY,
      };
      currentPencilPath.push(line);

      startX = currentX;
      startY = currentY;

      drawShape(line);
    } else {
      clearCanvas();
      ctx.strokeStyle = "white";
      if (selectedTool === "rect") {
        ctx.strokeRect(startX, startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  });

  function sendShape(shape: Shape) {
    socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId,
      })
    );
  }
}

async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
    headers: {
      Authorization: "Bearer YOUR-TOKEN-HERE",
    },
  });

  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
