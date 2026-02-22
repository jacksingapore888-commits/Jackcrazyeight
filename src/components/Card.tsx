
import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType, Suit } from '../types';
import { SUIT_COLORS } from '../constants';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const SuitIcon = ({ suit, size = 20 }: { suit: Suit, size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} fill="currentColor" />;
    case 'diamonds': return <Diamond size={size} fill="currentColor" />;
    case 'clubs': return <Club size={size} fill="currentColor" />;
    case 'spades': return <Spade size={size} fill="currentColor" />;
  }
};

export const Card: React.FC<CardProps> = ({ card, isFaceUp = true, onClick, isPlayable = false, className = "" }) => {
  return (
    <motion.div
      layoutId={card.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 md:w-32 md:h-48 rounded-xl border-2 bg-white card-shadow cursor-pointer transition-colors
        ${isPlayable ? 'border-yellow-400 ring-4 ring-yellow-400/30' : 'border-zinc-200'}
        ${!isFaceUp ? 'bg-indigo-700 border-white' : ''}
        ${className}
      `}
    >
      {isFaceUp ? (
        <div className={`flex flex-col h-full p-2 md:p-3 ${SUIT_COLORS[card.suit]}`}>
          <div className="flex justify-between items-start">
            <span className="text-lg md:text-2xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
          
          <div className="flex-grow flex items-center justify-center">
            <SuitIcon suit={card.suit} size={48} />
          </div>
          
          <div className="flex justify-between items-end rotate-180">
            <span className="text-lg md:text-2xl font-bold leading-none">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-16 h-24 md:w-24 md:h-36 border-2 border-white/20 rounded-lg flex items-center justify-center">
             <div className="text-white/20 font-display font-black text-4xl italic">8</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
