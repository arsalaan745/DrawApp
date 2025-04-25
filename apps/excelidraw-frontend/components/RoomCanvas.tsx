"use client";
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMTQzYTEwZS1kZDE0LTRlYjAtYTNkNC04ZWU3MTQzZjNmMDIiLCJpYXQiOjE3NDU1NzczNzB9.537YfYggRfGW0JWn1nr25Cdy40crUsB7PxkPNe5ne8I`
    );

     ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])

  if (!socket) {
    return <div>Connecting to the server......</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
