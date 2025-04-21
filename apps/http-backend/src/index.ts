import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(401).json({
      message: "Incorrect inputs",
    });
    return;
  }
  const { username, password, name } = parsedData.data;

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email: username },
    });

    if (existingUser) {
      res.status(409).json({
        message: "User already exists",
      });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: {
        email: username,
        password: hashedPassword,
        name,
      },
    });
    res.status(201).json({
      message: "User signed up succesfully",
      userId: user.id,
    });
  } catch (err) {
    res.status(411).json({
      message: "Something went wrong",
    });
  }
});

app.post("/signin", async (req, res) => {
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "Incorrect inputs",
    });
    return;
  }

  const { username, password } = parsedData.data;
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        email: username,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid username or password",
      });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({
        message: "Invalid username or password",
      });
    }
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );
    res.status(201).json({
      message: "User signed in succelfully",
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/room", middleware, async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(411).json({
      message: "Incorrect inputs",
    });
    return;
  }

  const userId = req.userId;
  if (!userId) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
      },
    });
    res.status(201).json({
      roomId: room.id,
    });
  } catch (err) {
    res.status(411).json({
      message: "Room already exists",
    });
  }
});

app.get("/chats/:roomId", middleware, async (req, res) => {
  const roomId = Number(req.params.roomId);
  const messages = await prismaClient.chat.findMany({
    where: {
      roomId: roomId,
    },
    orderBy: {
      id: "desc",
    },
    take: 50,
  });
  res.json({
    messages,
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
