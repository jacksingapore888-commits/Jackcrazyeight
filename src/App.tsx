import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card as CardComponent } from './components/Card';
import { SuitSelector } from './components/SuitSelector';
import { Card, GameState, Suit, GameStatus } from './types';
import { createDeck, shuffle, SUITS } from './constants';
import { Trophy, RotateCcw, Info, ChevronRight } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: null,
    turn: 'player',
    status: 'waiting',
    winner: null,
    lastAction: 'Welcome to Crazy Eights!'
  });

  const [pendingEight, setPendingEight] = useState<Card | null>(null);

  const initGame = () => {
    const fullDeck = shuffle(createDeck());
    const playerHand = fullDeck.splice(0, 8);
    const aiHand = fullDeck.splice(0, 8);
    
    // Initial discard must not be an 8 for simplicity in first turn
    let initialDiscardIndex = 0;
    while (fullDeck[initialDiscardIndex].rank === '8') {
      initialDiscardIndex++;
    }
    const discardPile = [fullDeck.splice(initialDiscardIndex, 1)[0]];
    
    setState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile,
      currentSuit: discardPile[0].suit,
      turn: 'player',
      status: 'playing',
      winner: null,
      lastAction: 'Game started! Your turn.'
    });
  };

  const checkValidMove = (card: Card, topCard: Card, currentSuit: Suit | null) => {
    if (card.rank === '8') return true;
    return card.suit === currentSuit || card.rank === topCard.rank;
  };

  const playCard = (card: Card, isPlayer: boolean) => {
    const topCard = state.discardPile[state.discardPile.length - 1];
    
    if (!checkValidMove(card, topCard, state.currentSuit)) return;

    if (card.rank === '8') {
      if (isPlayer) {
        setPendingEight(card);
        setState(prev => ({ ...prev, status: 'choosing_suit' }));
      } else {
        // AI logic for choosing suit: pick the suit it has most of
        const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
        state.aiHand.forEach(c => {
          if (c.id !== card.id) suitCounts[c.suit]++;
        });
        const bestSuit = (Object.entries(suitCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]) as Suit;
        executePlay(card, isPlayer, bestSuit);
      }
    } else {
      executePlay(card, isPlayer, card.suit);
    }
  };

  const executePlay = (card: Card, isPlayer: boolean, newSuit: Suit) => {
    setState(prev => {
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = hand.filter(c => c.id !== card.id);
      const newDiscard = [...prev.discardPile, card];
      const nextTurn = isPlayer ? 'ai' : 'player';
      
      let winner = prev.winner;
      let status = prev.status;
      if (newHand.length === 0) {
        winner = isPlayer ? 'player' : 'ai';
        status = 'game_over';
      }

      return {
        ...prev,
        playerHand: isPlayer ? newHand : prev.playerHand,
        aiHand: isPlayer ? prev.aiHand : newHand,
        discardPile: newDiscard,
        currentSuit: newSuit,
        turn: nextTurn as 'player' | 'ai',
        status: status as GameStatus,
        winner,
        lastAction: `${isPlayer ? 'You' : 'AI'} played ${card.rank} of ${card.suit}${card.rank === '8' ? `. New suit: ${newSuit}` : ''}`
      };
    });
    setPendingEight(null);
  };

  const drawCard = (isPlayer: boolean) => {
    if (state.deck.length === 0) {
      setState(prev => ({
        ...prev,
        turn: isPlayer ? 'ai' : 'player',
        lastAction: 'Deck empty! Turn skipped.'
      }));
      return;
    }

    setState(prev => {
      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = [...hand, drawnCard];
      
      return {
        ...prev,
        deck: newDeck,
        playerHand: isPlayer ? newHand : prev.playerHand,
        aiHand: isPlayer ? prev.aiHand : newHand,
        turn: isPlayer ? 'ai' : 'player',
        lastAction: `${isPlayer ? 'You' : 'AI'} drew a card.`
      };
    });
  };

  // AI Turn logic
  useEffect(() => {
    if (state.status === 'playing' && state.turn === 'ai' && !state.winner) {
      const timer = setTimeout(() => {
        const topCard = state.discardPile[state.discardPile.length - 1];
        const playableCards = state.aiHand.filter(c => checkValidMove(c, topCard, state.currentSuit));
        
        if (playableCards.length > 0) {
          // AI Strategy: Play non-8s first, then 8s
          const nonEights = playableCards.filter(c => c.rank !== '8');
          const cardToPlay = nonEights.length > 0 ? nonEights[Math.floor(Math.random() * nonEights.length)] : playableCards[0];
          playCard(cardToPlay, false);
        } else {
          drawCard(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.turn, state.status]);

  const handleSuitSelect = (suit: Suit) => {
    if (pendingEight) {
      executePlay(pendingEight, true, suit);
      setState(prev => ({ ...prev, status: 'playing' }));
    }
  };

  const topCard = state.discardPile[state.discardPile.length - 1];

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      {/* Header / Status */}
      <div className="w-full max-w-6xl flex justify-between items-center z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tighter text-white drop-shadow-lg">
            CRAZY <span className="text-yellow-400 italic">8</span>S
          </h1>
          <p className="text-emerald-200 font-medium text-sm md:text-base">{state.lastAction}</p>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={initGame}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Restart Game"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      {/* AI Hand */}
      <div className="w-full flex justify-center py-4">
        <div className="flex -space-x-12 md:-space-x-16 hover:space-x-2 transition-all duration-500">
          {state.aiHand.map((card, idx) => (
            <CardComponent key={card.id} card={card} isFaceUp={false} className="rotate-180" />
          ))}
          {state.aiHand.length === 0 && state.status === 'playing' && (
             <div className="text-white/20 font-display text-2xl">Empty Hand</div>
          )}
        </div>
      </div>

      {/* Center Area: Deck & Discard */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-24 z-10">
        {/* Draw Pile */}
        <div className="relative group">
          <div className="absolute inset-0 bg-black/20 rounded-xl translate-y-2 translate-x-2 blur-sm" />
          <div 
            onClick={() => state.turn === 'player' && state.status === 'playing' && drawCard(true)}
            className={`
              relative w-24 h-36 md:w-32 md:h-48 rounded-xl border-2 border-white bg-indigo-800 card-shadow cursor-pointer
              flex items-center justify-center transition-transform active:scale-95
              ${state.turn === 'player' && state.status === 'playing' ? 'hover:-translate-y-2 ring-4 ring-yellow-400/50' : 'opacity-80 grayscale'}
            `}
          >
            <div className="flex flex-col items-center">
              <span className="text-white font-display font-bold text-xl md:text-2xl mb-1">DECK</span>
              <span className="text-indigo-300 font-mono text-sm">{state.deck.length}</span>
            </div>
          </div>
          {state.turn === 'player' && state.status === 'playing' && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-emerald-900 px-3 py-1 rounded-full text-xs font-bold animate-bounce whitespace-nowrap">
              DRAW CARD
            </div>
          )}
        </div>

        {/* Discard Pile */}
        <div className="relative">
          <div className="absolute inset-0 bg-black/20 rounded-xl translate-y-2 translate-x-2 blur-sm" />
          <AnimatePresence mode="popLayout">
            {topCard && (
              <CardComponent 
                key={topCard.id} 
                card={topCard} 
                className="relative z-10"
              />
            )}
          </AnimatePresence>
          
          {/* Current Suit Indicator for 8s */}
          {state.currentSuit && (
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col items-center">
               <div className="text-emerald-200 text-[10px] font-bold uppercase tracking-widest mb-1">Current Suit</div>
               <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20">
                  {state.currentSuit === 'hearts' && <span className="text-red-500 text-2xl">♥</span>}
                  {state.currentSuit === 'diamonds' && <span className="text-red-500 text-2xl">♦</span>}
                  {state.currentSuit === 'clubs' && <span className="text-zinc-900 text-2xl">♣</span>}
                  {state.currentSuit === 'spades' && <span className="text-zinc-900 text-2xl">♠</span>}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div className="w-full max-w-6xl flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
          {state.playerHand.map((card) => (
            <CardComponent 
              key={card.id} 
              card={card} 
              isPlayable={state.turn === 'player' && state.status === 'playing' && checkValidMove(card, topCard, state.currentSuit)}
              onClick={() => playCard(card, true)}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className={`px-6 py-2 rounded-full font-display font-bold text-lg transition-all ${state.turn === 'player' ? 'bg-yellow-400 text-emerald-900 scale-110 shadow-xl' : 'bg-white/10 text-white/40'}`}>
            YOUR TURN
          </div>
          <div className={`px-6 py-2 rounded-full font-display font-bold text-lg transition-all ${state.turn === 'ai' ? 'bg-indigo-500 text-white scale-110 shadow-xl' : 'bg-white/10 text-white/40'}`}>
            AI THINKING
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {state.status === 'waiting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="text-center p-8 max-w-lg">
              <h2 className="text-6xl font-display font-black text-white mb-4 tracking-tighter">
                JACK'S <span className="text-yellow-400">8</span>S
              </h2>
              <p className="text-emerald-200 mb-8 text-lg">
                The classic card game of Crazy Eights. Match the suit or rank, play 8s as wild cards, and empty your hand to win!
              </p>
              <button 
                onClick={initGame}
                className="group relative px-12 py-4 bg-yellow-400 text-emerald-900 font-display font-black text-2xl rounded-2xl hover:bg-yellow-300 transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10">START GAME</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>
          </motion.div>
        )}

        {state.status === 'choosing_suit' && (
          <SuitSelector onSelect={handleSuitSelect} />
        )}

        {state.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="bg-white p-12 rounded-[40px] shadow-2xl text-center max-w-md w-full mx-4">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${state.winner === 'player' ? 'bg-yellow-100 text-yellow-600' : 'bg-zinc-100 text-zinc-600'}`}>
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-display font-black text-zinc-900 mb-2">
                {state.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-zinc-500 mb-8 font-medium">
                {state.winner === 'player' ? 'You cleared your hand first. Master strategist!' : 'The AI outplayed you this time. Try again?'}
              </p>
              <button 
                onClick={initGame}
                className="w-full py-4 bg-zinc-900 text-white font-display font-bold text-xl rounded-2xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                PLAY AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
