import dotenv from "dotenv"

dotenv.config()

const { MONGO_URI, PORT } = process.env

export const config = {
  mongoUri: MONGO_URI || "",
  port: PORT || 8080
}
