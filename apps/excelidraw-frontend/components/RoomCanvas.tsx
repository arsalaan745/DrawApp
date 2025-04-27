"use client";
import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNjRkMmE3Yi05MTZlLTQ4YTEtYTFkYS1hMTE4NmUxYzBkZDEiLCJpYXQiOjE3NDU3NzQyMzN9.cCvE4rO0TLAYvdk-fNz6SbIRDOeNjciD7rmObL0agFM`
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
