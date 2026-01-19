import MadrasaLogo from '~/public/images/habrul ummah model madrasa logo.svg';

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Home() {
  // const sliderImages = [MadrashaHomeBg];

  return (
    <>
      {/* <BackgroundSlider images={sliderImages} /> */}
      <main className="relative flex flex-col bg-primary gap-8 items-center justify-center text-center w-full mx-auto px-4 py-8 min-h-screen w-full">
        <div className="flex justify-center">
          <Image
            src={MadrasaLogo}
            alt="Habrul Ummah Model Madrasa Logo"
            width={600}
            height={240}
            className="h-48 w-auto sm:h-56 object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
          Habrul Ummah Model Madrasa
        </h1>
        <h5 className="text-2xl md:text-3xl">Rajibpur, Sadar, Laxmipur 3720</h5>

        <Link href="/dashboard/overview">
          <Button
            size="lg"
            className="cursor-pointer text-black bg-white font-semibold shadow-xl px-8 py-3 dark:text-black hover:bg-gray-100"
          >
            Go to Dashboard
          </Button>
        </Link>
      </main>
    </>
  );
}
