import { cn } from '@/lib/utils';
import { ContactIcon, InstagramIcon, PhoneIcon, YoutubeIcon } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import SafeWidth from '../safe-width';
import { Button } from '../ui/button';

interface Social {
    icon: ReactNode;
    label: string;
    url: string;
}

const socials: Social[] = [
    {
        icon: <ContactIcon className="size-8 md:size-10" />,
        label: '@dhanuprys',
        url: 'https://instagram.com/dhanuprys',
    },
    {
        icon: <InstagramIcon className="size-8 md:size-10" />,
        label: '@dhanuprys',
        url: 'https://instagram.com/dhanuprys',
    },
    {
        icon: <YoutubeIcon className="size-8 md:size-10" />,
        label: '@dhanuprys',
        url: 'https://instagram.com/dhanuprys',
    },
];

const images = ['/assets/images/1.avif', '/assets/images/2.avif'];

export default function Hero() {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);

    useEffect(() => {
        let currentIndex = 0;
        const counter = setInterval(() => {
            if (currentIndex >= images.length - 1) {
                currentIndex = -1;
            }

            currentIndex++;
            setActiveSlideIndex(currentIndex);
        }, 4000);

        return () => clearInterval(counter);
    }, []);

    return (
        <div className="relative flex h-screen flex-col items-center justify-center">
            <div className="absolute top-0 left-0 size-full bg-black">
                {images.map((image) => (
                    <img
                        key={image}
                        className={cn(
                            'absolute top-0 left-0 size-full object-cover opacity-0 transition-opacity duration-1000',
                            image === images[activeSlideIndex] && 'opacity-10',
                        )}
                        src={image}
                    />
                ))}
            </div>
            <SafeWidth className="relative z-[1] space-y-4 text-white">
                <h1 className="font-luckiest text-center text-6xl md:text-8xl">Terhubung Bersama Komunitas Sinema.</h1>
                <p className="mx-auto max-w-[65rem] text-center md:text-2xl">
                    Film Festival Nitisara membuka ruang dialog bagi sineas, penonton, partner, dan komunitas. Punya
                    ide, pertanyaan, atau ingin berkolaborasi? Tim kami siap mendengar.
                </p>
                {/* <div className="flex justify-center gap-x-2">
                    {socials.map(({ icon: SocialIcon, label, url }) => (
                        <div className="rounded-2xl p-4 hover:bg-slate-100">{SocialIcon}</div>
                    ))}
                </div> */}
                <div className="flex justify-center gap-x-2">
                    <a href="https://wa.me/6285858918243">
                        <Button className="mt-4 rounded-full bg-white !px-6 !py-8 font-bold text-black hover:cursor-pointer hover:bg-white/60 md:!px-8 md:!py-8">
                            <PhoneIcon className="size-8" />
                            <span className="text-xl">Hubungi Admin</span>
                        </Button>
                    </a>
                </div>
            </SafeWidth>
        </div>
    );
}
