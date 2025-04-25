import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

export type Tool = "circle" | "pencil" | "rect";

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  useEffect(() => {
    if (canvasRef.current) {
      initDraw(canvasRef.current, roomId, socket);
    }
  }, [canvasRef]);

  return (<div style={{
        height: "100vh",
        overflow: "hidden",
      }}>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ></canvas>
      <TopBar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
    </div>
  );
}

function TopBar({selectedTool,setSelectedTool,}: 
  { selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
}) {
  return ( <div style={{
        position: "fixed",
        top: 10,
        left: 10,
      }}>
      <div className="flex gap-2">
        <IconButton
          onClick={() => {
            setSelectedTool("pencil");
          }}
          activated={selectedTool === "pencil"}
          icon={<Pencil />}/>

        <IconButton
          onClick={() => {
            setSelectedTool("rect");
          }}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon />} ></IconButton>

        <IconButton
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
          icon={<Circle />} ></IconButton>
      </div>
    </div>
  );
}
