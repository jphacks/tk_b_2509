import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/consts/APP_NAME";
import { ROUTES } from "@/consts/ROUTES";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ヒーロー */}
      <HeroSection />

      {/* 特徴（ペルソナの課題に対応） */}
      <FeaturesSection />

      {/* CTA */}
      <CtaSection />

      {/* フッター */}
      <Footer />
    </div>
  );
}

function HeroSection() {
  const moods = [
    { label: "リラックス", emoji: "😌" },
    { label: "集中", emoji: "🎧" },
    { label: "発想", emoji: "💡" },
    { label: "雑談したい", emoji: "💬" },
  ];
  return (
    <section className="pt-32 pb-10 px-4 max-w-6xl mx-auto text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
        気分で選べる、はかどる作業場所。
      </h1>
      <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-3xl mx-auto">
        「フィード」から本当に作業しやすい場所が見つかる。
        <br className="hidden md:block" />
        カフェや図書館だけじゃない。公園や海辺など、思いがけない場所との出会いも。
      </p>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {moods.map((m) => (
          <span
            key={m.label}
            className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 bg-white"
          >
            <span className="mr-1">{m.emoji}</span>
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex gap-4 justify-center">
        <Link
          href="/signup"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center"
        >
          はじめる
          <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
        <Link
          href={ROUTES.map}
          className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          スポットを見る
        </Link>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-12">
          {APP_NAME}の特徴
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
            title="フィードから見つかる"
            desc="雰囲気や混雑度など“作業のしやすさ”が伝わるユーザーの投稿から直感的に発見。"
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6 text-green-600" />}
            title="気分タグで探せる"
            desc="リラックス/集中/発想/雑談したい…その時の“気分”で最適な場所を。"
          />
          {/* <FeatureCard
            icon={<Bell className="w-6 h-6 text-purple-600" />}
            title="ゆるいつながり通知"
            desc="「あなたのおすすめに行きました」通知で、適度なつながりとモチベ維持。"
          /> */}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          今すぐはじめよう
        </h2>
        <p className="opacity-90 mb-8">
          あなたの“はかどる場所”が、きっと見つかる。
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-slate-100"
        >
          無料で会員登録 <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 text-center text-slate-500 text-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image
            src="/logo.webp"
            alt={APP_NAME}
            width={20}
            height={20}
            className="w-5 h-5"
          />
          <span className="font-semibold text-slate-700">{APP_NAME}</span>
        </div>
        <p>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
