import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Film, FilmCard } from './film-card';

interface FilmRowProps {
    title: string;
    films: Film[];
}

export function FilmRow({ title, films }: FilmRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (!rowRef.current) return;
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        };
        checkScroll();
        if (rowRef.current) {
            rowRef.current.addEventListener('scroll', checkScroll);
        }
        window.addEventListener('resize', checkScroll);
        return () => {
            if (rowRef.current) {
                rowRef.current.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [films.length]);

    if (!films?.length) return null;

    const handleScrollLeft = () => {
        if (rowRef.current) {
            const scrollAmount = rowRef.current.offsetWidth * 0.8;
            rowRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const handleScrollRight = () => {
        if (rowRef.current) {
            const scrollAmount = rowRef.current.offsetWidth * 0.8;
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="mb-8 md:mb-12">
            <h2 className="mb-3 px-4 text-xl font-bold text-white md:mb-4 md:px-8 md:text-2xl">{title}</h2>
            <div className="relative">
                {/* Left scroll button */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={handleScrollLeft}
                        className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white shadow-lg transition hover:bg-black/90 focus:outline-none"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                )}
                <div
                    ref={rowRef}
                    className="flex w-full gap-4 overflow-x-hidden px-4 pb-4 md:gap-6 md:px-8"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {films.map((film) => (
                        <div key={film.id} className="flex-shrink-0">
                            <FilmCard film={film} className="w-[300px] md:w-[320px]" />
                        </div>
                    ))}
                </div>
                {/* Right scroll button */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={handleScrollRight}
                        className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white shadow-lg transition hover:bg-black/90 focus:outline-none"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                )}
                {/* Gradient fade effect on edges */}
                <div className="pointer-events-none absolute top-0 left-0 h-full w-4 bg-gradient-to-r from-black to-transparent md:w-8"></div>
                <div className="pointer-events-none absolute top-0 right-0 h-full w-4 bg-gradient-to-l from-black to-transparent md:w-8"></div>
            </div>
        </section>
    );
}
