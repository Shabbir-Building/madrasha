import MadrasaLogo from '~/public/images/habrul ummah model madrasa logo.svg';
import MadrashaImage1 from '~/public/images/madrasha-images-1.png';
import MadrashaImage2 from '~/public/images/madrasha-images-2.jpg';
import MadrashaImage3 from '~/public/images/madrasha-images-3.jpg';

import Image from 'next/image';
import Link from 'next/link';

import BackgroundSlider from '@/components/ui/background-slider';
import { Button } from '@/components/ui/button';

export default function Home() {
  const sliderImages = [MadrashaImage2, MadrashaImage3];

  return (
    <>
      <BackgroundSlider images={sliderImages} />
      <main className="relative flex flex-col gap-8 items-center justify-center text-center max-w-2xl mx-auto px-4 py-8 min-h-screen w-full">
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

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg text-balance">
          Habrul Ummah Model Madrasa
        </h1>

        <Link href="/dashboard/overview">
          <Button
            size="lg"
            className="cursor-pointer text-primary-foreground font-semibold px-8 py-3 dark:text-white"
          >
            {/* Button */}
            Go to Dashboard
          </Button>
        </Link>
      </main>
    </>
  );
}
