import Hero from '@/components/home/hero';
import Partnership from '@/components/home/partnership';

import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useRef } from 'react';

export default function Home() {
    const { activeEvent, images } = usePage<SharedData & { activeEvent?: any; images: string[] }>().props;
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div ref={containerRef}>
                <Header autoHide className="[&>*]:text-white" />
                <Hero activeEvent={activeEvent} images={images} />

                <Partnership />
                <Footer />
            </div>
        </>
    );
}
