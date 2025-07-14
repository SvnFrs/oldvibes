import {
  IconPhoto,
  IconClock,
  IconUsers,
  IconSearch,
  IconMessageCircle,
  IconCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import Wrapper from "./_sections/wrapper";

export default function HomePage() {
  return (
    <Wrapper>
      {/* Hero Section */}
      <section className="relative bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 py-16 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark w-16 h-16 rounded-xl flex items-center justify-center shadow-md">
              <Image
                src="/oldvibes-small.png"
                alt="Old Vibes logo"
                width={64}
                height={64}
                className="rounded-md object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-mono text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-3">
            Share &amp; Sell Your Old Vibes
          </h1>
          <p className="text-lg text-gruvbox-gray mb-6">
            Snap, share, and sell your preloved goods in a fun, story-like way.
            Connect with friends and the community—discover unique finds, or
            give your old treasures a new home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
            <a
              href="#download"
              className="inline-block px-6 py-3 rounded-lg bg-gruvbox-orange text-gruvbox-bg font-bold shadow hover:bg-gruvbox-yellow transition text-lg"
            >
              Download the App
            </a>
            <a
              href="#features"
              className="inline-block px-6 py-3 rounded-lg border border-gruvbox-orange text-gruvbox-orange font-bold hover:bg-gruvbox-orange hover:text-gruvbox-dark-bg0 transition text-lg"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-5xl mx-auto py-12 px-4 sm:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-mono text-gruvbox-orange-light dark:text-gruvbox-orange-dark text-center mb-8">
          How Old Vibes Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="bg-gruvbox-blue-dark/10 dark:bg-gruvbox-blue-light/10 rounded-xl p-4 mb-3">
              <IconPhoto size={36} className="text-gruvbox-blue" />
            </div>
            <h3 className="font-bold font-mono mb-2">Share Stories</h3>
            <p className="text-gruvbox-gray text-sm">
              Post photos or videos of your used goods as reels or stories. Add
              descriptions, prices, and tags to help buyers discover your items.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gruvbox-yellow-dark/10 dark:bg-gruvbox-yellow-light/10 rounded-xl p-4 mb-3">
              <IconClock size={36} className="text-gruvbox-yellow" />
            </div>
            <h3 className="font-bold font-mono mb-2">24-Hour Vibes</h3>
            <p className="text-gruvbox-gray text-sm">
              Your posts are live for 24 hours, then archived. Keep the feed
              fresh and discover new treasures every day!
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="bg-gruvbox-green-dark/10 dark:bg-gruvbox-green-light/10 rounded-xl p-4 mb-3">
              <IconUsers size={36} className="text-gruvbox-green" />
            </div>
            <h3 className="font-bold font-mono mb-2">Connect &amp; Trade</h3>
            <p className="text-gruvbox-gray text-sm">
              Chat, comment, and follow users. No checkout—just message sellers
              directly to buy and arrange delivery.
            </p>
          </div>
        </div>
      </section>

      {/* Community & Trust Section */}
      <section className="max-w-4xl mx-auto py-10 px-4 sm:px-8">
        <div className="bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow">
          <div className="flex-1">
            <h3 className="text-xl font-bold font-mono text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-2">
              Safe, Simple, and Social
            </h3>
            <ul className="text-gruvbox-gray text-sm space-y-2">
              <li className="flex items-center gap-2">
                <IconCheck size={18} className="text-gruvbox-green" />
                All posts are reviewed by staff for legitimacy.
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={18} className="text-gruvbox-green" />
                No fees, no checkout—just connect and trade.
              </li>
              <li className="flex items-center gap-2">
                <IconCheck size={18} className="text-gruvbox-green" />
                Like, comment, and share to build a trusted community.
              </li>
            </ul>
          </div>
          <div className="flex-1 flex justify-center">
            <Image
              src="https://www.todayifoundout.com/wp-content/uploads/2017/11/rick-astley.png"
              alt="App preview"
              width={220}
              height={440}
              className="rounded-xl shadow-lg border border-gruvbox-gray"
            />
          </div>
        </div>
      </section>

      {/* Search & Explore Section */}
      <section className="max-w-5xl mx-auto py-10 px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-bold font-mono text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-2">
              Find Your Next Treasure
            </h3>
            <p className="text-gruvbox-gray text-sm mb-4">
              Search for specific items, browse by category, or explore trending
              vibes and popular users. Follow your friends to see their latest
              finds!
            </p>
            <ul className="text-gruvbox-gray text-sm space-y-2">
              <li className="flex items-center gap-2">
                <IconSearch size={18} className="text-gruvbox-blue" />
                Powerful search &amp; filters
              </li>
              <li className="flex items-center gap-2">
                <IconUsers size={18} className="text-gruvbox-green" />
                Follow users &amp; build your feed
              </li>
              <li className="flex items-center gap-2">
                <IconMessageCircle size={18} className="text-gruvbox-purple" />
                DM sellers or comment on posts
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <Image
              src="https://www.todayifoundout.com/wp-content/uploads/2017/11/rick-astley.png"
              alt="Explore preview"
              width={320}
              height={220}
              className="rounded-xl shadow border border-gruvbox-gray"
            />
          </div>
        </div>
      </section>

      {/* FAQ / Info Section */}
      <section className="max-w-3xl mx-auto py-10 px-4 sm:px-8">
        <h3 className="text-xl font-bold font-mono text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-4 text-center">
          Frequently Asked
        </h3>
        <div className="space-y-6 text-gruvbox-gray text-sm">
          <div>
            <span className="font-bold text-gruvbox-orange">
              How do I sell something?
            </span>
            <p>
              Download the app, snap photos or videos of your item, add details,
              and post as a vibe. Our staff will review your post before it goes
              live.
            </p>
          </div>
          <div>
            <span className="font-bold text-gruvbox-orange">
              How do I buy something?
            </span>
            <p>
              Browse or search for items. If you find something you like,
              message the seller directly to arrange payment and delivery.
            </p>
          </div>
          <div>
            <span className="font-bold text-gruvbox-orange">
              Is there a fee?
            </span>
            <p>
              No! Old Vibes is free to use. We just help you connect with buyers
              and sellers.
            </p>
          </div>
          <div>
            <span className="font-bold text-gruvbox-orange">
              What happens after 24 hours?
            </span>
            <p>
              Your post is archived, but you can always repost or manage your
              vibes in the app.
            </p>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section
        id="download"
        className="max-w-3xl mx-auto py-12 px-4 sm:px-8 text-center"
      >
        <h2 className="text-2xl font-bold font-mono text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-4">
          Ready to Share Your Old Vibes?
        </h2>
        <p className="text-gruvbox-gray mb-6">
          Download the Old Vibes app and start sharing, selling, and discovering
          unique finds today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="inline-block px-6 py-3 rounded-lg bg-gruvbox-orange text-gruvbox-bg font-bold shadow hover:bg-gruvbox-yellow transition text-lg"
          >
            Download for iOS
          </a>
          <a
            href="#"
            className="inline-block px-6 py-3 rounded-lg border border-gruvbox-orange text-gruvbox-orange font-bold hover:bg-gruvbox-orange hover:text-gruvbox-dark-bg0 transition text-lg"
          >
            Download for Android
          </a>
        </div>
      </section>
    </Wrapper>
  );
}
