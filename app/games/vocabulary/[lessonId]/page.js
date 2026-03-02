'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import GameOverModal from '@/components/GameOverModal';
import { ArrowLeft, Frown, Image as ImageIcon, CheckCircle, XCircle, Star } from 'lucide-react';

export default function VocabularyGamePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getAuthHeader } = useAuth();
    const lessonId = params.lessonId;
    const studentId = searchParams.get('student');

    const [lesson, setLesson] = useState(null);
    const [vocabulary, setVocabulary] = useState([]);
    const [originalVocabulary, setOriginalVocabulary] = useState([]); // Asl barcha so'zlar
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false); // Takrorlash darslari uchun
    const [wrongAnswers, setWrongAnswers] = useState([]); // Noto'g'ri javoblar ro'yxati
    const [isReviewingWrong, setIsReviewingWrong] = useState(false); // Noto'g'ri javoblarni takrorlash rejimi
    const [showConfetti, setShowConfetti] = useState(false); // Confetti animatsiya

    // Speech synthesis setup
    const speakText = useCallback((text, lang = 'en-US', rate = 0.9) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = lang;
                utterance.rate = rate;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
                
                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);
                
                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    }, []);

    // Play success/error sound
    const playSound = useCallback((isSuccess) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (isSuccess) {
            // Success sound - happy melody
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        } else {
            // Error sound - descending tone
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.2);
        }
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }, []);

    // No need to speak Uzbek translation automatically
    // Only speak English words when user clicks on options

    useEffect(() => {
        if (lessonId) {
            fetchLesson();
        }
        
        // Cleanup: stop speech when component unmounts
        return () => {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [lessonId]);

    const fetchLesson = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}`, {
                headers: getAuthHeader()
            });
            const data = await res.json();
            if (data.lesson) {
                setLesson(data.lesson);
                const vocab = data.lesson.vocabulary || [];
                // Shuffle vocabulary
                const shuffled = [...vocab].sort(() => Math.random() - 0.5);
                setOriginalVocabulary(vocab); // Asl barcha so'zlarni saqlash
                setVocabulary(shuffled);
                if (shuffled.length > 0) {
                    generateOptions(shuffled, 0);
                }
            }
        } catch (error) {
            console.error('Error fetching lesson:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateOptions = useCallback((vocab, index) => {
        if (!vocab || vocab.length === 0 || index >= vocab.length) return;

        const correct = vocab[index];
        
        // Agar originalVocabulary mavjud bo'lsa, undan variantlar olish
        // Aks holda, hozirgi vocab'dan olish
        const sourceVocab = originalVocabulary.length > 0 ? originalVocabulary : vocab;
        const others = sourceVocab.filter(v => v.word !== correct.word);
        
        console.log(`📝 Generating options for "${correct.word}":`);
        console.log(`  Source vocab: ${sourceVocab.length}`);
        console.log(`  Available others: ${others.length}`);
        
        // Agar kamida 3 ta boshqa so'z bo'lsa, 3 ta noto'g'ri variant olish
        // Aks holda, mavjud barcha boshqa so'zlarni olish
        const numberOfWrongOptions = Math.min(3, others.length);
        const shuffledOthers = others.sort(() => Math.random() - 0.5).slice(0, numberOfWrongOptions);
        
        // To'g'ri javob + noto'g'ri javoblar = jami 4 ta variant (agar yetarli so'z bo'lsa)
        const allOptions = [correct, ...shuffledOthers].sort(() => Math.random() - 0.5);
        
        console.log(`  Generated ${allOptions.length} options:`, allOptions.map(o => o.word));
        
        setOptions(allOptions);
    }, [originalVocabulary]);

    const handleListenClick = (option, e) => {
        e.stopPropagation();
        // Just play the pronunciation, don't select
        speakText(option.word, 'en-US', 0.9);
    };

    const handleOptionClick = async (option) => {
        // If already checking answer, don't allow selection
        if (isCorrect !== null) return;
        
        // Select and check answer
        setSelectedOption(option);
        const correct = option.word === vocabulary[currentIndex].word;
        setIsCorrect(correct);

        // Play sound effect
        playSound(correct);

        if (correct) {
            setScore(prev => prev + 1);
            setShowConfetti(true);
            
            // Hide confetti after animation
            setTimeout(() => setShowConfetti(false), 600);
            
            // Wait and move to next
            setTimeout(async () => {
                if (currentIndex + 1 < vocabulary.length) {
                    setCurrentIndex(prev => prev + 1);
                    generateOptions(vocabulary, currentIndex + 1);
                    setSelectedOption(null);
                    setIsCorrect(null);
                } else {
                    // Asosiy savollar tugadi - endi noto'g'ri javoblarni tekshirish
                    if (wrongAnswers.length > 0 && !isReviewingWrong) {
                        // Noto'g'ri javoblarni takrorlash rejimiga o'tish
                        setIsReviewingWrong(true);
                        
                        // State'larni tozalash
                        setSelectedOption(null);
                        setIsCorrect(null);
                        setShowConfetti(false);
                        
                        // Yangi vocabulary o'rnatish
                        setVocabulary(wrongAnswers);
                        setCurrentIndex(0);
                        setWrongAnswers([]); // Reset wrong answers for review
                        
                        // Yangi options generatsiya qilish
                        setTimeout(() => {
                            generateOptions(wrongAnswers, 0);
                        }, 100);
                    } else {
                        // Hammasi tugadi - o'yinni tugatish
                        // API so'rovini background'da yuborish
                        recordGameWin();
                        // Darhol modal oynani ko'rsatish
                        setTimeout(() => {
                            setGameOver(true);
                        }, 1000);
                    }
                }
            }, 1000);
        } else {
            // Noto'g'ri javob - ro'yxatga qo'shish
            const currentWord = vocabulary[currentIndex];
            if (!wrongAnswers.find(w => w.word === currentWord.word)) {
                setWrongAnswers(prev => [...prev, currentWord]);
            }
            
            // Keyingi savolga o'tish
            setTimeout(() => {
                if (currentIndex + 1 < vocabulary.length) {
                    setCurrentIndex(prev => prev + 1);
                    generateOptions(vocabulary, currentIndex + 1);
                    setSelectedOption(null);
                    setIsCorrect(null);
                } else {
                    // Asosiy savollar tugadi - noto'g'ri javoblarni tekshirish
                    if (wrongAnswers.length > 0 && !isReviewingWrong) {
                        setIsReviewingWrong(true);
                        
                        // State'larni tozalash
                        setSelectedOption(null);
                        setIsCorrect(null);
                        setShowConfetti(false);
                        
                        const updatedWrongAnswers = [...wrongAnswers, currentWord];
                        setVocabulary(updatedWrongAnswers);
                        setCurrentIndex(0);
                        setWrongAnswers([]); // Reset for review
                        
                        // Yangi options generatsiya qilish
                        setTimeout(() => {
                            generateOptions(updatedWrongAnswers, 0);
                        }, 100);
                    } else {
                        // Review ham tugadi - modal oynani tezroq ko'rsatish
                        setTimeout(() => {
                            setGameOver(true);
                        }, 1000);
                    }
                }
            }, 1000);
        }
    };

    const recordGameWin = async () => {
        try {
            console.log('Recording game win...', { studentId, lessonId });
            const response = await fetch('/api/game-progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ studentId, lessonId })
            });
            const data = await response.json();
            console.log('Game win recorded:', data);
        } catch (error) {
            console.error('Error recording game win:', error);
        }
    };

    const restartGame = () => {
        // Cancel any ongoing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        // Asl barcha so'zlardan yangi shuffle qilish
        const shuffled = [...originalVocabulary].sort(() => Math.random() - 0.5);
        setVocabulary(shuffled);
        setCurrentIndex(0);
        setScore(0);
        setGameOver(false);
        setSelectedOption(null);
        setIsCorrect(null);
        setIsSpeaking(false);
        setWrongAnswers([]);
        setIsReviewingWrong(false);
        setShowConfetti(false);
        generateOptions(shuffled, 0);
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Yuklanmoqda...</span>
                </div>
            </div>
        );
    }

    if (!lesson || vocabulary.length === 0) {
        return (
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light p-4">
                <Frown size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-3">Bu dars uchun lug'at topilmadi</h4>
                <Link href="/dashboard/games" className="btn btn-primary">
                    Orqaga qaytish
                </Link>
            </div>
        );
    }

    if (gameOver) {
        const percentage = Math.round((score / originalVocabulary.length) * 100);

        return (
            <GameOverModal
                won={false}
                score={score}
                total={originalVocabulary.length}
                onRestart={restartGame}
            />
        );
    }

    const currentWord = vocabulary[currentIndex];

    return (
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <div className="bg-white shadow-sm p-3">
                <div className="container">
                    <div className="d-flex align-items-center justify-content-between">
                        <Link href="/dashboard/games" className="btn btn-outline-secondary btn-sm">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="text-center flex-grow-1 mx-3">
                            <h6 className="fw-bold mb-0">{lesson.title}</h6>
                            <small className="text-muted">
                                {isReviewingWrong ? '🔄 Takrorlash rejimi' : 'Lug\'at o\'yini'}
                            </small>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                            <div className="badge bg-success rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                                <Star size={16} />
                                {score}
                            </div>
                            <div className="badge bg-primary rounded-pill px-3 py-2">
                                {currentIndex + 1}/{vocabulary.length}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress" style={{ height: 4, borderRadius: 0 }}>
                <div
                    className="progress-bar bg-success"
                    style={{ width: `${((currentIndex) / vocabulary.length) * 100}%` }}
                />
            </div>

            {/* Game Content */}
            <div className="container py-3" style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
                {/* Question - Show Image */}
                <div className="text-center mb-3">
                    <div
                        className={`card border-0 rounded-4 shadow mx-auto ${isCorrect === false ? 'shake-animation' : ''}`}
                        style={{ 
                            maxWidth: 300,
                            transition: 'opacity 0.3s ease-in-out'
                        }}
                    >
                        <div className="card-body p-3">
                            {currentWord.image ? (
                                <img
                                    key={currentIndex} // Force re-render on change
                                    src={currentWord.image}
                                    alt="?"
                                    className="img-fluid rounded-3 mb-2"
                                    style={{ 
                                        maxHeight: 160, 
                                        objectFit: 'contain',
                                        width: '100%',
                                        animation: 'fadeIn 0.3s ease-in-out'
                                    }}
                                />
                            ) : (
                                <div
                                    className="bg-light rounded-3 d-flex align-items-center justify-content-center mb-2"
                                    style={{ height: 120 }}
                                >
                                    <ImageIcon size={48} className="text-muted" />
                                </div>
                            )}
                            <h5 className="fw-bold text-primary mb-0">
                                {currentWord.translation}
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Confetti Animation */}
                {showConfetti && (
                    <>
                        {/* Party Popper Emoji */}
                        <div
                            className="position-fixed top-50 start-50 translate-middle"
                            style={{
                                zIndex: 9999,
                                fontSize: '120px',
                                animation: 'bounce 0.4s ease-in-out',
                                pointerEvents: 'none'
                            }}
                        >
                            🎉
                        </div>
                        
                        {/* Confetti pieces */}
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="confetti-piece"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    background: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
                                    animationDelay: `${Math.random() * 0.2}s`,
                                    animationDuration: `${1 + Math.random() * 1}s`
                                }}
                            />
                        ))}
                    </>
                )}

                {/* Options */}
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <div className="d-flex flex-column gap-3">
                        {options.map((option, index) => {
                            let shadowColor = '';
                            let borderColor = 'border-primary';
                            
                            if (isCorrect !== null) {
                                if (option.word === vocabulary[currentIndex].word) {
                                    // To'g'ri javob - yashil soya va border
                                    shadowColor = '0 0 25px rgba(25, 135, 84, 0.8), 0 0 50px rgba(25, 135, 84, 0.4)';
                                    borderColor = 'border-success';
                                } else if (option.word === selectedOption.word && !isCorrect) {
                                    // Noto'g'ri tanlangan javob - qizil soya va border
                                    shadowColor = '0 0 25px rgba(220, 53, 69, 0.8), 0 0 50px rgba(220, 53, 69, 0.4)';
                                    borderColor = 'border-danger';
                                }
                            }

                            return (
                                <div 
                                    key={index}
                                    className={`card ${borderColor} bg-white rounded-4 shadow-sm`}
                                    style={{ 
                                        border: '3px solid',
                                        transition: 'all 0.2s',
                                        cursor: isCorrect === null ? 'pointer' : 'default',
                                        boxShadow: shadowColor || undefined
                                    }}
                                    onClick={() => {
                                        if (isCorrect === null) {
                                            handleOptionClick(option);
                                        }
                                    }}
                                >
                                    <div className="card-body p-3 d-flex align-items-center justify-content-between gap-3">
                                        <span className="fw-bold flex-grow-1" style={{ fontSize: '1.3rem' }}>
                                            {option.word}
                                        </span>
                                        <div className="d-flex gap-2">
                                            {/* Listen button with icon */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleListenClick(option, e);
                                                }}
                                                disabled={isCorrect !== null}
                                                className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ 
                                                    width: 48, 
                                                    height: 48,
                                                    border: '2px solid',
                                                    padding: 0,
                                                    flexShrink: 0
                                                }}
                                                title="Eshitish"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                                                </svg>
                                            </button>
                                            {/* Select button with icon */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptionClick(option);
                                                }}
                                                disabled={isCorrect !== null}
                                                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                                                style={{ 
                                                    width: 48, 
                                                    height: 48,
                                                    padding: 0,
                                                    flexShrink: 0
                                                }}
                                                title="Tanlash"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                        20%, 40%, 60%, 80% { transform: translateX(10px); }
                    }
                    
                    @keyframes bounce {
                        0%, 100% { transform: translate(-50%, -50%) scale(1); }
                        50% { transform: translate(-50%, -50%) scale(1.3); }
                    }
                    
                    @keyframes confetti {
                        0% {
                            transform: translateY(-100%) rotate(0deg);
                            opacity: 1;
                        }
                        100% {
                            transform: translateY(100vh) rotate(720deg);
                            opacity: 0;
                        }
                    }
                    
                    .shake-animation {
                        animation: shake 0.5s ease-in-out;
                    }
                    
                    .confetti-piece {
                        position: fixed;
                        width: 10px;
                        height: 10px;
                        background: #f0f;
                        top: -10px;
                        opacity: 0;
                        z-index: 9998;
                        animation: confetti 2s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
}
