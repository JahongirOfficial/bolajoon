'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, ArrowLeft, Star, Palette, Play } from 'lucide-react';

export default function PopTheBalloonTestPage() {
    const router = useRouter();
    const [balloons, setBalloons] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [targetWord, setTargetWord] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [colorMode, setColorMode] = useState('single'); // 'single' or 'rainbow'
    const [balloonColor, setBalloonColor] = useState('#FF6B9D'); // Default pink

    // Available balloon colors
    const colors = [
        { name: 'Pushti', value: '#FF6B9D' },
        { name: 'Qizil', value: '#EF4444' },
        { name: 'Sariq', value: '#FCD34D' },
        { name: 'Yashil', value: '#10B981' },
        { name: "Ko'k", value: '#3B82F6' },
        { name: 'Binafsha', value: '#A855F7' },
        { name: 'Apelsin', value: '#F97316' },
        { name: 'Pushti-binafsha', value: '#EC4899' },
    ];

    // Test vocabulary
    const vocabulary = [
        { word: 'Apple', translation: 'Olma', image: '🍎' },
        { word: 'Book', translation: 'Kitob', image: '📚' },
        { word: 'Cat', translation: 'Mushuk', image: '🐱' },
        { word: 'Dog', translation: 'It', image: '🐕' },
        { word: 'House', translation: 'Uy', image: '🏠' },
        { word: 'Car', translation: 'Mashina', image: '🚗' },
        { word: 'Tree', translation: "Daraxt", image: '🌳' },
        { word: 'Sun', translation: 'Quyosh', image: '☀️' },
    ];

    useEffect(() => {
        if (!gameStarted) return;
        startNewRound();
    }, [gameStarted]);

    const startNewRound = () => {
        // Select random target word
        const target = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        setTargetWord(target);

        // Create balloons with correct and wrong answers
        const newBalloons = [];
        const usedPositions = [];
        
        // Helper function to check if position overlaps with existing balloons
        const isOverlapping = (x, y) => {
            return usedPositions.some(pos => {
                const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
                return distance < 25; // Minimum distance between balloons
            });
        };
        
        // Helper function to get random color
        const getRandomColor = () => {
            return colors[Math.floor(Math.random() * colors.length)].value;
        };
        
        // Create correct balloon
        let x, y;
        do {
            x = Math.random() * 60 + 15; // 15-75%
            y = 100;
        } while (isOverlapping(x, y));
        
        usedPositions.push({ x, y });
        
        const correctBalloon = {
            id: Date.now(),
            word: target.translation,
            isCorrect: true,
            x: x,
            y: y,
            speed: Math.random() * 0.5 + 0.6, // 0.6-1.1 (slower)
            color: colorMode === 'rainbow' ? getRandomColor() : balloonColor
        };
        newBalloons.push(correctBalloon);

        // Add wrong balloons
        const wrongWords = vocabulary.filter(v => v.word !== target.word);
        for (let i = 0; i < 3; i++) {
            const wrongWord = wrongWords[Math.floor(Math.random() * wrongWords.length)];
            
            // Find non-overlapping position
            let attempts = 0;
            do {
                x = Math.random() * 60 + 15;
                y = 100 + (i * 30) + Math.random() * 10;
                attempts++;
            } while (isOverlapping(x, y) && attempts < 50);
            
            usedPositions.push({ x, y });
            
            newBalloons.push({
                id: Date.now() + i + 1,
                word: wrongWord.translation,
                isCorrect: false,
                x: x,
                y: y,
                speed: Math.random() * 0.5 + 0.6, // 0.6-1.1 (slower)
                color: colorMode === 'rainbow' ? getRandomColor() : balloonColor
            });
        }

        setBalloons(newBalloons);
    };

    useEffect(() => {
        if (gameOver || !targetWord || !gameStarted) return;

        const interval = setInterval(() => {
            setBalloons(prev => {
                const updated = prev.map(balloon => ({
                    ...balloon,
                    y: balloon.y - balloon.speed
                })).filter(balloon => balloon.y > -10);

                // Check if correct balloon escaped
                const correctEscaped = prev.some(b => b.isCorrect && b.y <= -10);
                if (correctEscaped) {
                    setGameOver(true);
                }

                return updated;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [gameOver, targetWord, gameStarted]);

    const popBalloon = (balloon) => {
        if (balloon.isCorrect) {
            setScore(score + 1);
            setBalloons(prev => prev.filter(b => b.id !== balloon.id));
            setTimeout(startNewRound, 500);
        } else {
            setGameOver(true);
        }
    };

    const restartGame = () => {
        setScore(0);
        setGameOver(false);
        setGameStarted(false);
        setBalloons([]);
        setTargetWord(null);
    };

    const startGame = () => {
        setGameStarted(true);
        setScore(0);
        setGameOver(false);
    };

    if (gameOver) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#87CEEB' }}>
                <div className="text-center">
                    <div className="mb-4" style={{ fontSize: '80px' }}>
                        {score >= 5 ? '🎉' : score >= 3 ? '👍' : '💪'}
                    </div>
                    <h1 className="display-4 fw-bold mb-3 text-white">O'yin tugadi!</h1>
                    <p className="h3 mb-4 text-white">
                        Natija: <span style={{ color: '#FFD700' }}>{score}</span> ta shar
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button onClick={restartGame} className="btn btn-light btn-lg rounded-3 d-flex align-items-center gap-2">
                            <RotateCcw size={20} />
                            Qayta o'ynash
                        </button>
                        <button onClick={() => router.push('/admin/games-test')} className="btn btn-outline-light btn-lg rounded-3 d-flex align-items-center gap-2">
                            <ArrowLeft size={20} />
                            Orqaga
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 position-relative overflow-hidden" style={{ backgroundColor: '#87CEEB' }}>
            {/* Header */}
            <div className="position-absolute top-0 start-0 end-0 bg-white bg-opacity-75 py-3 px-4" style={{ zIndex: 100 }}>
                <div className="d-flex align-items-center justify-content-between">
                    <button onClick={() => router.push('/admin/games-test')} className="btn btn-light rounded-circle">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h5 className="fw-bold mb-0">Sharni yorish</h5>
                        {targetWord && (
                            <div className="d-flex align-items-center gap-2 justify-content-center mt-1">
                                <span style={{ fontSize: '24px' }}>{targetWord.image}</span>
                                <span className="fw-bold">{targetWord.word}</span>
                            </div>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <button 
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="btn btn-light rounded-circle position-relative"
                            title="Rang tanlash"
                        >
                            <Palette size={20} />
                        </button>
                        <div className="badge bg-warning rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                            <Star size={16} />
                            {score}
                        </div>
                    </div>
                </div>

                {/* Color Picker Dropdown */}
                {showColorPicker && (
                    <div className="position-absolute top-100 end-0 me-4 mt-2 bg-white rounded-4 shadow-lg p-3" style={{ zIndex: 101, minWidth: '220px' }}>
                        <h6 className="fw-bold mb-3 small">Shar rangini tanlang</h6>
                        
                        {/* Color Mode Toggle */}
                        <div className="mb-3">
                            <div className="btn-group w-100" role="group">
                                <button
                                    onClick={() => setColorMode('single')}
                                    className={`btn btn-sm ${colorMode === 'single' ? 'btn-primary' : 'btn-outline-primary'}`}
                                >
                                    Bir rang
                                </button>
                                <button
                                    onClick={() => setColorMode('rainbow')}
                                    className={`btn btn-sm ${colorMode === 'rainbow' ? 'btn-primary' : 'btn-outline-primary'}`}
                                >
                                    🌈 Rangbarang
                                </button>
                            </div>
                        </div>

                        {/* Single Color Picker */}
                        {colorMode === 'single' && (
                            <div className="row g-2">
                                {colors.map((color) => (
                                    <div key={color.value} className="col-6">
                                        <button
                                            onClick={() => {
                                                setBalloonColor(color.value);
                                                setShowColorPicker(false);
                                            }}
                                            className={`btn w-100 rounded-3 d-flex align-items-center gap-2 ${
                                                balloonColor === color.value ? 'border-3' : ''
                                            }`}
                                            style={{
                                                backgroundColor: color.value,
                                                color: 'white',
                                                border: balloonColor === color.value ? '3px solid #000' : '1px solid #ddd',
                                                fontSize: '11px',
                                                padding: '6px'
                                            }}
                                        >
                                            <span style={{ fontSize: '18px' }}>🎈</span>
                                            <span className="fw-semibold">{color.name}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {colorMode === 'rainbow' && (
                            <div className="text-center p-3">
                                <div style={{ fontSize: '60px' }}>🌈</div>
                                <p className="small text-muted mb-0">Har bir shar turli rangda bo'ladi</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Game Area */}
            <div className="position-relative" style={{ height: '100vh', paddingTop: '100px' }}>
                {!gameStarted ? (
                    /* Start Screen */
                    <div className="d-flex align-items-center justify-content-center" style={{ height: 'calc(100vh - 200px)' }}>
                        <div className="text-center">
                            <div style={{ fontSize: '100px', marginBottom: '20px' }}>🎈🎈🎈</div>
                            <h2 className="fw-bold text-white mb-3" style={{ fontSize: '36px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                Sharni yorish o'yini
                            </h2>
                            <p className="text-white mb-4" style={{ fontSize: '18px', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                                To'g'ri tarjimani toping va sharni bosing!
                            </p>
                            <button
                                onClick={startGame}
                                className="btn btn-light btn-lg rounded-4 px-5 py-3 fw-bold shadow-lg"
                                style={{ fontSize: '24px' }}
                            >
                                <Play size={28} className="me-2" style={{ verticalAlign: 'middle' }} />
                                Boshlash
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Game Balloons */
                    balloons.map(balloon => (
                        <div
                            key={balloon.id}
                            onClick={() => popBalloon(balloon)}
                            className="position-absolute"
                            style={{
                                left: `${balloon.x}%`,
                                bottom: `${balloon.y}%`,
                                cursor: 'pointer',
                                transition: 'transform 0.1s',
                                transform: 'scale(1)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div className="text-center">
                                <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        backgroundColor: balloon.color,
                                        fontSize: '18px',
                                        padding: '20px',
                                        border: '3px solid rgba(255,255,255,0.3)',
                                        wordWrap: 'break-word',
                                        lineHeight: '1.2'
                                    }}
                                >
                                    {balloon.word}
                                </div>
                                <div style={{ fontSize: '70px', marginTop: '-18px' }}>🎈</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Instructions */}
            {gameStarted && (
                <div className="position-absolute bottom-0 start-0 end-0 bg-white bg-opacity-75 py-3 text-center">
                    <p className="mb-0 fw-semibold">
                        To'g'ri tarjimani toping va sharni bosing!
                    </p>
                </div>
            )}
        </div>
    );
}
