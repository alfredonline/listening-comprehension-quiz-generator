"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import axios from "axios";
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from "openai/helpers/zod";

// Schema definitions
const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      answers: z.array(
        z.object({
          text: z.string(),
          correct: z.boolean(),
        })
      ),
    })
  ),
});

// YouTube validation
const YOUTUBE_LINK_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})(\S*)?$/;

function validateYouTubeLink(link: string): string {
  const isValid = YOUTUBE_LINK_REGEX.test(link);
  console.log("YouTube Link:", link);
  if (!isValid) {
    console.log("Invalid YouTube link:", link);
    throw new Error("Please provide a valid YouTube link.");
  }

  console.log("Validating YouTube link:", link);

  let videoId: string | null = null;

  if (link.includes("youtube.com")) {
    videoId = new URL(link).searchParams.get("v");
  } else if (link.includes("youtu.be")) {
    videoId = link.split("youtu.be/")[1]?.split("?")[0];
  }

  console.log("Video ID:", videoId);

  if (!videoId || videoId.length !== 11) {
    throw new Error(
      "Please provide a valid YouTube link. Make sure your link contains a valid video ID."
    );
  }

  return videoId;
}

// API Handlers
async function getSubtitles(id: string) {
  const options = {
    method: "GET",
    url: "https://yt-api.p.rapidapi.com/subtitles",
    params: { id },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "yt-api.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    throw error;
  }
}

async function getVideoDetails(id: string) {
  const options = {
    method: "GET",
    url: "https://yt-api.p.rapidapi.com/video/info",
    params: { id },
    headers: {
      "x-rapidapi-key": process.env.RAPID_API_KEY,
      "x-rapidapi-host": "yt-api.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
}

async function generateQuizFromTranscript(transcript: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Generate a quiz with 10 multiple-choice questions based on the following podcast transcript. 
  Each question should have 4 possible answers, with exactly one correct answer. Make sure the questions are all related to the podcast.
  Do not make references to the transcript, just make up questions based on the podcast.
  
  Transcript:
  ${transcript}
  
  Provide the output in the following JSON format:
  {
    "questions": [
      {
        "question": "Question text here?",
        "answers": [
          {"text": "Answer 1", "correct": false},
          {"text": "Answer 2", "correct": true},
          {"text": "Answer 3", "correct": false},
          {"text": "Answer 4", "correct": false}
        ]
      }
    ]
  }`;

  try {
    const completion = await openai.beta.chat.completions.parse({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates quiz questions based on provided content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o-mini",
      response_format: zodResponseFormat(QuizSchema, "quiz"),
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No content in OpenAI response");
    }

    const rawResponse = JSON.parse(completion.choices[0].message.content);
    const validatedQuiz = QuizSchema.parse(rawResponse);
    return validatedQuiz;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}

// Main export function
export async function generateQuiz(formData: FormData) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return { error: "Unauthorized", success: false };
    }

    const youtubeLink = formData.get('video-url') as string;
    console.log("YouTube Link:", youtubeLink);
    if (!youtubeLink) {
      console.log("No YouTube Link provided");
      return { error: "Please provide a YouTube URL", success: false };
    }

    const videoId = validateYouTubeLink(youtubeLink);
    console.log("Video ID:", videoId);
    const transcript = await getSubtitles(videoId);
    console.log("Transcript:", transcript);
    const quiz = await generateQuizFromTranscript(transcript);
    console.log("Quiz:", quiz);

    const createdQuiz = await prisma.quiz.create({
      data: {
        userId: user.id,
        questions: {
          create: quiz.questions.map(question => ({
            question: question.question,
            answers: {
              create: question.answers.map(answer => ({
                text: answer.text,
                correct: answer.correct,
              })),
            },
          })),
        },
      },
    });

    console.log("Quiz created successfully with ID:", createdQuiz.id);
    revalidatePath("/dashboard");
    
    // Make sure we're explicitly returning both success and quizId
    return { 
      success: true, 
      quizId: createdQuiz.id 
    };

  } catch (error) {
    console.error("Error generating quiz:", error);
    return { 
      success: false,
      error: error instanceof Error 
        ? error.message 
        : "Failed to generate quiz. Please try again." 
    };
  }
}

export { getSubtitles, getVideoDetails };
