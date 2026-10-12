import Deck, { type DeckPage } from "@/components/deck/Deck";
import HeroPage from "@/components/pages/HeroPage";
import AboutPage from "@/components/pages/AboutPage";
import WorkPage from "@/components/pages/WorkPage";
import BlogsPage from "@/components/pages/BlogsPage";
import AnimePage from "@/components/pages/AnimePage";
import GamePage from "@/components/pages/GamePage";
import SongsPage from "@/components/pages/SongsPage";
import LinksPage from "@/components/pages/LinksPage";

export default function Home() {
  const pages: DeckPage[] = [
    { id: "home", label: "Home", node: <HeroPage /> },
    { id: "about", label: "About", node: <AboutPage /> },
    { id: "work", label: "Work", node: <WorkPage /> },
    { id: "blogs", label: "Blogs", node: <BlogsPage /> },
    { id: "anime", label: "Anime", node: <AnimePage /> },
    { id: "games", label: "Games", node: <GamePage /> },
    { id: "songs", label: "Songs", node: <SongsPage /> },
    { id: "links", label: "Links", node: <LinksPage /> },
  ];
  return <Deck pages={pages} />;
}
