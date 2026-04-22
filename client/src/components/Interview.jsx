import React, { useEffect, useState } from "react";
import maleVideo from "../assets/male-ai.mp4";
import femaleVideo from "../assets/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useRef } from "react";
import { ServerUrl } from "../App";
import axios from "axios";
import {BsArrowRight } from "react-icons/bs";

function Interview({ interviewData, onFinish }) {
  const isListeningRef = useRef(false);
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [feedback, setFeedback] = useState("");

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha"),
      );

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice); // ✅ FIX
        setVoiceGender("female");
      } else if (maleVoice) {
        setSelectedVoice(maleVoice); // ✅ FIX
        setVoiceGender("male");
      } else {
        setSelectedVoice(voices[0]); // ✅ FIX
        setVoiceGender("female");
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /** -------------------------------------Speak function ------------------------------------*/
  const speakTest = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.voice = selectedVoice; // ✅ FINAL FIX

      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        
        {
          /*setTimeout(()=>{
        setSubtitle("");
        resolve();},300);
         */
        }
        setSubtitle("");
        resolve();
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakTest(
          `Welcome ${userName}, It's great to meet you today. I hope you're feeling confident and ready for our interview. Let's get started with the first question!`,
        );

        await speakTest(
          "I'll ask you a few questions. just answer naturally, and take your time.  Let's begin.",
        );
        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        // if last questions (hard level)
        if (currentIndex === questions.length - 1) {
          await speakTest("Alright, this one might be a bit more challenging.");
        }
        await speakTest(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isSubmitting]);

  useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    isListeningRef.current = true;
  };

  recognition.onend = () => {
    isListeningRef.current = false;
  };

  recognition.onerror = () => {
    isListeningRef.current = false;
  };

  recognition.onresult = (event) => {
    const transcript =
      event.results[event.results.length - 1][0].transcript.trim();

    setAnswer((prev) => prev + " " + transcript);
  };

  recognitionRef.current = recognition;
}, []);

  const startMic = () => {
  if (!recognitionRef.current || isAIPlaying) return;

  if (isListeningRef.current) return; // ✅ prevent duplicate

  try {
    recognitionRef.current.start();
  } catch (error) {
    console.log("Mic already running...");
  }
};

  const stopMic = () => {
  if (!recognitionRef.current) return;

  try {
    recognitionRef.current.stop();
  } catch (error) {}

  isListeningRef.current = false;
};

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );

      setFeedback(result.data.feedback);
      speakTest(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    stopMic();
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    await speakTest("Alright, let’s move to the next question.");
    setCurrentIndex(currentIndex + 1);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true },
      );
      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.error("Error finishing interview:", error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/*Video section  */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>
          {/*Subtitle */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 p-4 sm:p-6 rounded-xl shadow-sm">
              <p className="text-gray-700 text-sm sm: text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/*timer area */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600">
                  {isAIPlaying ? "AI Speaking" : "AI Not Speaking"}
                </span>
              )}
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="grid  grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-400">Current Questions</span>
              </div>

              <div>
                <span className="text-2xl font-bold text-emerald-600">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>
        {/* Text section */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className="text-xl  sm:text-2xl font-bold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="text=base sm:text-lg font-semibold text-gray-700 leading-relaxed ">
                {currentQuestion?.question}
              </div>
            </div>
          )}
          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />
          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white"
              >
                {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-2xl"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border-emerald-200 p-5 rounded-2xl"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl flex items-center justify-center gap-1"
              >
                Next Question
                <BsArrowRight size={16} className="ml-2" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;
