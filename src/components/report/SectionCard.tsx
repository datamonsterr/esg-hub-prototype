'use client';

import { ReactNode, useState } from 'react';
import { H3, Button } from '../ui';
import { PencilIcon } from 'lucide-react';

interface Props {
  title: string;
  /**
   * Optional custom popup renderer. Receives a `close` callback to hide the popup.
   * If provided, the built-in Edit button toggles its visibility.
   */
  renderPopup?: (close: () => void) => ReactNode;
  /** Optional additional click handler */
  onEdit?: () => void;
  children: ReactNode;
}

export const SectionCard = ({ title, renderPopup, onEdit, children }: Props) => {
  const [showPopup, setShowPopup] = useState(false);

  const hasPopup = !!renderPopup;

  const handleClick = () => {
    if (hasPopup) {
      setShowPopup((prev) => !prev);
    }
    onEdit?.();
  };

  return (
    <section className="bg-white rounded-lg p-8 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <H3 className="border-b border-border pb-2 text-2xl">{title}</H3>
        {(renderPopup || onEdit) && (
          <div className="relative">
            <Button
              variant={showPopup ? 'primary' : 'outline'}
              className={`text-sm px-3 py-1 border-primary ${showPopup ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary hover:text-white'}`}
              onClick={handleClick}
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              <span>Edit</span>
            </Button>

            {hasPopup && showPopup && (
              <div className="absolute right-0 top-full mt-2 z-10">
                {renderPopup(() => setShowPopup(false))}
              </div>
            )}
          </div>
        )}
      </div>

      {children}
    </section>
  );
}; 