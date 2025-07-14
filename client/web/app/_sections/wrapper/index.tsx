import Footer from "./footer";
import Header from "./header";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
