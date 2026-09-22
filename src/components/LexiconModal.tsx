import React, { useState } from 'react';
import type { Card, VocabDifficulty, DictionaryEntry } from '../types/game';
import { DICTIONARY_WORDS, getRandomDistractors } from '../data/dictionary';
import { sound } from '../utils/audio';
import { 
  BookOpen, 
  Volume2, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Sparkles, 
  Award,
  X
} from 'lucide-react';

interface LexiconModalProps {
  deckCards: Card[];
  onClose: () => void;
  onPracticeReward?: (gold: number) => void;
}

export const LexiconModal: React.FC<LexiconModalProps> = ({
  deckCards,
  onClose,
  onPracticeReward,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'needReview' | 'mastered' | 'quiz'>('all');
  const [tierFilter, setTierFilter] = useState<VocabDifficulty>('all');

  // Quiz Mode state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizCards, setQuizCards] = useState<DictionaryEntry[]>([]);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);

  // Calculate stats from deck
  const deckWordsMap = new Map<string, Card>();
  deckCards.forEach((c) => {
    deckWordsMap.set(c.word.toLowerCase(), c);
  });

  const reviewNeededWords = DICTIONARY_WORDS.filter((v) => {
    const matched = deckWordsMap.get(v.word.toLowerCase());
    return matched && matched.needReview;
  });

  const masteredWords = DICTIONARY_WORDS.filter((v) => {
    const matched = deckWordsMap.get(v.word.toLowerCase());
    return matched && matched.masteryCount > 0;
  });

  // Filter words from 150+ dictionary database
  const filteredWords = DICTIONARY_WORDS.filter((word) => {
    // Search
    const matchesSearch = 
      word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.meaning.includes(searchTerm) ||
      (word.etymology && word.etymology.includes(searchTerm));
    if (!matchesSearch) return false;

    // Tier
    if (tierFilter !== 'all' && word.tier !== tierFilter) return false;

    // Tab
    if (activeTab === 'needReview') {
      const match = deckWordsMap.get(word.word.toLowerCase());
      return match && match.needReview;
    }
    if (activeTab === 'mastered') {
      const match = deckWordsMap.get(word.word.toLowerCase());
      return match && match.masteryCount > 0;
    }

    return true;
  });

  // Helper to generate options for a quiz question
  const prepareQuizOptions = (wordEntry: DictionaryEntry) => {
    const distractors = getRandomDistractors(wordEntry.word, wordEntry.meaning, wordEntry.pos, 3);
    const opts = [wordEntry.meaning, ...distractors];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  };

  // Start mini quiz from the 150+ dictionary database
  const handleStartQuiz = () => {
    const shuffled = [...DICTIONARY_WORDS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuizCards(shuffled);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setActiveTab('quiz');
    if (shuffled.length > 0) {
      sound.speakWord(shuffled[0].word);
      setQuizOptions(prepareQuizOptions(shuffled[0]));
    }
  };

  const handleQuizAnswer = (selectedMeaning: string) => {
    const currentCard = quizCards[quizIndex];
    if (selectedMeaning === currentCard.meaning) {
      sound.playCritical();
      setQuizScore((s) => s + 1);
    } else {
      sound.playEnemyHit();
    }

    const nextIndex = quizIndex + 1;
    if (nextIndex < quizCards.length) {
      setQuizIndex(nextIndex);
      sound.speakWord(quizCards[nextIndex].word);
      setQuizOptions(prepareQuizOptions(quizCards[nextIndex]));
    } else {
      setQuizFinished(true);
      if (onPracticeReward) {
        onPracticeReward((quizScore + 1) * 10);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 12, 0.92)',
      backdropFilter: 'blur(10px)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      padding: 'max(8px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(8px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderBottom: '1px solid var(--border-gold)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BookOpen size={24} color="#38bdf8" />
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '20px' }}>
            词汇圣典与生词本 (Lexicon & Mnemonic)
          </h2>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={26} />
        </button>
      </div>

      {/* STATS OVERVIEW BAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>全库词汇总量</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
            {DICTIONARY_WORDS.length} 词
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>当前卡组已编入</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {deckCards.length} 张
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid #ef4444',
        }}>
          <div style={{ fontSize: '11px', color: '#fca5a5' }}>生词待复习库</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
            {reviewNeededWords.length} 词
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 8,
          padding: '10px 14px',
          border: '1px solid #22c55e',
        }}>
          <div style={{ fontSize: '11px', color: '#86efac' }}>成功暴击掌握</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80', fontFamily: 'var(--font-mono)' }}>
            {masteredWords.length} 词
          </div>
        </div>
      </div>

      {/* CONTROLS: TABS & SEARCH */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('all')}
            className="spire-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: activeTab === 'all' ? '#2563eb' : undefined,
              borderColor: activeTab === 'all' ? '#60a5fa' : undefined,
            }}
          >
            全部词典 ({DICTIONARY_WORDS.length})
          </button>

          <button
            onClick={() => setActiveTab('needReview')}
            className="spire-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: activeTab === 'needReview' ? '#991b1b' : undefined,
              borderColor: activeTab === 'needReview' ? '#ef4444' : undefined,
              color: '#fca5a5',
            }}
          >
            <AlertCircle size={13} />
            生词本 ({reviewNeededWords.length})
          </button>

          <button
            onClick={() => setActiveTab('mastered')}
            className="spire-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: activeTab === 'mastered' ? '#166534' : undefined,
              borderColor: activeTab === 'mastered' ? '#4ade80' : undefined,
              color: '#86efac',
            }}
          >
            <CheckCircle size={13} />
            已掌握 ({masteredWords.length})
          </button>

          <button
            onClick={handleStartQuiz}
            className="spire-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderColor: '#f59e0b',
              color: '#fef08a',
            }}
          >
            <Sparkles size={13} />
            随堂速测 (赚金币)
          </button>
        </div>

        {/* Search Bar & Tier Filter */}
        {activeTab !== 'quiz' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 6,
              padding: '4px 8px',
              gap: 6,
            }}>
              <Search size={14} color="#94a3b8" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索单词 / 词义 / 词根..."
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f8fafc',
                  fontSize: '12px',
                  outline: 'none',
                  width: '150px',
                }}
              />
            </div>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as VocabDifficulty)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 6,
                color: '#f8fafc',
                fontSize: '12px',
                padding: '5px 8px',
                outline: 'none',
              }}
            >
              <option value="all">全词库难度</option>
              <option value="cet46">四六级 (CET-4/6)</option>
              <option value="ielts">雅思 (IELTS)</option>
              <option value="toefl">托福 (TOEFL)</option>
              <option value="gre">GRE / 高阶</option>
            </select>
          </div>
        )}
      </div>

      {/* CONTENT: WORD LIST OR QUIZ */}
      {activeTab !== 'quiz' ? (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
          paddingRight: 6,
        }}>
          {filteredWords.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1 / -1', padding: 40 }}>
              未找到匹配的词汇条目。
            </div>
          ) : (
            filteredWords.map((item) => {
              const inDeck = deckWordsMap.get(item.word.toLowerCase());
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: inDeck ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.5)',
                    border: inDeck?.needReview 
                      ? '1px solid #ef4444' 
                      : inDeck?.masteryCount 
                      ? '1px solid #22c55e' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header: Word + Pronounce + Tier */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '18px',
                          fontWeight: 900,
                          color: '#f8fafc',
                          textTransform: 'capitalize',
                        }}>
                          {item.word}
                        </span>
                        <button
                          onClick={() => sound.speakWord(item.word)}
                          title="发音"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#cbd5e1',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Volume2 size={12} />
                        </button>
                      </div>

                      <span style={{
                        fontSize: '10px',
                        color: '#60a5fa',
                        backgroundColor: 'rgba(96, 165, 250, 0.15)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}>
                        {item.tier}
                      </span>
                    </div>

                    {/* Phonetic & Meaning */}
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                      {item.pos} {item.phonetic}
                    </div>

                    <div style={{ fontSize: '13px', color: '#fef08a', fontWeight: 600, marginBottom: 8 }}>
                      {item.meaning}
                    </div>

                    {/* Etymology */}
                    {item.etymology && (
                      <div style={{
                        fontSize: '11px',
                        color: '#cbd5e1',
                        backgroundColor: 'rgba(0, 0, 0, 0.35)',
                        padding: '6px 8px',
                        borderRadius: 4,
                        marginBottom: 6,
                      }}>
                        💡 <strong style={{ color: '#bae6fd' }}>词源助记：</strong>{item.etymology}
                      </div>
                    )}

                    {/* Example Sentence */}
                    {item.exampleSentence && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginBottom: 2 }}>
                        “{item.exampleSentence}”
                      </div>
                    )}
                    {item.exampleTranslation && (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        （{item.exampleTranslation}）
                      </div>
                    )}
                  </div>

                  {/* Card Status footer */}
                  <div style={{
                    marginTop: 10,
                    paddingTop: 8,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                  }}>
                    <span style={{ color: inDeck ? '#38bdf8' : '#64748b' }}>
                      {inDeck ? `卡牌类型: ${inDeck.type.toUpperCase()}` : '尚未加入卡组'}
                    </span>

                    {inDeck && inDeck.needReview && (
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>⚠️ 曾回忆失误</span>
                    )}
                    {inDeck && inDeck.masteryCount > 0 && (
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>🌟 成功唤醒 {inDeck.masteryCount} 次</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* QUIZ MODE */
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 500,
          margin: '0 auto',
          width: '100%',
        }}>
          {!quizFinished ? (
            <div style={{
              backgroundColor: '#161926',
              border: '2px solid var(--border-gold)',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: 8 }}>
                题目 {quizIndex + 1} / {quizCards.length}
              </div>

              <div style={{
                fontSize: '28px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                color: '#f8fafc',
                textTransform: 'capitalize',
                marginBottom: 4,
              }}>
                {quizCards[quizIndex]?.word}
              </div>

              <div style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
                {quizCards[quizIndex]?.pos} {quizCards[quizIndex]?.phonetic}
              </div>

              {/* Quiz Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quizOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(opt)}
                    className="spire-btn"
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <span style={{ color: '#facc15', marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#161926',
              border: '2px solid var(--border-gold)',
              borderRadius: 12,
              padding: 28,
              width: '100%',
              textAlign: 'center',
            }}>
              <Award size={48} color="#facc15" style={{ marginBottom: 12 }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fbbf24', fontSize: '22px', marginBottom: 8 }}>
                测验完成！
              </h3>
              <p style={{ color: '#f8fafc', fontSize: '16px', marginBottom: 4 }}>
                本次成绩: <strong style={{ color: '#4ade80' }}>{quizScore}</strong> / {quizCards.length}
              </p>
              <p style={{ color: '#fbbf24', fontSize: '13px', marginBottom: 20 }}>
                获得奖励：+{quizScore * 10} 金币！
              </p>

              <button
                onClick={() => setActiveTab('all')}
                className="spire-btn"
                style={{ padding: '8px 24px' }}
              >
                返回词汇圣典
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
