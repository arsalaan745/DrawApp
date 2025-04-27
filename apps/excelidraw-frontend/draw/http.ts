import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`,{
      headers:{
        Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMmU0ZDAwNi1lOThhLTQ4OGQtOWEyYi1lOWVmMWVmNmJlNzMiLCJpYXQiOjE3NDU3NjY4MTh9.30PpAecJMf-aCZUMcPMy2IJtrPiA7t5wEqiR_ICAD7o",
      },
    });
    const messages = res.data.messages;
  
    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData.shape;
    })
  
    return shapes;
  }