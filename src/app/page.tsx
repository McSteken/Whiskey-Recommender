import Image from "next/image";
import Card from "@/components/card";
import Results from "@/components/results";
import Search from "@/components/search";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] w-full">
      <main className="flex flex-col gap-8 items-center w-full">
      <Image
          //className="dark:invert"
          src="/logo.png"
          alt="Next.js logo"
          width={100}
          height={38}
          priority
        />
        
        <Search />
   
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://dellacqua.se/education/courses/tnm108/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          TNM108 Website →
        </a>
      </footer>
    </div>
  );
}
