import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`,{
      headers:{
        Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiNjRkMmE3Yi05MTZlLTQ4YTEtYTFkYS1hMTE4NmUxYzBkZDEiLCJpYXQiOjE3NDU3NzQyMzN9.cCvE4rO0TLAYvdk-fNz6SbIRDOeNjciD7rmObL0agFM",
      },
    });
    const messages = res.data.messages;
  
    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })
  
    return shapes;
  }