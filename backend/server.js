import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import axios from "axios";
import Bytez from "bytez.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const key=process.env.BYTEZ;


const sdk = new Bytez(key);
const model = sdk.model("Qwen/Qwen2.5-1.5B-Instruct")
// 
const videoModel = sdk.model("openai/sora-2")




app.get("/zara",(req,res)=>{
    res.send("welcome to zara server")
})

app.post("/api/chat", async (req, res) => {
    try {
        console.log("API HIT");

        const { message } = req.body;
        console.log("Message:", message);

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const { error, output } = await model.run([
            {
                role: "user",
                content: String(message)
            }
        ]);

        console.log("Bytez response:", { error, output });

        if (error) {
            return res.status(500).json({ error: "AI failed" });
        }

        if (!output || !output.content) {
            return res.status(500).json({ error: "No response from AI" });
        }

        const reply = output.content;   // ✅ FIXED HERE

        res.json({
            type: "text",
            reply
        });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "AI text error" });
    }
});








// ---------------- IMAGE GENERATION ----------------
const imageModel = sdk.model("SG161222/RealVisXL_V5.0");

app.post("/api/image", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) return res.status(400).json({ error: "Prompt is required" });

        // Run Bytez image model
        const { error, output } = await imageModel.run(prompt);

        console.log("Bytez image response:", { error, output });

        if (error) return res.status(500).json({ error: "Image generation failed" });
        if (!output) return res.status(500).json({ error: "No image returned" });

        // Bytez image model returns URL (not Base64)
        const imageURL = typeof output === "string" && output.startsWith("http") ? output : null;
        if (!imageURL) return res.status(500).json({ error: "Invalid image output" });

        // Send URL to frontend
        res.json({ type: "image", image: imageURL });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "AI image error" });
    }
});


app.post("/api/video", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        console.log("Generating video for prompt:", prompt);

        const { error, output } = await videoModel.run(prompt);

        console.log("Bytez video response:", { error, output });

        if (error) {
            console.error("Video Model Error:", error);
            return res.status(200).json({
                type: "video",
                video: null,
                message: "Video blocked by moderation system"
            });
        }

        if (!output || !output.content) {
            return res.status(200).json({
                type: "video",
                video: null,
                message: "No video returned"
            });
        }

        res.json({
            type: "video",
            video: `data:video/mp4;base64,${output.content}`
        });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(200).json({
            type: "video",
            video: null,
            message: "Video generation failed"
        });
    }
});




app.listen(process.env.PORT, () => {
    console.log("Server running on port 3000");
});

